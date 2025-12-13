import { db } from "@/infrastructure/db/client";
import { auditLogs } from "@/infrastructure/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";

export interface AuditLogData {
	userId?: string;
	action: string;
	entityType: string;
	entityId?: string;
	details?: string;
	ipAddress?: string;
	userAgent?: string;
}

export const auditRepository = {
	// Create audit log entry
	createLog: async (logData: AuditLogData) => {
		const newLog = await db
			.insert(auditLogs)
			.values({
				...logData,
				createdAt: new Date(),
			})
			.returning();

		return newLog[0];
	},

	// Get audit logs with filtering
	getLogs: async (filters?: {
		userId?: string;
		action?: string;
		entityType?: string;
		entityId?: string;
		fromDate?: Date;
		toDate?: Date;
		limit?: number;
		offset?: number;
	}) => {
		const baseQuery = db.select().from(auditLogs);

		const conditions = [];

		if (filters?.userId) {
			conditions.push(eq(auditLogs.userId, filters.userId));
		}

		if (filters?.action) {
			conditions.push(eq(auditLogs.action, filters.action));
		}

		if (filters?.entityType) {
			conditions.push(eq(auditLogs.entityType, filters.entityType));
		}

		if (filters?.entityId) {
			conditions.push(eq(auditLogs.entityId, filters.entityId));
		}

		if (conditions.length > 0) {
			return await baseQuery
				.where(and(...conditions))
				.orderBy(desc(auditLogs.createdAt))
				.limit(filters?.limit || 50)
				.offset(filters?.offset || 0);
		} else {
			return await baseQuery
				.orderBy(desc(auditLogs.createdAt))
				.limit(filters?.limit || 50)
				.offset(filters?.offset || 0);
		}
	},

	// Get audit logs for a specific entity
	getEntityLogs: async (entityType: string, entityId: string, limit = 20) => {
		return await db
			.select()
			.from(auditLogs)
			.where(
				and(
					eq(auditLogs.entityType, entityType),
					eq(auditLogs.entityId, entityId)
				)
			)
			.orderBy(desc(auditLogs.createdAt))
			.limit(limit);
	},

	// Get audit statistics
	getAuditStats: async (days = 30) => {
		const cutoffDate = new Date();
		cutoffDate.setDate(cutoffDate.getDate() - days);

		const stats = await db
			.select({
				totalLogs: sql<number>`COUNT(*)`,
				uniqueUsers: sql<number>`COUNT(DISTINCT ${auditLogs.userId})`,
				actionsByType: sql<any>`JSON_OBJECT_AGG(${auditLogs.action}, COUNT(*))`,
			})
			.from(auditLogs)
			.where(sql`${auditLogs.createdAt} >= ${cutoffDate}`);

		return stats[0];
	},
};
