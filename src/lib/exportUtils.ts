/**
 * Utilitaire d'exportation de données et de rapports de conformité pour Synparc
 */

export function exportToCSV(filename: string, headers: string[], rows: (string | number | boolean | null | undefined)[][]) {
  const sanitizeCell = (cell: any): string => {
    if (cell === null || cell === undefined) return '""';
    const str = String(cell).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvContent = [
    headers.map(sanitizeCell).join(";"),
    ...rows.map((row) => row.map(sanitizeCell).join(";")),
  ].join("\r\n");

  // Add UTF-8 BOM for Microsoft Excel compatibility
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function printAuditReport(
  title: string,
  subtitle: string,
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][]
) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const dateStr = new Date().toLocaleString("fr-FR");

  const tableHeaders = headers.map((h) => `<th style="border: 1px solid #cbd5e1; padding: 10px; background-color: #f1f5f9; text-align: left; font-weight: 600; font-size: 13px;">${h}</th>`).join("");
  const tableRows = rows
    .map(
      (row) =>
        `<tr>${row
          .map(
            (cell) =>
              `<td style="border: 1px solid #e2e8f0; padding: 8px 10px; font-size: 12px; color: #334155;">${
                cell === null || cell === undefined ? "-" : String(cell)
              }</td>`
          )
          .join("")}</tr>`
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <title>${title} - Synparc Audit</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0f172a; margin: 30px; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #8b5cf6; padding-bottom: 12px; margin-bottom: 20px; }
        .logo { font-size: 24px; font-weight: 800; color: #6d28d9; letter-spacing: 1px; }
        .subtitle { font-size: 13px; color: #64748b; margin-top: 4px; }
        .meta { text-align: right; font-size: 12px; color: #64748b; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        .footer { margin-top: 40px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 12px; }
        @media print {
          body { margin: 15mm; }
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="logo">SYNPARC <span style="font-size: 14px; font-weight: 500; color: #475569;">| Audit & Conformité SI</span></div>
          <div style="font-size: 18px; font-weight: 700; margin-top: 6px;">${title}</div>
          <div class="subtitle">${subtitle}</div>
        </div>
        <div class="meta">
          <div><strong>Généré le :</strong> ${dateStr}</div>
          <div><strong>Éléments exportés :</strong> ${rows.length}</div>
          <div><strong>Statut :</strong> Confidentiel / Interne</div>
        </div>
      </div>

      <table>
        <thead><tr>${tableHeaders}</tr></thead>
        <tbody>${tableRows}</tbody>
      </table>

      <div class="footer">
        Document d'audit de sécurité généré automatiquement par la plateforme Synparc — Système d'Inventaire et de Cartographie des Permissions AD/M365
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 400);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
