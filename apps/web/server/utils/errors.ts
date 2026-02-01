export class AppError extends Error {
	public readonly status: number;

	constructor(message: string, status = 400, options?: ErrorOptions) {
		super(message, options);
		this.status = status;
	}

	toResponse() {
		return Response.json(
			{
				type: this.constructor.name,
				error: this.message,
			},
			{ status: this.status },
		);
	}
}

export class NotFoundError extends AppError {
	constructor(message = "Không tìm thấy") {
		super(message, 404);
	}
}

export class BadRequestError extends AppError {
	constructor(message = "Yêu cầu không hợp lệ") {
		super(message, 400);
	}
}

export class UnauthorizedError extends AppError {
	constructor(message = "Chưa được xác thực") {
		super(message, 401);
	}
}

export class ForbiddenError extends AppError {
	constructor(message = "Không có quyền truy cập") {
		super(message, 403);
	}
}
