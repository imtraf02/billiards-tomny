import { z } from "zod";

export const nameField = (entityType: string, maxLength: number) =>
	z
		.string()
		.min(1, { message: `Tên ${entityType} là bắt buộc` })
		.max(maxLength, { message: `Tên ${entityType} quá dài` });

export const uuidField = (entityType: string) =>
	z.uuidv7({
		message: `${entityType} không hợp lệ`,
	});
