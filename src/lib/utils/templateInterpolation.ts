/**
 * Utility for Certificate Template interpolation and HTML boilerplate
 */

export interface CertificateInterpolationData {
  recipient_name?: string;
  student_id?: string;
  department?: string;
  batch?: string;
  session?: string;
  event_title?: string;
  certificate_title?: string;
  certificate_id?: string;
  issue_date?: string;
  position?: string;
  description?: string;
  verification_url?: string;
  qr_code_url?: string;
  [key: string]: string | undefined;
}

/**
 * Standard placeholders available for certificate templates
 */
export const CERTIFICATE_PLACEHOLDERS = [
  { key: "{{recipient_name}}", label: "Recipient Name", sample: "Nafis Fuad" },
  { key: "{{student_id}}", label: "Student ID", sample: "2021331501" },
  { key: "{{department}}", label: "Department", sample: "Computer Science & Engineering" },
  { key: "{{batch}}", label: "Batch", sample: "Batch 08" },
  { key: "{{session}}", label: "Session", sample: "2020-21" },
  { key: "{{event_title}}", label: "Event Title", sample: "MEC National Hackathon 2026" },
  { key: "{{certificate_title}}", label: "Certificate Title", sample: "Certificate of Excellence" },
  { key: "{{certificate_id}}", label: "Certificate ID", sample: "MCC-2026-F89A12" },
  { key: "{{issue_date}}", label: "Issue Date", sample: "September 6, 2026" },
  { key: "{{position}}", label: "Winner Position", sample: "Champion (1st Place)" },
  { key: "{{description}}", label: "Description / Citation", sample: "For outstanding performance and innovative problem solving." },
  { key: "{{verification_url}}", label: "Verification URL", sample: "https://meccomputerclub.org/verify?cert=MCC-2026-F89A12" },
  { key: "{{qr_code_url}}", label: "QR Code Image", sample: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://meccomputerclub.org/verify?cert=MCC-2026-F89A12" },
];

/**
 * Replace all {{key}} tokens in html content with provided values
 */
export function interpolateCertificateHtml(
  htmlContent: string,
  data: CertificateInterpolationData
): string {
  if (!htmlContent) return "";

  let result = htmlContent;

  // Build QR code URL if not explicitly provided
  const certId = data.certificate_id || "MCC-PREVIEW-001";
  const origin = typeof window !== "undefined" ? window.location.origin : "https://meccomputerclub.org";
  const defaultVerifyUrl = data.verification_url || `${origin}/verify?cert=${certId}`;
  const defaultQrUrl =
    data.qr_code_url ||
    `https://api.qrserver.com/v1/create-qr-code/?size=120x120&margin=0&data=${encodeURIComponent(
      defaultVerifyUrl
    )}`;

  const mergedData: CertificateInterpolationData = {
    ...data,
    verification_url: defaultVerifyUrl,
    qr_code_url: defaultQrUrl,
  };

  // Replace each placeholder
  for (const [key, val] of Object.entries(mergedData)) {
    const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "gi");
    result = result.replace(regex, val || "");
  }

  // Also replace any remaining placeholders from standard list
  for (const item of CERTIFICATE_PLACEHOLDERS) {
    const rawKey = item.key.replace(/[{}]/g, "");
    if (!(rawKey in mergedData)) {
      const regex = new RegExp(`\\{\\{\\s*${rawKey}\\s*\\}\\}`, "gi");
      result = result.replace(regex, item.sample);
    }
  }

  return result;
}

/**
 * Sample Boilerplate HTML template for custom HTML editor
 */
export const SAMPLE_HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: transparent;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .cert-container {
      width: 100%;
      max-width: 900px;
      aspect-ratio: 1.414 / 1;
      background: #FFFFFF;
      border: 8px solid #0D9488;
      outline: 3px solid #F59E0B;
      outline-offset: -14px;
      padding: 40px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      text-align: center;
      position: relative;
      box-shadow: 10px 10px 0px #0F172A;
    }
    .header-logo {
      font-size: 13px;
      font-weight: 800;
      color: #0D9488;
      letter-spacing: 2px;
      text-transform: uppercase;
    }
    .title {
      font-size: 32px;
      font-weight: 900;
      color: #0F172A;
      margin-top: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .position-pill {
      display: inline-block;
      align-self: center;
      background: #FEF3C7;
      border: 2px solid #F59E0B;
      color: #B45309;
      font-weight: 800;
      font-size: 14px;
      padding: 4px 16px;
      border-radius: 20px;
      margin: 8px auto;
    }
    .presented-to {
      font-size: 12px;
      letter-spacing: 2px;
      color: #64748B;
      text-transform: uppercase;
      margin-top: 10px;
    }
    .recipient-name {
      font-size: 28px;
      font-weight: 900;
      color: #0D9488;
      border-bottom: 2px solid #E2E8F0;
      display: inline-block;
      padding-bottom: 6px;
      margin: 8px auto 4px;
    }
    .meta-info {
      font-size: 13px;
      color: #475569;
      font-family: monospace;
    }
    .description {
      font-size: 14px;
      color: #334155;
      font-style: italic;
      margin: 12px auto;
      max-width: 650px;
      line-height: 1.5;
    }
    .event-badge {
      font-size: 13px;
      font-weight: 700;
      color: #0F172A;
      background: #F1F5F9;
      padding: 6px 14px;
      border-radius: 6px;
      display: inline-block;
      margin: 0 auto;
    }
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 20px;
      padding-top: 15px;
      border-top: 1px solid #CBD5E1;
    }
    .sig-block {
      text-align: center;
      width: 180px;
    }
    .sig-line {
      border-top: 2px solid #0F172A;
      margin-top: 40px;
      padding-top: 4px;
      font-weight: 700;
      font-size: 12px;
      color: #0F172A;
    }
    .sig-title {
      font-size: 11px;
      color: #64748B;
    }
    .qr-block {
      text-align: center;
    }
    .qr-block img {
      width: 70px;
      height: 70px;
      border: 1px solid #CBD5E1;
      padding: 2px;
      background: #FFF;
    }
    .qr-block span {
      display: block;
      font-size: 10px;
      font-family: monospace;
      color: #64748B;
      margin-top: 2px;
    }
  </style>
</head>
<body>
  <div class="cert-container">
    <div>
      <div class="header-logo">Mymensingh Engineering College Computer Club</div>
      <h1 class="title">{{certificate_title}}</h1>
      <div class="position-pill">★ {{position}}</div>
    </div>

    <div>
      <p class="presented-to">This credential is proudly awarded to</p>
      <h2 class="recipient-name">{{recipient_name}}</h2>
      <p class="meta-info">ID: {{student_id}} &bull; Dept. of {{department}}</p>
      <p class="description">&ldquo;{{description}}&rdquo;</p>
      <div class="event-badge">Event: {{event_title}}</div>
    </div>

    <div class="footer">
      <div class="sig-block">
        <div class="sig-line">President</div>
        <div class="sig-title">MEC Computer Club</div>
      </div>

      <div class="qr-block">
        <img src="{{qr_code_url}}" alt="QR Code" />
        <span>{{certificate_id}}</span>
      </div>

      <div class="sig-block">
        <div class="sig-line">Faculty Advisor</div>
        <div class="sig-title">Mymensingh Engineering College</div>
      </div>
    </div>
  </div>
</body>
</html>`;
