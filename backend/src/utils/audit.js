const AuditLog = require('../models/AuditLog');

async function logAudit(actorId, action, targetType, targetId, details = {}, ip = '') {
  try {
    await AuditLog.create({ actor: actorId, action, targetType, targetId, details, ip });
  } catch (err) {
    // Audit logging must never break the primary request flow
    // eslint-disable-next-line no-console
    console.error('Audit log failed:', err.message);
  }
}

module.exports = { logAudit };
