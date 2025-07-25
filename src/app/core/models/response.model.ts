export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
  timestamp?: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    pages: number;
    has_prev: boolean;
    has_next: boolean;
    prev_num: number | null;
    next_num: number | null;
  };
  timestamp?: string;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors: string[];
  error_code?: string;
  timestamp: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version?: string;
  database?: {
    status: 'connected' | 'disconnected';
    response_time_ms?: number;
  };
  services?: {
    [key: string]: {
      status: 'up' | 'down';
      response_time_ms?: number;
    };
  };
}

export interface FileUploadResponse {
  success: boolean;
  message: string;
  file_url: string;
  file_name: string;
  file_size: number;
  file_type: string;
  uploaded_at: string;
}

export interface BulkOperationResponse {
  success: boolean;
  message: string;
  total_processed: number;
  successful: number;
  failed: number;
  errors?: {
    index: number;
    error: string;
  }[];
}