import { httpClient } from "@/core/lib/http";
import { Result, err, ok, type AppError } from "@/core/lib/http/result";
import type { AuditLogsResponse } from "../types";
import type { AuditFiltersSchema } from "../validations";

export const auditClient = {
  async getAuditLogs(
    filters: AuditFiltersSchema
  ): Promise<Result<AuditLogsResponse, AppError>> {
    try {
      const data = await httpClient.get(
        "/api/audit",
        { params: filters }
      );

      return ok(data as unknown as AuditLogsResponse);
    } catch (e: any) {
      return err({
        code: "INTERNAL_ERROR",
        message: e?.message || "Failed to fetch audit logs",
      });
    }
  },
};
