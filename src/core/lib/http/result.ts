// Enhanced Result Type with Rich HTTP Responses
// Based on Rust-like Result<T, E> with structured metadata

export type AppError = {
	code: string; // Machine-readable error code (NOT_FOUND, UNAUTHORIZED, etc.)
	message: string; // Human-friendly detail
	details?: Record<string, unknown>; // Additional context
};

export type Result<T, E extends AppError = AppError> =
	| { ok: true; value: T }
	| { ok: false; error: E };

export const ok = <T>(value: T): Result<T> => ({ ok: true, value });
export const err = <E extends AppError>(error: E): Result<never, E> => ({
	ok: false,
	error,
});

// Readable static methods for junior developers
export const Result = {
	/** Creates a successful result */
	ok,

	/** Creates a failed result */
	failed: err,
};

export type SuccessEnvelope<T> = {
	success: true;
	data: T;
	meta: {
		requestId: string;
		timestamp: string;
	};
};

export type ErrorEnvelope = {
	success: false;
	error: AppError;
	meta: {
		requestId: string;
		timestamp: string;
		retryable: boolean;
	};
};

export type JsonResponse<T> = {
	status: number;
	headers: Record<string, string>;
	body: string;
};

const statusFromErrorCode = (code: string): number => {
	switch (code) {
		case "UNAUTHORIZED":
			return 401;
		case "FORBIDDEN":
			return 403;
		case "NOT_FOUND":
			return 404;
		case "CONFLICT":
			return 409;
		case "RATE_LIMITED":
			return 429;
		case "VALIDATION_ERROR":
			return 400;
		case "INTERNAL_ERROR":
			return 500;
		default:
			return 400;
	}
};

export const toJsonResponse = <T>(
	result: Result<T>,
	context: { requestId: string; retryableErrors?: string[] },
): JsonResponse<T | AppError> => {
	const timestamp = new Date().toISOString();
	const headers = { "content-type": "application/json" };

	if (result.ok) {
		const body: SuccessEnvelope<T> = {
			success: true,
			data: result.value,
			meta: {
				requestId: context.requestId,
				timestamp,
			},
		};

		return {
			status: 200,
			headers,
			body: JSON.stringify(body),
		};
	}

	const retryableCodes = context.retryableErrors ?? [
		"RATE_LIMITED",
		"CONFLICT",
	];
	const body: ErrorEnvelope = {
		success: false,
		error: result.error,
		meta: {
			requestId: context.requestId,
			timestamp,
			retryable: retryableCodes.includes(result.error.code),
		},
	};

	return {
		status: statusFromErrorCode(result.error.code),
		headers,
		body: JSON.stringify(body),
	};
};

export const createError = (
	code: string,
	message: string,
	details?: Record<string, unknown>,
): AppError => ({
	code,
	message,
	details,
});

// Common error creators for convenience
export const errors = {
	unauthorized: (message = "Unauthorized"): AppError =>
		createError("UNAUTHORIZED", message),
	forbidden: (message = "Forbidden"): AppError =>
		createError("FORBIDDEN", message),
	notFound: (message = "Resource not found"): AppError =>
		createError("NOT_FOUND", message),
	conflict: (message = "Conflict"): AppError =>
		createError("CONFLICT", message),
	rateLimited: (message = "Too many requests"): AppError =>
		createError("RATE_LIMITED", message),
	validationError: (
		message: string,
		details?: Record<string, unknown>,
	): AppError => createError("VALIDATION_ERROR", message, details),
	internalError: (message = "Internal server error"): AppError =>
		createError("INTERNAL_ERROR", message),
};
