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
  submittedBy,
}: {
  complaintId: string;
  studentName: string;
  description: string;
  remark: string;
  submittedBy: string;
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
            <tr><td style="padding:8px 0;font-weight:700;width:140px;">Student</td><td style="padding:8px 0;">${studentName}</td></tr>
            <tr style="background:rgba(249,115,22,0.05);"><td style="padding:8px 10px;font-weight:700;border-radius:6px;">Complaint</td><td style="padding:8px 10px;">${description}</td></tr>
            <tr><td style="padding:8px 0;font-weight:700;">Resolution note</td><td style="padding:8px 0;font-style:italic;">${remark}</td></tr>
            <tr style="background:rgba(249,115,22,0.05);"><td style="padding:8px 10px;font-weight:700;border-radius:6px;">Submitted by</td><td style="padding:8px 10px;">${submittedBy}</td></tr>
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

// ── 3. Bi-daily reminder email (cron → Escalate email owners) ────────────────
export async function sendReminderEmail({
  pendingCount,
  pendingApprovalCount,
  complaints,
}: {
  pendingCount: number;
  pendingApprovalCount: number;
  complaints: Array<{ studentName: string; description: string; createdAt: Date; mess?: string | null }>;
}) {
  const to = getEmails("ESCALATE_EMAILS");
  const adminUrl = `${process.env.NEXTAUTH_URL ?? "https://messportal.vercel.app"}/admin`;

  const rows = complaints
    .slice(0, 10) // cap at 10 in the email
    .map(
      (c, i) => `
      <tr style="${i % 2 === 0 ? "background:rgba(249,115,22,0.04);" : ""}">
        <td style="padding:8px 10px;font-size:13px;color:#431407;">${c.studentName}</td>
        <td style="padding:8px 10px;font-size:13px;color:#431407;">${c.mess ?? "—"}</td>
        <td style="padding:8px 10px;font-size:13px;color:#78350f;">${c.description.slice(0, 60)}${c.description.length > 60 ? "…" : ""}</td>
        <td style="padding:8px 10px;font-size:12px;color:#9a3412;white-space:nowrap;">${new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
      </tr>`
    )
    .join("");

  await sendEmail({
    to,
    subject: `📋 Reminder: ${pendingCount} Pending Complaint${pendingCount !== 1 ? "s" : ""} Need Attention`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:620px;margin:0 auto;background:#fffaf5;border-radius:16px;overflow:hidden;border:1px solid #fed7aa;">
        <div style="background:linear-gradient(135deg,#f97316,#ef4444);padding:24px 28px;">
          <h1 style="color:white;margin:0;font-size:20px;font-weight:800;">📋 Pending Complaints Reminder</h1>
          <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:14px;">This is your bi-daily summary of unresolved complaints.</p>
        </div>
        <div style="padding:24px 28px;">
          <div style="display:flex;gap:16px;margin-bottom:20px;flex-wrap:wrap;">
            <div style="flex:1;min-width:120px;padding:14px;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.25);border-radius:12px;text-align:center;">
              <div style="font-size:28px;font-weight:800;color:#ef4444;">${pendingCount}</div>
              <div style="font-size:12px;font-weight:700;color:#9a3412;">Active Complaints</div>
            </div>
            <div style="flex:1;min-width:120px;padding:14px;background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.3);border-radius:12px;text-align:center;">
              <div style="font-size:28px;font-weight:800;color:#f59e0b;">${pendingApprovalCount}</div>
              <div style="font-size:12px;font-weight:700;color:#9a3412;">Awaiting Your Approval</div>
            </div>
          </div>
          ${
            complaints.length > 0
              ? `<table style="width:100%;border-collapse:collapse;border-radius:10px;overflow:hidden;border:1px solid #fed7aa;">
              <thead>
                <tr style="background:linear-gradient(135deg,#f97316,#ef4444);">
                  <th style="padding:9px 10px;text-align:left;font-size:12px;color:white;font-weight:700;">Student</th>
                  <th style="padding:9px 10px;text-align:left;font-size:12px;color:white;font-weight:700;">Venue</th>
                  <th style="padding:9px 10px;text-align:left;font-size:12px;color:white;font-weight:700;">Complaint</th>
                  <th style="padding:9px 10px;text-align:left;font-size:12px;color:white;font-weight:700;">Date</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
            ${complaints.length > 10 ? `<p style="font-size:12px;color:#9a3412;text-align:center;margin-top:10px;">+ ${complaints.length - 10} more complaint(s) on the portal</p>` : ""} `
              : `<p style="text-align:center;color:#78350f;font-size:14px;">🎉 No active complaints right now!</p>`
          }
          <div style="margin-top:24px;text-align:center;">
            <a href="${adminUrl}" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#f97316,#ef4444);color:white;font-weight:700;font-size:14px;border-radius:10px;text-decoration:none;box-shadow:0 4px 14px rgba(249,115,22,0.35);">
              📋 Open Admin Portal
            </a>
          </div>
        </div>
        <div style="padding:14px 28px;border-top:1px solid #fed7aa;font-size:12px;color:#9a3412;text-align:center;">
          Mess Complaint Portal · Powered by <strong>Nexalaya</strong> · Reminder sent every 2 days
        </div>
      </div>
    `,
  });
}
