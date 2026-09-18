"use client";

import { useState, useEffect } from "react";
import { Server, Activity, ChevronRight, Download, Printer, Loader2 } from "lucide-react";
import Link from "next/link";
import { apiRoute } from "@/lib/api";
import { exportToCSV, printAuditReport } from "@/lib/exportUtils";

export default function MachinesPage() {
  const [machines, setMachines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMachines = async () => {
    try {
      const res = await fetch(apiRoute("/machines"), { cache: "no-store" });
      if (res.ok) {
        const resData = await res.json();
        setMachines(resData.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachines();
    const interval = setInterval(fetchMachines, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleExportCSV = () => {
    if (machines.length === 0) return;
    const headers = ["ID Machine", "Hostname", "FQDN / Domaine", "Type", "Système d'Exploitation", "Adresse IP", "Dernier Checkin"];
    const rows = machines.map((m: any) => [
      m.id,
      m.hostname,
      m.fqdn || "-",
      m.machineType === 'server' ? 'Serveur' : 'Poste de travail',
      `${m.osName || 'Windows'} ${m.osVersion || ''}`.trim(),
      m.lastIp || "127.0.0.1",
      m.lastCheckinAt ? new Date(m.lastCheckinAt).toLocaleString('fr-FR') : "Jamais"
    ]);
    exportToCSV("Inventaire_Parc_Informatique", headers, rows);
  };

  const handlePrintPDF = () => {
    if (machines.length === 0) return;
    const headers = ["ID Machine", "Hostname", "FQDN / Domaine", "Type", "Système d'Exploitation", "Adresse IP", "Dernier Checkin"];
    const rows = machines.map((m: any) => [
      m.id.substring(0, 8) + "...",
      m.hostname,
      m.fqdn || "-",
      m.machineType === 'server' ? 'Serveur' : 'Poste de travail',
      `${m.osName || 'Windows'} ${m.osVersion || ''}`.trim(),
      m.lastIp || "127.0.0.1",
      m.lastCheckinAt ? new Date(m.lastCheckinAt).toLocaleString('fr-FR') : "Jamais"
    ]);
    printAuditReport("Inventaire du Parc Informatique & Serveurs", "Postes connectés et métriques d'enrôlement", headers, rows);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', color: '#3b82f6' }}>
            <Server size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Parc Informatique</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Gestion des serveurs, postes de travail et métriques système en temps réel</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleExportCSV}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#10b981', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
          >
            <Download size={15} /> Export CSV
          </button>
          <button
            onClick={handlePrintPDF}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'rgba(139, 92, 246, 0.15)', border: '1px solid #8b5cf6', color: '#8b5cf6', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
          >
            <Printer size={15} /> Rapport Audit PDF
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Loader2 className="spin" color="#3b82f6" />
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Machine ID</th>
                <th>Hostname</th>
                <th>Type / OS</th>
                <th>Adresse IP</th>
                <th>Dernier Contact</th>
                <th>Statut</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {machines.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Aucune machine enregistrée pour le moment.
                  </td>
                </tr>
              ) : (
                Array.from(
                  machines.reduce((map, m) => {
                    const key = (m.hostname || "").toLowerCase();
                    const existing = map.get(key);
                    if (!existing) {
                      map.set(key, m);
                    } else {
                      const timeM = m.lastCheckinAt ? new Date(m.lastCheckinAt).getTime() : (m.lastSeenAt ? new Date(m.lastSeenAt).getTime() : 0);
                      const timeE = existing.lastCheckinAt ? new Date(existing.lastCheckinAt).getTime() : (existing.lastSeenAt ? new Date(existing.lastSeenAt).getTime() : 0);
                      if (timeM > timeE) map.set(key, m);
                    }
                    return map;
                  }, new Map<string, any>()).values()
                ).map((m: any) => {
                  const lastTime = m.lastCheckinAt ? new Date(m.lastCheckinAt).getTime() : (m.lastSeenAt ? new Date(m.lastSeenAt).getTime() : 0);
                  const diffMinutes = lastTime > 0 ? (Date.now() - lastTime) / (1000 * 60) : 99999;
                  const isOnline = diffMinutes <= 15;
                  const isIdle = diffMinutes > 15 && diffMinutes <= 1440; // Contact < 24h
                  const statusColor = isOnline ? '#10b981' : isIdle ? '#f59e0b' : '#ef4444';
                  const statusText = isOnline ? 'En ligne' : isIdle ? 'Inactif (<24h)' : 'Hors ligne';

                  return (
                    <tr key={m.id} style={{ cursor: 'pointer' }}>
                      <td style={{ fontFamily: 'monospace', color: '#3b82f6' }}>
                        <Link href={`/machines/${m.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                          {m.id.substring(0,8)}...
                        </Link>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        <Link href={`/machines/${m.id}`} style={{ color: 'var(--foreground)', textDecoration: 'none' }}>
                          {m.hostname}
                        </Link>
                      </td>
                      <td>
                        <span style={{ 
                          padding: '4px 8px', 
                          borderRadius: '6px', 
                          fontSize: '0.75rem', 
                          fontWeight: 600,
                          background: m.machineType === 'server' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                          color: m.machineType === 'server' ? '#a78bfa' : '#60a5fa',
                          marginRight: '8px'
                        }}>
                          {m.machineType === 'server' ? 'Serveur' : 'Poste'}
                        </span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {m.osName || 'OS Inconnu'} {m.osVersion || ''}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{m.lastIp || "Non disponible"}</td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {m.lastCheckinAt ? new Date(m.lastCheckinAt).toLocaleString('fr-FR') : "Jamais"}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Activity size={16} color={statusColor} />
                          <span style={{ fontSize: '0.85rem', color: statusColor, fontWeight: 500 }}>{statusText}</span>
                        </div>
                      </td>
                      <td>
                        <Link href={`/machines/${m.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#3b82f6', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500 }}>
                          Détails <ChevronRight size={16} />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
