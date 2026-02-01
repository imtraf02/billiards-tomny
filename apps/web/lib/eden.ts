import { treaty } from "@elysiajs/eden";
import { app } from "@/server";

// .api to enter /api prefix
export const api =
	// process is defined on server side and build time
	typeof process !== "undefined"
		? treaty(app).api
		: treaty<typeof app>("localhost:3000").api;
