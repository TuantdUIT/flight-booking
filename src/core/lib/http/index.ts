import axios, { AxiosError, AxiosResponse } from "axios";

type ApiSuccessResponse<T> = {
	success: true;
	data: T;
	meta: {
		requestId: string;
		timestamp: string;
	};
};

type ApiErrorResponse = {
	success: false;
	error: {
		code: string;
		message: string;
		details?: Record<string, unknown>;
	};
	meta: {
		requestId: string;
		timestamp: string;
		retryable: boolean;
	};
};

type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export class ApiError extends Error {
	public readonly code: string;
	public readonly details?: Record<string, unknown>;
	public readonly requestId: string;
	public readonly retryable: boolean;

	constructor(
		error: ApiErrorResponse["error"],
		meta: ApiErrorResponse["meta"],
	) {
		super(error.message);
		this.name = "ApiError";
		this.code = error.code;
		this.details = error.details;
		this.requestId = meta.requestId;
		this.retryable = meta.retryable;
	}
}

const httpClient = axios.create({
	baseURL: "/api",
	headers: {
		"Content-Type": "application/json",
	},
});

// Response interceptor to handle our Result-based API responses
httpClient.interceptors.response.use(
	(response: AxiosResponse<ApiResponse<any>>) => {
		const apiResponse = response.data;

		if (apiResponse.success) {
			// Return just the data for successful responses
			return apiResponse.data;
		} else {
			// Throw an ApiError for failed responses
			throw new ApiError(apiResponse.error, apiResponse.meta);
		}
	},
	(error: AxiosError) => {
		// Pass through network errors, etc.
		return Promise.reject(error);
	},
);

httpClient.interceptors.request.use(
	(config) => {
		// NOTE: Add logic to get token from storage
		const token = localStorage.getItem("accessToken");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

export { httpClient };
