import { lt } from "drizzle-orm";
import { db, sessionsTable } from "@workspace/db";

export async function cleanupExpiredSessions(): Promise<void> {
  try {
    const result = await db
      .delete(sessionsTable)
      .where(lt(sessionsTable.expiresAt, new Date()))
      .returning({ sessionId: sessionsTable.sessionId });

    if (result.length > 0) {
      console.log(`[cleanup] Deleted ${result.length} expired session(s).`);
    }
  } catch (err) {
    console.error("[cleanup] Failed to delete expired sessions:", err);
  }
}

export function scheduleCleanup(): void {
  // Run once immediately on startup
  void cleanupExpiredSessions();

  // Then every 6 hours
  const SIX_HOURS = 6 * 60 * 60 * 1000;
  setInterval(() => {
    void cleanupExpiredSessions();
  }, SIX_HOURS);
}
