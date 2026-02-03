import { Elysia } from "elysia";
import { authorization } from "@/server/plugins/authorization";
import {
	createTransactionSchema,
	getTransactionsQuerySchema,
} from "../../../shared/schemas/transaction";
import { TransactionService } from "./service";
import { Role } from "@/generated/prisma/enums";

export const transaction = new Elysia({ prefix: "/transactions" })
	.use(authorization)
	.get(
		"/",
		async ({ query }) => {
			return await TransactionService.getTransactions(query);
		},
		{
			query: getTransactionsQuerySchema,
			detail: {
				tags: ["Transactions"],
				summary: "Lấy danh sách giao dịch (có phân trang & lọc)",
			},
		},
	)
	.post(
		"/",
		async ({ body, user }) => {
			return await TransactionService.create(body, user.id);
		},
		{
			body: createTransactionSchema,
			authorized: [Role.ADMIN],
			detail: {
				tags: ["Transactions"],
				summary: "Tạo giao dịch mới (Thu/Chi/Điều chỉnh)",
			},
		},
	);
