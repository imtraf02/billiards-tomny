import Elysia from "elysia";
import { getFinanceAnalyticsQuerySchema } from "@/shared/schemas/finance";
import { FinanceService } from "./service";

export const financeRoutes = new Elysia({ prefix: "/finance" }).get(
	"/analytics",
	async ({ query }) => {
		const analytics = await FinanceService.getAnalytics(query);
		return analytics;
	},
	{
		query: getFinanceAnalyticsQuerySchema,
	},
);
