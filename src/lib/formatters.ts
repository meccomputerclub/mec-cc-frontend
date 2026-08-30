/**
 * Formats department and session into a clean, modern standard string:
 * e.g. "CSE (21-22)", "EEE (22-23)", "CE (20-21)", "ME (23-24)"
 */
export function formatDeptSession(
  dept?: string,
  session?: string,
  fallbackBatch?: string
): string {
  if (!dept && !session && !fallbackBatch) return "";

  // If session or fallback contains faculty / academic designation keywords
  const rawSession = (session || "").trim();
  if (
    rawSession &&
    (/faculty/i.test(rawSession) ||
      /professor/i.test(rawSession) ||
      /head/i.test(rawSession) ||
      /principal/i.test(rawSession) ||
      /lecturer/i.test(rawSession) ||
      /mentor/i.test(rawSession) ||
      /dept/i.test(rawSession))
  ) {
    if (rawSession.toLowerCase() === "faculty") {
      return dept ? `Dept. of ${dept}` : "Faculty";
    }
    return rawSession;
  }

  let cleanDept = (dept || "").replace(/Department of\s*/i, "").trim();
  let cleanSession = "";

  const combined = `${dept || ""} ${session || ""} ${fallbackBatch || ""}`;

  // If department isn't explicitly provided, extract known department keywords
  if (!cleanDept) {
    if (/\b(CSE|Computer Science)\b/i.test(combined)) cleanDept = "CSE";
    else if (/\b(EEE|Electrical)\b/i.test(combined)) cleanDept = "EEE";
    else if (/\b(CE|Civil)\b/i.test(combined)) cleanDept = "CE";
    else if (/\b(ME|Mechanical)\b/i.test(combined)) cleanDept = "ME";
    else if (session && session.includes("·")) {
      const parts = session.split("·");
      if (parts.length > 1) cleanDept = parts[1].trim();
    }
  }

  // Normalize department acronyms
  if (/^computer\s*science/i.test(cleanDept)) cleanDept = "CSE";
  if (/^electrical/i.test(cleanDept)) cleanDept = "EEE";
  if (/^civil/i.test(cleanDept)) cleanDept = "CE";
  if (/^mechanical/i.test(cleanDept)) cleanDept = "ME";

  // Extract 2-digit or 4-digit academic session years (e.g. 2021-2022, 2021-22, 21-22, 2021/22)
  if (session) {
    const raw = session
      .replace(/^Session:\s*/i, "")
      .replace(/Session\s*/i, "")
      .trim();

    const match = raw.match(/(\d{2,4})\s*[-/]\s*(\d{2,4})/);
    if (match) {
      const start = match[1].length === 4 ? match[1].slice(2) : match[1];
      const end = match[2].length === 4 ? match[2].slice(2) : match[2];
      cleanSession = `${start}-${end}`;
    } else {
      const singleMatch = raw.match(/\b(20\d{2}|\d{2})\b/);
      if (singleMatch) {
        cleanSession =
          singleMatch[1].length === 4
            ? singleMatch[1].slice(2)
            : singleMatch[1];
      }
    }
  }

  // If still no session extracted, check fallbackBatch for years
  if (!cleanSession && fallbackBatch) {
    const match = fallbackBatch.match(/(\d{2,4})\s*[-/]\s*(\d{2,4})/);
    if (match) {
      const start = match[1].length === 4 ? match[1].slice(2) : match[1];
      const end = match[2].length === 4 ? match[2].slice(2) : match[2];
      cleanSession = `${start}-${end}`;
    }
  }

  // If no department could be detected anywhere but we have a session, default to CSE for MEC-CC
  if (!cleanDept && cleanSession) {
    cleanDept = "CSE";
  }

  // Assemble result
  if (cleanDept && cleanSession) {
    return `${cleanDept} (${cleanSession})`;
  }
  if (fallbackBatch && fallbackBatch.trim()) {
    return fallbackBatch.trim();
  }
  if (cleanDept) {
    return cleanDept;
  }
  if (cleanSession) {
    return `CSE (${cleanSession})`;
  }
  return "";
}
