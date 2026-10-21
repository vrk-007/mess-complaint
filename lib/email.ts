import { Resend } from "resend";

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function getFromAddress(): string {
  return process.env.RESEND_FROM_EMAIL?.trim() || "Mess Portal <noreply@nexalaya.com>";
}

// ── Core send helper ──────────────────────────────────────────────────────────
async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string[];
  subject: string;
  html: string;
}) {
  const resend = getResend();
  if (!resend) {
    console.error("[email] RESEND_API_KEY is not set");
    return;
  }
  if (!to.length) return;

  const { data, error } = await resend.emails.send({
    from: getFromAddress(),
    to,
    subject,
    html,
  });

  if (error) {
    console.error("[email] Resend error:", error);
    throw new Error(`Resend send failed: ${error.message}`);
  }

  return data;
}

// ── Helper: get comma-separated env emails as array ──────────────────────────
function getEmails(envVar: string): string[] {
  return (process.env[envVar] ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
}

// ── 1. Approval request email (Admin → Escalate email owners) ────────────────
export async function sendApprovalRequestEmail({
  complaintId,
  studentName,
  description,
  remark,
  mess,
}: {
  complaintId: string;
  studentName: string;
  description: string;
  remark: string;
  mess?: string | null;
}) {
  const to = getEmails("ESCALATE_EMAILS");
  const adminUrl = `${process.env.NEXTAUTH_URL ?? "https://messportal.vercel.app"}/admin`;

  await sendEmail({
    to,
    subject: "⏳ Approval Required — Complaint Resolution Request",
    html: `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#fffaf5;border-radius:16px;overflow:hidden;border:1px solid #fed7aa;">
        <div style="background:linear-gradient(135deg,#f97316,#ef4444);padding:24px 28px;">
          <h1 style="color:white;margin:0;font-size:20px;font-weight:800;">⏳ Resolution Approval Needed</h1>
          <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:14px;">A complaint has been submitted for resolution and needs your approval.</p>
        </div>
        <div style="padding:24px 28px;">
          <table style="width:100%;border-collapse:collapse;font-size:14px;color:#431407;">
            ${mess ? `<tr><td style="padding:8px 0;font-weight:700;width:140px;">Venue</td><td style="padding:8px 0;">${mess}</td></tr>` : ""}
            <tr style="background:rgba(249,115,22,0.05);"><td style="padding:8px 10px;font-weight:700;border-radius:6px;">Student</td><td style="padding:8px 10px;">${studentName}</td></tr>
            <tr><td style="padding:8px 0;font-weight:700;">Complaint</td><td style="padding:8px 0;">${description}</td></tr>
            <tr style="background:rgba(249,115,22,0.05);"><td style="padding:8px 10px;font-weight:700;border-radius:6px;">Resolution note</td><td style="padding:8px 10px;font-style:italic;">${remark}</td></tr>
          </table>
          <div style="margin-top:24px;text-align:center;">
            <a href="${adminUrl}" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#f97316,#ef4444);color:white;font-weight:700;font-size:14px;border-radius:10px;text-decoration:none;box-shadow:0 4px 14px rgba(249,115,22,0.35);">
              ✅ Open Admin Portal to Approve
            </a>
          </div>
        </div>
        <div style="padding:14px 28px;border-top:1px solid #fed7aa;font-size:12px;color:#9a3412;text-align:center;">
          Mess Complaint Portal · Powered by <strong>Nexalaya</strong>
        </div>
      </div>
    `,
  });
}

// ── 2. Escalation notification email (Escalator → SuperAdmin emails) ──────────
export async function sendEscalationEmail({
  studentName,
  description,
  forwardNote,
  escalatedBy,
  mess,
}: {
  studentName: string;
  description: string;
  forwardNote?: string | null;
  escalatedBy: string;
  mess?: string | null;
}) {
  const to = getEmails("SUPER_ADMIN_EMAILS");
  const superAdminUrl = `${process.env.NEXTAUTH_URL ?? "https://messportal.vercel.app"}/superadmin`;

  await sendEmail({
    to,
    subject: "🚨 New Complaint Escalated to SuperAdmin",
    html: `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#fffaf5;border-radius:16px;overflow:hidden;border:1px solid #fed7aa;">
        <div style="background:linear-gradient(135deg,#ef4444,#dc2626);padding:24px 28px;">
          <h1 style="color:white;margin:0;font-size:20px;font-weight:800;">🚨 Complaint Escalated</h1>
          <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:14px;">A serious complaint has been forwarded to you for review.</p>
        </div>
        <div style="padding:24px 28px;">
          <table style="width:100%;border-collapse:collapse;font-size:14px;color:#431407;">
            <tr><td style="padding:8px 0;font-weight:700;width:140px;">Student</td><td style="padding:8px 0;">${studentName}</td></tr>
            ${mess ? `<tr style="background:rgba(249,115,22,0.05);"><td style="padding:8px 10px;font-weight:700;border-radius:6px;">Venue</td><td style="padding:8px 10px;">${mess}</td></tr>` : ""}
            <tr ${mess ? "" : 'style="background:rgba(249,115,22,0.05);"'}><td style="padding:8px ${mess ? "0" : "10px"};font-weight:700;">Complaint</td><td style="padding:8px ${mess ? "0" : "10px"};">${description}</td></tr>
            ${forwardNote ? `<tr style="background:rgba(239,68,68,0.05);"><td style="padding:8px 10px;font-weight:700;border-radius:6px;">Escalation note</td><td style="padding:8px 10px;font-style:italic;">${forwardNote}</td></tr>` : ""}
            <tr><td style="padding:8px 0;font-weight:700;">Escalated by</td><td style="padding:8px 0;">${escalatedBy}</td></tr>
          </table>
          <div style="margin-top:24px;text-align:center;">
            <a href="${superAdminUrl}" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#ef4444,#dc2626);color:white;font-weight:700;font-size:14px;border-radius:10px;text-decoration:none;box-shadow:0 4px 14px rgba(239,68,68,0.35);">
              🛡️ Open SuperAdmin Portal
            </a>
          </div>
        </div>
        <div style="padding:14px 28px;border-top:1px solid #fed7aa;font-size:12px;color:#9a3412;text-align:center;">
          Mess Complaint Portal · Powered by <strong>Nexalaya</strong>
        </div>
      </div>
    `,
  });
}

// ── 3. Resolution confirmation email (→ Student who raised the complaint) ──────
export async function sendResolutionEmail({
  studentEmail,
  studentName,
  description,
  resolutionRemark,
  mess,
}: {
  studentEmail: string;
  studentName: string;
  description: string;
  resolutionRemark: string;
  mess?: string | null;
}) {
  await sendEmail({
    to: [studentEmail],
    subject: "✅ Your Complaint Has Been Resolved",
    html: `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#f0fdf4;border-radius:16px;overflow:hidden;border:1px solid #bbf7d0;">
        <div style="background:linear-gradient(135deg,#16a34a,#15803d);padding:24px 28px;">
          <h1 style="color:white;margin:0;font-size:20px;font-weight:800;">✅ Complaint Resolved</h1>
          <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:14px;">Hi ${studentName}, your complaint has been reviewed and resolved.</p>
        </div>
        <div style="padding:24px 28px;">
          <table style="width:100%;border-collapse:collapse;font-size:14px;color:#14532d;">
            ${mess ? `<tr><td style="padding:8px 0;font-weight:700;width:140px;">Venue</td><td style="padding:8px 0;">${mess}</td></tr>` : ""}
            <tr style="background:rgba(22,163,74,0.06);"><td style="padding:8px 10px;font-weight:700;border-radius:6px;">Complaint</td><td style="padding:8px 10px;">${description}</td></tr>
            <tr><td style="padding:8px 0;font-weight:700;">Resolution note</td><td style="padding:8px 0;font-style:italic;">${resolutionRemark}</td></tr>
          </table>
          <p style="margin-top:20px;font-size:13px;color:#166534;">Thank you for raising this with us. If you feel the issue has not been addressed, please feel free to raise a new complaint.</p>
        </div>
        <div style="padding:14px 28px;border-top:1px solid #bbf7d0;font-size:12px;color:#166534;text-align:center;">
          Mess Complaint Portal · Powered by <strong>Nexalaya</strong>
        </div>
      </div>
    `,
  });
}

export async function sendReminderEmail({
  pendingCount,
  pendingApprovalCount,
}: {
  pendingCount: number;
  pendingApprovalCount: number;
}) {
  const to = getEmails("ESCALATE_EMAILS");
  const adminUrl = `${process.env.NEXTAUTH_URL ?? "https://messportal.vercel.app"}/admin`;

  const hasPending = pendingCount > 0 || pendingApprovalCount > 0;
  const subject = hasPending
    ? `📋 Reminder: ${pendingCount} Pending Complaint${pendingCount !== 1 ? "s" : ""} Need Attention`
    : `✅ Mess Portal Check-in: All Complaints Resolved`;

  const bodyContent = hasPending
    ? `Just a heads-up — there ${pendingCount === 1 ? "is" : "are"} currently <strong>${pendingCount} active complaint${pendingCount !== 1 ? "s" : ""}</strong>${pendingApprovalCount > 0 ? `, with <strong>${pendingApprovalCount}</strong> awaiting your approval` : ""} on the Mess Portal. Please take a moment to check and action them.`
    : `All good news! There are currently <strong>no active complaints</strong> on the Mess Portal. Everything is running smoothly and all previous complaints have been resolved.`;

  const html = `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;background:#fffaf5;border-radius:16px;overflow:hidden;border:1px solid #fed7aa;">
        <div style="background:linear-gradient(135deg,#f97316,#ef4444);padding:24px 28px;">
          <h1 style="color:white;margin:0;font-size:20px;font-weight:800;">📋 Mess Portal — ${hasPending ? "Reminder" : "Check-in"}</h1>
          <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:14px;">This is your bi-daily check-in from the Mess Complaint Portal.</p>
        </div>
        <div style="padding:28px;">
          <p style="font-size:15px;color:#431407;margin:0 0 6px;">Hey,</p>
          <p style="font-size:15px;color:#431407;margin:0 0 20px;">${bodyContent}</p>
          <div style="text-align:center;">
            <a href="${adminUrl}" style="display:inline-block;padding:13px 32px;background:linear-gradient(135deg,#f97316,#ef4444);color:white;font-weight:700;font-size:14px;border-radius:10px;text-decoration:none;box-shadow:0 4px 14px rgba(249,115,22,0.35);">
              📋 Visit Admin Portal
            </a>
          </div>
        </div>
        <div style="padding:14px 28px;border-top:1px solid #fed7aa;font-size:12px;color:#9a3412;text-align:center;">
          Mess Complaint Portal · Powered by <strong>Nexalaya</strong> · Reminder sent every 2 days
        </div>
      </div>
    `;

  // Send individually to each recipient so Gmail treats them as 1:1 transactional
  // emails rather than bulk — prevents overnight delivery delays
  await Promise.all(
    to.map((recipient) => sendEmail({ to: [recipient], subject, html }))
  );
}
