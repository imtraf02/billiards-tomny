import prisma from "@/lib/db";
import { AppError } from "@/server/utils/errors";
import type { MutateOrderInput } from "@/shared/schemas/order";

export abstract class OrderService {
	static async mutateOrder(
		{ orderId, type, sessionId, products }: MutateOrderInput,
		userId: string,
	) {
		const productIds = products.map((p) => p.productId);

		// Validate session nếu có
		let session = null;
		if (sessionId) {
			session = await prisma.tableSession.findUnique({
				where: { id: sessionId },
				include: { table: true },
			});

			if (!session) {
				throw new AppError("Phiên chơi không tồn tại", 404);
			}
			if (session.endTime !== null) {
				throw new AppError("Phiên chơi đã kết thúc", 400);
			}
		}

		// Validate products
		const foundProducts = await prisma.product.findMany({
			where: { id: { in: productIds } },
		});

		if (foundProducts.length !== productIds.length) {
			throw new AppError("Một số sản phẩm không tồn tại", 404);
		}

		const productMap: Record<string, (typeof foundProducts)[number]> =
			Object.fromEntries(foundProducts.map((p) => [p.id, p]));

		return await prisma.$transaction(async (tx) => {
			let order = null;

			// UPDATE: Nếu có orderId
			if (orderId) {
				// Lấy order hiện tại
				const existingOrder = await tx.order.findUnique({
					where: { id: orderId },
					include: {
						products: {
							include: {
								batchSales: true,
							},
						},
					},
				});

				if (!existingOrder) {
					throw new AppError("Đơn hàng không tồn tại", 404);
				}

				// Kiểm tra quyền (chỉ cho phép sửa order của mình hoặc là admin)
				// if (existingOrder.userId !== userId) {
				//   throw new AppError("Không có quyền chỉnh sửa đơn hàng này", 403);
				// }

				// HOÀN TRẢ tồn kho từ order cũ (FIFO reverse)
				for (const orderProduct of existingOrder.products) {
					// Hoàn trả số lượng về các batch đã xuất
					for (const batchSale of orderProduct.batchSales) {
						await tx.inventoryBatch.update({
							where: { id: batchSale.batchId },
							data: {
								quantity: {
									increment: batchSale.quantity,
								},
							},
						});
					}

					// Xóa batch sales cũ
					await tx.batchSale.deleteMany({
						where: { orderProductId: orderProduct.id },
					});
				}

				// Xóa order products cũ
				await tx.orderProduct.deleteMany({
					where: { orderId },
				});

				order = existingOrder;
			}
			// CREATE: Nếu không có orderId
			else {
				order = await tx.order.create({
					data: {
						type: sessionId ? "SESSION" : type,
						status: "PENDING",
						userId,
						sessionId: sessionId || null,
					},
				});
			}

			// TẠO MỚI order products với logic FIFO
			for (const item of products) {
				const product = productMap[item.productId];
				if (!product) {
					throw new AppError("Lỗi dữ liệu sản phẩm", 500);
				}

				// Lấy batches theo FIFO
				const batches = await tx.inventoryBatch.findMany({
					where: {
						productId: item.productId,
						quantity: { gt: 0 },
					},
					orderBy: { importedAt: "asc" },
				});

				const totalStock = batches.reduce((sum, b) => sum + b.quantity, 0);
				if (totalStock < item.quantity) {
					throw new AppError(
						`Sản phẩm "${product.name}" không đủ tồn kho. Còn ${totalStock}, cần ${item.quantity}`,
						400,
					);
				}

				// FIFO logic
				let remainingQty = item.quantity;
				let totalCost = 0;
				const batchSales = [];

				for (const batch of batches) {
					if (remainingQty <= 0) break;

					const qtyFromBatch = Math.min(remainingQty, batch.quantity);
					const costFromBatch = qtyFromBatch * batch.costPerUnit;

					batchSales.push({
						batchId: batch.id,
						quantity: qtyFromBatch,
						costPerUnit: batch.costPerUnit,
					});

					totalCost += costFromBatch;
					remainingQty -= qtyFromBatch;

					await tx.inventoryBatch.update({
						where: { id: batch.id },
						data: { quantity: batch.quantity - qtyFromBatch },
					});
				}

				const avgCost = Math.round(totalCost / item.quantity);

				const orderProduct = await tx.orderProduct.create({
					data: {
						orderId: order.id,
						productId: item.productId,
						quantity: item.quantity,
						price: product.price,
						cost: avgCost,
					},
				});

				await tx.batchSale.createMany({
					data: batchSales.map((bs) => ({
						batchId: bs.batchId,
						orderProductId: orderProduct.id,
						quantity: bs.quantity,
						costPerUnit: bs.costPerUnit,
					})),
				});
			}

			// Trả về order đầy đủ
			const fullOrder = await tx.order.findUnique({
				where: { id: order.id },
				include: {
					products: {
						include: { product: true },
					},
					user: {
						select: {
							id: true,
							name: true,
						},
					},
				},
			});

			return fullOrder;
		});
	}

	static async getOrderBySession(sessionId: string) {
		return await prisma.order.findMany({
			where: { sessionId },
			include: {
				products: {
					include: { product: true },
				},
				user: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		});
	}
}
