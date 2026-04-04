import { AuditLog } from "../models";

export async function logAudit(
  actor: string,
  action: string,
  details: Record<string, unknown> = {}
): Promise<void> {
  await AuditLog.create({ actor, action, details });
}
