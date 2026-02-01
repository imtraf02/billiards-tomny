import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	server: {
		DATABASE_URL: z.url(),
		ACCESS_TOKEN: z.string().min(1),
		IS_PROD: z.boolean().default(false),
	},
	client: {
		// NEXT_PUBLIC_PUBLISHABLE_KEY: z.string().min(1),
	},
	runtimeEnv: {
		DATABASE_URL: process.env.DATABASE_URL,
		ACCESS_TOKEN: process.env.ACCESS_TOKEN,
		IS_PROD: process.env.NODE_ENV === "production",
		// NEXT_PUBLIC_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY,
	},
});
