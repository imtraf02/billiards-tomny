import prisma from "@/lib/db";
import { AppError } from "@/server/utils/errors";
import type {
	CreateTableInput,
	UpdateTableInput,
} from "@/shared/schemas/table";

export abstract class TableService {
	static async createTable(data: CreateTableInput) {
		return await prisma.table.create({ data });
	}

	static async getAllTables() {
		return await prisma.table.findMany({
			orderBy: { name: "asc" },
			include: {
				sessions: {
					where: { endTime: null },
					orderBy: { startTime: "desc" },
					take: 1,
				},
			},
		});
	}

	static async getTableById(id: string) {
		return await prisma.table.findUnique({
			where: { id },
			include: {
				sessions: {
					where: { endTime: null },
					orderBy: { startTime: "desc" },
					take: 1,
				},
			},
		});
	}

	static async updateTable(id: string, data: UpdateTableInput) {
		return await prisma.table.update({
			where: { id },
			data,
		});
	}

	static async deleteTable(id: string) {
		return await prisma.table.delete({
			where: { id },
		});
	}

	static async startSession(id: string) {
		const table = await prisma.table.findUnique({
			where: { id },
			include: {
				sessions: {
					where: { endTime: null },
					orderBy: { startTime: "desc" },
					take: 1,
				},
			},
		});

		if (!table) {
			throw new AppError("Bàn không tồn tại", 404);
		}

		if (table.status !== "AVAILABLE" || table.sessions.length > 0) {
			throw new AppError("Bàn đã có khách", 400);
		}

		const result = await prisma.$transaction(async (tx) => {
			const session = await tx.tableSession.create({
				data: { tableId: id },
				include: {
					table: true,
				},
			});

			await tx.table.update({
				where: { id },
				data: {
					status: "OCCUPIED",
				},
			});

			return session;
		});

		return result;
	}
}
