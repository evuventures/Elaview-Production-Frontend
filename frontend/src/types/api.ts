// src/types/api.ts
export type ApiResponse<T> = {
    data?: T;
    error?: string;
    status: number;
  };
  
  export type PaginatedResponse<T> = ApiResponse<T> & {
    total: number;
    page: number;
    per_page: number;
  };