export interface AuditLogsResponse {
  data: AuditLog[];
  total: number;
  limit: number;
  offset: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT";
  entityType: "booking" | "flight" | "user" | "airline" | "passenger";
  entityId: string;
  details?: Record<string, unknown>;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}
