/**
 * Escape a single CSV field (RFC 4180-style: quote if needed, double internal quotes).
 */
export function escapeCsvField(value: string | number | boolean | null | undefined): string {
  const s = value === null || value === undefined ? "" : String(value)
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

/**
 * Build a CSV string from rows of stringifiable values.
 */
export function rowsToCsv(rows: Array<Array<string | number | boolean | null | undefined>>): string {
  return rows.map((row) => row.map(escapeCsvField).join(",")).join("\r\n")
}

/**
 * Trigger a browser download of CSV text (UTF-8 with BOM for Excel).
 */
export function downloadCsvFile(filename: string, csvContent: string, options?: { bom?: boolean }) {
  const bom = options?.bom === false ? "" : "\uFEFF"
  const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.style.display = "none"
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
