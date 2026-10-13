/**
 * Turns the text of a CSV file into rows of cells.
 *
 * Handles what Google Sheets exports: values wrapped in quotes when
 * they contain a comma ("Dela Cruz, Juan"), doubled quotes inside a
 * quoted value ("He said ""hi"""), and Windows or Mac line endings.
 * Completely blank rows are dropped.
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  // Some programs put an invisible "byte order mark" at the very start.
  if (text.startsWith("﻿")) text = text.slice(1);

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        cell += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  row.push(cell);
  rows.push(row);

  return rows.filter((r) => r.some((value) => value.trim() !== ""));
}
