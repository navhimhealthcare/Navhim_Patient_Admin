import { ResultRow } from "../types/labReport.types";

export const isAbnormal = (r: ResultRow): boolean => {
  try {
    const val = parseFloat(r.value);
    const match = r.normalRange.match(/([\d.]+)\s*[-–]\s*([\d.]+)/);
    if (!match || isNaN(val)) return false;
    return val < parseFloat(match[1]) || val > parseFloat(match[2]);
  } catch {
    return false;
  }
};

export const fmtDisplayDate = (iso: string): string => {
  if (!iso) return "";
  const [, m, d] = iso.split("-");
  return `${d}/${m}/${iso.slice(0, 4)}`;
};

export const calcCompleteness = (
  patientName: string,
  doctorId: string,
  testName: string,
  paramCount: number,
): number => {
  let done = 0;
  if (patientName) done++;
  if (doctorId) done++;
  if (testName) done++;
  if (testName) done++;
  if (paramCount > 0) done++;
  return Math.round((done / 4) * 100);
};

export const getSuggestiveValue = (range: string): string => {
  if (!range) return "13.5";
  // Extract the first number found in the range (e.g. "13.0" from "13.0 - 17.0")
  const match = range.match(/[\d.]+/);
  return match ? match[0] : "13.5";
};
