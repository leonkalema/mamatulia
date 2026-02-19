export type ApiResponse<T> = {
  readonly data: T;
  readonly error: null;
} | {
  readonly data: null;
  readonly error: ApiError;
};

export type ApiError = {
  readonly code: string;
  readonly message: string;
  readonly details?: Record<string, unknown>;
};

export type PaginatedResponse<T> = {
  readonly items: readonly T[];
  readonly total: number;
  readonly skip: number;
  readonly limit: number;
  readonly hasMore: boolean;
};

export type QueryParams = {
  readonly skip?: number;
  readonly limit?: number;
  readonly order?: string;
  readonly include?: number;
};
