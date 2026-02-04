"use client";

import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useEffect, useRef } from "react";

interface InvoiceData {
	booking: {
		id: string;
		startTime: string | Date;
		endTime?: string | Date | null;
		note?: string | null;
		user?: {
			name?: string | null;
			email?: string | null;
		} | null;
		bookingTables: {
			id: string;
			startTime: string | Date;
			endTime?: string | Date | null;
			priceSnapshot: number;
			table: {
				name: string;
			};
		}[];
		orders?: {
			id: string;
			status: string;
			orderItems: {
				id: string;
				quantity: number;
				priceSnapshot: number;
				product: {
					name: string;
				};
			}[];
		}[];
		transaction?: {
			paymentMethod: string;
			createdAt: string | Date;
		} | null;
	};
	totalAmount: number;
	timeTotal: number;
	serviceTotal: number;
}

interface InvoicePrintProps {
	data: InvoiceData;
	onPrintComplete?: () => void;
}

export function InvoicePrint({ data, onPrintComplete }: InvoicePrintProps) {
	const printRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handlePrint = () => {
			if (printRef.current) {
				const printWindow = window.open("", "_blank");
				if (!printWindow) return;

				const content = printRef.current.innerHTML;
				printWindow.document.write(`
					<!DOCTYPE html>
					<html>
						<head>
							<meta charset="utf-8">
							<title>Hóa đơn #${data.booking.id.slice(0, 8)}</title>
							<style>
								* {
									margin: 0;
									padding: 0;
									box-sizing: border-box;
								}
								body {
									font-family: 'Arial', sans-serif;
									padding: 20px;
									max-width: 800px;
									margin: 0 auto;
									font-size: 14px;
									line-height: 1.5;
								}
								.invoice-container {
									border: 1px solid #ddd;
									padding: 30px;
									background: white;
								}
								.header {
									text-align: center;
									margin-bottom: 30px;
									border-bottom: 2px solid #333;
									padding-bottom: 20px;
								}
								.header h1 {
									font-size: 28px;
									margin-bottom: 5px;
									text-transform: uppercase;
								}
								.header p {
									color: #666;
									font-size: 14px;
								}
								.invoice-info {
									display: grid;
									grid-template-columns: 1fr 1fr;
									gap: 20px;
									margin-bottom: 30px;
								}
								.info-section {
									padding: 15px;
									background: #f9f9f9;
									border-radius: 4px;
								}
								.info-section h3 {
									font-size: 14px;
									margin-bottom: 10px;
									color: #333;
									text-transform: uppercase;
									letter-spacing: 0.5px;
								}
								.info-section p {
									margin: 5px 0;
									color: #555;
								}
								.info-label {
									font-weight: bold;
									display: inline-block;
									width: 120px;
								}
								table {
									width: 100%;
									border-collapse: collapse;
									margin: 20px 0;
								}
								th {
									background: #333;
									color: white;
									padding: 12px;
									text-align: left;
									font-weight: bold;
									text-transform: uppercase;
									font-size: 12px;
								}
								td {
									padding: 10px 12px;
									border-bottom: 1px solid #ddd;
								}
								tr:hover {
									background: #f5f5f5;
								}
								.text-right {
									text-align: right;
								}
								.text-center {
									text-align: center;
								}
								.summary {
									margin-top: 30px;
									padding: 20px;
									background: #f9f9f9;
									border-radius: 4px;
								}
								.summary-row {
									display: flex;
									justify-content: space-between;
									padding: 8px 0;
									font-size: 14px;
								}
								.summary-row.total {
									border-top: 2px solid #333;
									margin-top: 10px;
									padding-top: 15px;
									font-size: 18px;
									font-weight: bold;
								}
								.footer {
									margin-top: 40px;
									text-align: center;
									padding-top: 20px;
									border-top: 1px dashed #999;
									color: #666;
									font-size: 13px;
								}
								.section-title {
									font-size: 16px;
									font-weight: bold;
									margin: 25px 0 10px;
									text-transform: uppercase;
									color: #333;
								}
								@media print {
									body {
										padding: 0;
									}
									.invoice-container {
										border: none;
										padding: 0;
									}
									tr:hover {
										background: transparent;
									}
								}
							</style>
						</head>
						<body>
							${content}
							<script>
								window.onload = function() {
									window.print();
									window.onafterprint = function() {
										window.close();
									};
								};
							</script>
						</body>
					</html>
				`);
				printWindow.document.close();
				onPrintComplete?.();
			}
		};

		handlePrint();
	}, [data, onPrintComplete]);

	const calculateTableCost = (bt: any) => {
		const end = bt.endTime
			? new Date(bt.endTime)
			: data.booking.endTime
				? new Date(data.booking.endTime)
				: new Date();
		const start = new Date(bt.startTime);
		const diff = end.getTime() - start.getTime();
		const hours = diff / (1000 * 60 * 60);
		return Math.ceil((hours * bt.priceSnapshot) / 1000) * 1000;
	};

	const calculateDuration = (bt: any) => {
		const end = bt.endTime
			? new Date(bt.endTime)
			: data.booking.endTime
				? new Date(data.booking.endTime)
				: new Date();
		const start = new Date(bt.startTime);
		const diff = end.getTime() - start.getTime();
		const hours = Math.floor(diff / (1000 * 60 * 60));
		const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
		return `${hours}h ${minutes}p`;
	};

	const paymentMethodLabels: Record<string, string> = {
		CASH: "Tiền mặt",
		CARD: "Thẻ",
		TRANSFER: "Chuyển khoản",
		MOMO: "MoMo",
		ZALOPAY: "ZaloPay",
	};

	return (
		<div ref={printRef} style={{ display: "none" }}>
			<div className="invoice-container">
				<div className="header">
					<h1>Hóa đơn thanh toán</h1>
					<p>Quán Bida Tom-Ny</p>
					<p>Mã hóa đơn: #{data.booking.id.slice(0, 8).toUpperCase()}</p>
				</div>

				<div className="invoice-info">
					<div className="info-section">
						<h3>Thông tin khách hàng</h3>
						<p>
							<span className="info-label">Tên:</span>
							{data.booking.user?.name || "Khách vãng lai"}
						</p>
						{data.booking.user?.email && (
							<p>
								<span className="info-label">Email:</span>
								{data.booking.user.email}
							</p>
						)}
					</div>

					<div className="info-section">
						<h3>Thông tin hóa đơn</h3>
						<p>
							<span className="info-label">Ngày:</span>
							{format(new Date(data.booking.startTime), "dd/MM/yyyy", {
								locale: vi,
							})}
						</p>
						<p>
							<span className="info-label">Giờ vào:</span>
							{format(new Date(data.booking.startTime), "HH:mm", { locale: vi })}
						</p>
						{data.booking.endTime && (
							<p>
								<span className="info-label">Giờ ra:</span>
								{format(new Date(data.booking.endTime), "HH:mm", { locale: vi })}
							</p>
						)}
						{data.booking.transaction && (
							<>
								<p>
									<span className="info-label">Giờ thanh toán:</span>
									{format(new Date(data.booking.transaction.createdAt), "HH:mm", {
										locale: vi,
									})}
								</p>
								<p>
									<span className="info-label">Thanh toán:</span>
									{paymentMethodLabels[data.booking.transaction.paymentMethod] ||
										data.booking.transaction.paymentMethod}
								</p>
							</>
						)}
					</div>
				</div>

				<div className="section-title">Chi tiết bàn chơi</div>
				<table>
					<thead>
						<tr>
							<th>Bàn</th>
							<th>Giờ bắt đầu</th>
							<th>Giờ kết thúc</th>
							<th className="text-center">Thời gian</th>
							<th className="text-right">Giá/giờ</th>
							<th className="text-right">Thành tiền</th>
						</tr>
					</thead>
					<tbody>
						{data.booking.bookingTables.map((bt) => {
							const cost = calculateTableCost(bt);
							const duration = calculateDuration(bt);
							return (
								<tr key={bt.id}>
									<td>{bt.table.name}</td>
									<td>
										{format(new Date(bt.startTime), "HH:mm", { locale: vi })}
									</td>
									<td>
										{bt.endTime
											? format(new Date(bt.endTime), "HH:mm", { locale: vi })
											: data.booking.endTime
												? format(new Date(data.booking.endTime), "HH:mm", {
														locale: vi,
													})
												: "---"}
									</td>
									<td className="text-center">{duration}</td>
									<td className="text-right">
										{new Intl.NumberFormat("vi-VN").format(bt.priceSnapshot)} đ
									</td>
									<td className="text-right">
										{new Intl.NumberFormat("vi-VN").format(cost)} đ
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>

				{data.booking.orders &&
					data.booking.orders.filter((o) => o.status !== "CANCELLED").length >
						0 && (
						<>
							<div className="section-title">Dịch vụ & Đồ uống</div>
							<table>
								<thead>
									<tr>
										<th>Tên món</th>
										<th className="text-center">Số lượng</th>
										<th className="text-right">Đơn giá</th>
										<th className="text-right">Thành tiền</th>
									</tr>
								</thead>
								<tbody>
									{data.booking.orders
										.filter((o) => o.status !== "CANCELLED")
										.flatMap((o) => o.orderItems)
										.map((item) => (
											<tr key={item.id}>
												<td>{item.product.name}</td>
												<td className="text-center">{item.quantity}</td>
												<td className="text-right">
													{new Intl.NumberFormat("vi-VN").format(
														item.priceSnapshot,
													)}{" "}
													đ
												</td>
												<td className="text-right">
													{new Intl.NumberFormat("vi-VN").format(
														item.priceSnapshot * item.quantity,
													)}{" "}
													đ
												</td>
											</tr>
										))}
								</tbody>
							</table>
						</>
					)}

				{data.booking.note && (
					<div style={{ marginTop: "20px", fontSize: "13px", fontStyle: "italic", color: "#666" }}>
						<p><strong>Ghi chú:</strong> "{data.booking.note}"</p>
					</div>
				)}

				<div className="summary">
					<div className="summary-row">
						<span>Tiền giờ chơi:</span>
						<span>{new Intl.NumberFormat("vi-VN").format(data.timeTotal)} đ</span>
					</div>
					<div className="summary-row">
						<span>Tiền dịch vụ:</span>
						<span>
							{new Intl.NumberFormat("vi-VN").format(data.serviceTotal)} đ
						</span>
					</div>
					<div className="summary-row total">
						<span>TỔNG CỘNG:</span>
						<span>
							{new Intl.NumberFormat("vi-VN").format(data.totalAmount)} đ
						</span>
					</div>
				</div>

				<div className="footer">
					<p>Cảm ơn quý khách đã sử dụng dịch vụ!</p>
					<p>Hẹn gặp lại quý khách!</p>
					<p style={{ marginTop: "10px", fontSize: "12px" }}>
						In lúc: {format(new Date(), "HH:mm, dd/MM/yyyy", { locale: vi })}
					</p>
				</div>
			</div>
		</div>
	);
}
