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

export function printNIS2AuditReport(
  overallScore: number,
  nis2Status: string,
  entityCategory: string,
  pillars: any[],
  checkpoints: any[]
) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const dateStr = new Date().toLocaleString("fr-FR");
  const statusColor = overallScore >= 85 ? "#10b981" : overallScore >= 65 ? "#f59e0b" : "#ef4444";
  const statusText = overallScore >= 85 ? "CONFORME NIS2" : overallScore >= 65 ? "PARTIELLEMENT CONFORME" : "NON CONFORME NIS2";

  const pillarsHtml = pillars.map(p => `
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; font-size: 12px;">
      <div style="font-weight: 700; color: #1e293b;">${p.name}</div>
      <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${p.nis2Article} • ${p.isoControl}</div>
      <div style="font-size: 18px; font-weight: 800; color: ${p.score >= 85 ? '#10b981' : p.score >= 60 ? '#f59e0b' : '#ef4444'}; margin-top: 6px;">${p.score}%</div>
    </div>
  `).join("");

  const tableRows = checkpoints.map(c => `
    <tr>
      <td style="border: 1px solid #e2e8f0; padding: 8px; font-size: 11px; font-weight: 700; color: #3b82f6;">${c.nis2Article}<br><span style="font-size: 9px; color: #64748b;">${c.isoControl}</span></td>
      <td style="border: 1px solid #e2e8f0; padding: 8px; font-size: 12px; font-weight: 600;">${c.title}</td>
      <td style="border: 1px solid #e2e8f0; padding: 8px; font-size: 11px; font-family: monospace;">${c.evidence}</td>
      <td style="border: 1px solid #e2e8f0; padding: 8px; text-align: center;">
        <span style="display: inline-block; padding: 3px 8px; border-radius: 12px; font-size: 10px; font-weight: 700; color: #fff; background-color: ${c.status === 'pass' ? '#10b981' : c.status === 'warn' ? '#f59e0b' : '#ef4444'};">
          ${c.status === 'pass' ? 'CONFORME' : c.status === 'warn' ? 'AVERTISSEMENT' : 'NON CONFORME'}
        </span>
      </td>
    </tr>
  `).join("");

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <title>Rapport d'Audit Officiel NIS2 & ISO 27001 - Synparc</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0f172a; margin: 25mm 20mm; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #3b82f6; padding-bottom: 16px; margin-bottom: 24px; }
        .logo { font-size: 26px; font-weight: 800; color: #1e3a8a; letter-spacing: 1px; }
        .score-box { text-align: center; background: #f1f5f9; border-radius: 12px; padding: 16px 24px; border: 2px solid ${statusColor}; }
        .score-val { font-size: 38px; font-weight: 900; color: ${statusColor}; line-height: 1; }
        .score-status { font-size: 12px; font-weight: 800; color: ${statusColor}; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px; }
        .grid-4 { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-bottom: 24px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th { background: #0f172a; color: #fff; text-align: left; padding: 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
        .sign-box { margin-top: 40px; display: flex; justify-content: space-between; padding-top: 20px; border-top: 2px dashed #cbd5e1; }
        .footer { margin-top: 30px; font-size: 10px; color: #94a3b8; text-align: center; }
        @media print { body { margin: 15mm; } button { display: none; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="logo">SYNPARC <span style="font-size: 14px; font-weight: 500; color: #64748b;">| Direction de la Cybersécurité</span></div>
          <div style="font-size: 20px; font-weight: 800; margin-top: 8px;">Dossier d'Évaluation & Conformité NIS2 / ISO 27001:2022</div>
          <div style="font-size: 13px; color: #475569; margin-top: 4px;">Analyse d'Audit Automatisée • Catégorie : <strong>Entité ${entityCategory === 'EE' ? 'Essentielle (EE)' : 'Importante (EI)'}</strong></div>
          <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Horodatage de l'analyse : ${dateStr}</div>
        </div>
        <div class="score-box">
          <div class="score-val">${overallScore}%</div>
          <div class="score-status">${statusText}</div>
        </div>
      </div>

      <h3 style="font-size: 14px; font-weight: 700; text-transform: uppercase; color: #334155; margin-bottom: 10px;">Résultats Synthétiques par Pilier d'Exigence NIS2</h3>
      <div class="grid-4">${pillarsHtml}</div>

      <h3 style="font-size: 14px; font-weight: 700; text-transform: uppercase; color: #334155; margin-bottom: 10px; margin-top: 24px;">Matrice Officielle de Preuves Techniques & Checkpoints</h3>
      <table>
        <thead>
          <tr>
            <th style="width: 15%;">Référentiel</th>
            <th style="width: 35%;">Exigence Reglementaire</th>
            <th style="width: 35%;">Constat & Preuve Technique (SI)</th>
            <th style="width: 15%; text-align: center;">Évaluation</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>

      <div class="sign-box">
        <div>
          <div style="font-size: 11px; font-weight: 700; color: #475569;">AUDITEUR / DSI RESPONSABLE</div>
          <div style="font-size: 12px; font-weight: 600; margin-top: 4px;">Djael M. — Administrateur Système & Sécurité</div>
          <div style="font-size: 10px; color: #94a3b8;">Synparc Autonomous Security Engine</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 11px; font-weight: 700; color: #475569;">ATTESTATION D'EVALUATION</div>
          <div style="font-size: 10px; color: #94a3b8; margin-top: 4px;">Document certifié conforme aux métriques collectées</div>
        </div>
      </div>

      <div class="footer">
        Dossier de Conformité Légale généré par la plateforme Synparc — Directive (UE) 2022/2555 (NIS2) & ISO/IEC 27001:2022
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() { window.print(); }, 400);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

