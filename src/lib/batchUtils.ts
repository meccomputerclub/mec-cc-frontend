/**
 * Utility for parsing and grouping people (Members, Executives, Alumni) batchwise.
 */

export interface BatchGroup<T> {
  batchNumber: string;
  year?: string;
  members: T[];
  sortOrder: number;
}

export function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/**
 * Builds batch select options for a department.
 * Shows the most recent `count` batches (default 10), from oldest up to juniorBatch.
 * e.g. CSE juniorBatch=6 → ["CSE-1st", "CSE-2nd", ..., "CSE-6th"]
 */
export function getBatchOptions(
  dept: string,
  config?: Record<string, number>,
  count = 10
): { value: string; label: string }[] {
  if (!dept) return [];
  const d = dept.toUpperCase();
  const juniorBatch = (config && config[d]) || (d === "EEE" ? 14 : d === "CE" ? 8 : 6);
  const oldest = Math.max(1, juniorBatch - count + 1);
  const options = [];
  for (let i = oldest; i <= juniorBatch; i++) {
    const batchLabel = `${d}-${ordinal(i)}`;
    options.push({ value: batchLabel, label: batchLabel });
  }
  return options;
}

/**
 * Normalizes batch heading and year from batch, session, and department fields.
 */
export function parseBatchInfo(
  rawBatch?: string,
  rawSession?: string,
  rawDept?: string
): { batchNumber: string; year: string; sortOrder: number } {
  const b = (rawBatch || "").trim();
  const s = (rawSession || "").trim();
  const d = (rawDept || "").trim().toUpperCase();

  // Detect department
  let dept = d;
  if (!dept) {
    const deptMatch = `${b} ${s}`.match(/\b(CSE|EEE|CE|ME)\b/i);
    if (deptMatch) dept = deptMatch[1].toUpperCase();
  }
  if (!dept) dept = "CSE"; // Default club department

  // 1. Check for explicit batch numbers like "5th", "5", "6th Batch", "CSE-5th", "CSE, 5th", "1st Batch"
  // Avoid matching 4-digit years like 2021
  const numMatch = b.match(/(?:CSE|EEE|CE|ME)?[\s,-]*\b([1-9]\d{0,1})(?:st|nd|rd|th)?(?:\s*batch)?\b/i);
  if (numMatch) {
    const num = parseInt(numMatch[1], 10);
    const ord = ordinal(num);
    const batchNumber = `${dept} — ${ord} Batch`;

    // Derive year from session if available
    let year = "";
    const sessionMatch = s.match(/(\d{4}|\d{2})\s*[-/]\s*(\d{4}|\d{2})/);
    if (sessionMatch) {
      const start = sessionMatch[1].length === 2 ? `20${sessionMatch[1]}` : sessionMatch[1];
      const end = sessionMatch[2].length === 2 ? `20${sessionMatch[2]}` : sessionMatch[2];
      year = `${start} – ${end}`;
    } else if (dept === "CSE") {
      // Derive approximate 4-year tenure or session
      const startYear = 2016 + num;
      year = `${startYear} – ${startYear + 4}`;
    }

    return { batchNumber, year, sortOrder: num };
  }

  // 2. Check if batch contains a 4-digit session like "2019-2020" or "2021-22"
  const yearSessionMatch = `${b} ${s}`.match(/(\d{4})\s*[-/]\s*(\d{2,4})/);
  if (yearSessionMatch) {
    const startYear = parseInt(yearSessionMatch[1], 10);
    const endRaw = yearSessionMatch[2];
    const endYear = endRaw.length === 2 ? parseInt(`20${endRaw}`, 10) : parseInt(endRaw, 10);
    const yearStr = `${startYear} – ${endYear}`;

    // For MEC CSE: 2017-18 was 1st Batch, 2018-19 was 2nd, etc.
    let num = 1;
    if (dept === "CSE") {
      num = Math.max(1, startYear - 2017 + 1);
    } else if (dept === "EEE") {
      num = Math.max(1, startYear - 2008 + 1);
    } else if (dept === "CE") {
      num = Math.max(1, startYear - 2014 + 1);
    }

    const ord = ordinal(num);
    return {
      batchNumber: `${dept} — ${ord} Batch`,
      year: yearStr,
      sortOrder: num,
    };
  }

  // 3. Fallback: if b is non-empty, use it directly
  if (b) {
    return {
      batchNumber: b.includes("Batch") ? b : `${b} Batch`,
      year: s || "",
      sortOrder: 999,
    };
  }

  return {
    batchNumber: "Club Members",
    year: s || "",
    sortOrder: 999,
  };
}

/**
 * Groups an array of people batchwise and sorts batches in ascending order (senior batches first).
 */
export function groupPeopleByBatch<
  T extends { batch?: string; session?: string; department?: string; name: string }
>(people: T[]): BatchGroup<T>[] {
  const groupsMap = new Map<string, { batchNumber: string; year: string; sortOrder: number; members: T[] }>();

  for (const person of people) {
    const info = parseBatchInfo(person.batch, person.session, person.department);
    const key = info.batchNumber;

    if (!groupsMap.has(key)) {
      groupsMap.set(key, {
        batchNumber: info.batchNumber,
        year: info.year,
        sortOrder: info.sortOrder,
        members: [],
      });
    }

    const group = groupsMap.get(key)!;
    // Prefer non-empty year
    if (!group.year && info.year) {
      group.year = info.year;
    }
    group.members.push(person);
  }

  // Sort groups by sortOrder (e.g. 1st, 2nd, 3rd, 5th, 6th...), then alphabetically
  const sortedGroups = Array.from(groupsMap.values()).sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return a.batchNumber.localeCompare(b.batchNumber);
  });

  return sortedGroups;
}
