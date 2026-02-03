import { Elysia } from "elysia";
import { DashboardService } from "./service";

export const dashboard = new Elysia({ prefix: "/dashboard" })
	.get("/metrics", async () => {
		return await DashboardService.getMetrics();
	})
	.get("/recent", async () => {
		return await DashboardService.getRecentActivity();
	});
