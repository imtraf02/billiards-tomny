import { Elysia } from "elysia";
import { AppError } from "../utils/errors";

function isPrismaKnownRequestError(
	error: unknown,
): error is { code: string; meta?: Record<string, unknown> } {
	return (
		error instanceof Error &&
		"code" in error &&
		typeof (error as { code: unknown }).code === "string" &&
		(error as { code: string }).code.startsWith("P")
	);
}

export const errorHandler = new Elysia({
	name: "error-handler",
})
	.onError(({ code, error, set }) => {
		set.headers["content-type"] = "application/json; charset=utf8";

		if (error instanceof AppError) {
			return error.toResponse();
		}

		if (isPrismaKnownRequestError(error)) {
			// Unique constraint violation (e.g., duplicated email)
			if (error.code === "P2002") {
				set.status = 409;
				return {
					type: "ConflictError",
					error: "Dữ liệu đã tồn tại",
				};
			}

			// Record not found
			if (error.code === "P2025") {
				set.status = 404;
				return {
					type: "NotFoundError",
					error: "Không tìm thấy dữ liệu",
				};
			}

			// Foreign key constraint failed
			if (error.code === "P2003") {
				set.status = 400;
				return {
					type: "ForeignKeyError",
					error: "Ràng buộc dữ liệu không hợp lệ",
				};
			}
		}

		if (code === "NOT_FOUND") {
			set.status = 404;
			return {
				type: "NotFoundError",
				error: "Không tìm thấy đường dẫn",
			};
		}

		// Default error
		console.error(error);
		set.status = 500;
		return {
			type: "InternalServerError",
			error: "Lỗi hệ thống",
		};
	})
	.as("global");
