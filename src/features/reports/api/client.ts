import { httpClient } from "@/core/lib/http";
import { Result, err, ok, type AppError } from "@/core/lib/http/result";
import type { RevenueReportResponse } from "../types";
import type { RevenueFiltersSchema } from "../validations";

export const reportsClient = {
  async getRevenueReport(
    filters: RevenueFiltersSchema
  ): Promise<Result<RevenueReportResponse, AppError>> {
    try {
      const data = await httpClient.get(
        "/api/reports/revenue",
        { params: filters }
      );

      return ok(data as unknown as RevenueReportResponse);
    } catch (e: any) {
      return err({
        code: "INTERNAL_ERROR",
        message: e?.message || "Failed to fetch revenue report",
      });
    }
  },
};
