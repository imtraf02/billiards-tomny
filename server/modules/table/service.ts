import type { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/db";
import type {
	CreateTableInput,
	GetTablesQuery,
	UpdateTableInput,
} from "@/shared/schemas/table";

export abstract class TableService {
	static async create(data: CreateTableInput) {
		return await prisma.table.create({
			data,
		});
	}

	static async getAll(query: GetTablesQuery = {}) {
		const where: Prisma.TableWhereInput = {};

		if (query.search) {
			where.name = { contains: query.search, mode: "insensitive" };
		}

		if (query.type) {
			where.type = query.type;
		}

		if (query.status) {
			where.status = query.status;
		}

		return await prisma.table.findMany({
			where,
			orderBy: {
				name: "asc",
			},
			include: {
				bookingTables: {
					where: {
						endTime: null,
					},
					include: {
						booking: {
							select: {
								id: true,
								startTime: true,
							},
						},
					},
				},
			},
		});
	}

	static async getById(id: string) {
		return await prisma.table.findUnique({
			where: { id },
		});
	}

	static async update(id: string, data: UpdateTableInput) {
		return await prisma.table.update({
			where: { id },
			data,
		});
	}

	static async delete(id: string) {
		return await prisma.table.delete({
			where: { id },
		});
	}
}
