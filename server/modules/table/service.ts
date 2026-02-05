import prisma from "@/lib/db";
import type {
	CreateTableInput,
	UpdateTableInput,
} from "@/shared/schemas/table";

export abstract class TableService {
	static async create(data: CreateTableInput) {
		return await prisma.table.create({
			data,
		});
	}

	static async getAll() {
		return await prisma.table.findMany({
			orderBy: { name: "asc" },
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
