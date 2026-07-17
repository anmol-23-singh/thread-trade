const logger = require('../config/logger');

/**
 * sendEmail: stubbed for the demo so the project runs with zero email
 * provider setup. Swap the body of this function for nodemailer + SMTP,
 * or an API-based provider (SendGrid/Resend/Postmark) in production —
 * every call site in the codebase already awaits this function, so no
 * other file needs to change.
 */
async function sendEmail({ to, subject, text }) {
  logger.info(`[email:stub] To: ${to} | Subject: ${subject} | Body: ${text}`);
  return true;
}

module.exports = { sendEmail };
