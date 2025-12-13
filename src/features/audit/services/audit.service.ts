import { Result, err, errors, ok } from "@/core/lib/http/result";
import { auditRepository, type AuditLogData } from "../repository";

export class AuditService {
	/**
	 * Log an admin/user action
	 */
	async logAction(logData: AuditLogData): Promise<Result<boolean>> {
		try {
			await auditRepository.createLog(logData);
			return ok(true);
		} catch (error) {
			console.error("Failed to create audit log:", error);
			// Don't fail the main operation due to audit logging failure
			return ok(false);
		}
	}

	/**
	 * Get audit logs with filtering for admin dashboard
	 */
	async getAuditLogs(filters?: {
		userId?: string;
		action?: string;
		entityType?: string;
		entityId?: string;
		fromDate?: Date;
		toDate?: Date;
		limit?: number;
		offset?: number;
	}): Promise<Result<any[]>> {
		try {
			const logs = await auditRepository.getLogs(filters);
			return ok(logs);
		} catch (error) {
			console.error("Failed to fetch audit logs:", error);
			return err(errors.internalError("Failed to fetch audit logs"));
		}
	}

	/**
	 * Get audit logs for a specific entity
	 */
	async getEntityAuditLogs(
		entityType: string,
		entityId: string,
		limit = 20
	): Promise<Result<any[]>> {
		try {
			const logs = await auditRepository.getEntityLogs(entityType, entityId, limit);
			return ok(logs);
		} catch (error) {
			console.error("Failed to fetch entity audit logs:", error);
			return err(errors.internalError("Failed to fetch entity audit logs"));
		}
	}

	/**
	 * Get audit statistics for dashboard
	 */
	async getAuditStatistics(days = 30): Promise<Result<any>> {
		try {
			const stats = await auditRepository.getAuditStats(days);
			return ok(stats);
		} catch (error) {
			console.error("Failed to fetch audit statistics:", error);
			return err(errors.internalError("Failed to fetch audit statistics"));
		}
	}

	/**
	 * Helper method to log booking-related actions
	 */
	async logBookingAction(
		userId: string,
		action: string,
		bookingId: number,
		details?: any,
		ipAddress?: string,
		userAgent?: string
	): Promise<Result<boolean>> {
		return this.logAction({
			userId,
			action,
			entityType: "booking",
			entityId: bookingId.toString(),
			details: details ? JSON.stringify(details) : undefined,
			ipAddress,
			userAgent,
		});
	}

	/**
	 * Helper method to log flight-related actions
	 */
	async logFlightAction(
		userId: string,
		action: string,
		flightId: number,
		details?: any,
		ipAddress?: string,
		userAgent?: string
	): Promise<Result<boolean>> {
		return this.logAction({
			userId,
			action,
			entityType: "flight",
			entityId: flightId.toString(),
			details: details ? JSON.stringify(details) : undefined,
			ipAddress,
			userAgent,
		});
	}

	/**
	 * Helper method to log user-related actions
	 */
	async logUserAction(
		userId: string,
		action: string,
		targetUserId?: string,
		details?: any,
		ipAddress?: string,
		userAgent?: string
	): Promise<Result<boolean>> {
		return this.logAction({
			userId,
			action,
			entityType: "user",
			entityId: targetUserId,
			details: details ? JSON.stringify(details) : undefined,
			ipAddress,
			userAgent,
		});
	}
}

export const auditService = new AuditService();
