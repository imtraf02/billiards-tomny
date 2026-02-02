import { jwt } from "@elysiajs/jwt";
import { t } from "elysia";
import { env } from "@/env";

export const accessToken = jwt({
	name: "accessToken",
	secret: env.ACCESS_TOKEN,
	exp: "30m",
	schema: t.Object({
		uid: t.String(),
	}),
});
