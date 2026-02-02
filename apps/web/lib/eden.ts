import { treaty } from "@elysiajs/eden";
import { type App, app } from "@/server";

export const api = treaty<App>("http://localhost:3000").api;
