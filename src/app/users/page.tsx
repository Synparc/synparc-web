"use client";

import { useState, useEffect } from "react";
import { Users as UsersIcon, ChevronRight, Download, Printer, Loader2 } from "lucide-react";
import Link from "next/link";
import { apiRoute } from "@/lib/api";
import { exportToCSV, printAuditReport } from "@/lib/exportUtils";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await fetch(apiRoute("/users"), { cache: "no-store" });
      if (res.ok) {
        const resData = await res.json();
        setUsers(resData.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleExportCSV = () => {
    if (users.length === 0) return;
    const headers = ["Nom d'affichage", "Identifiant AD", "Email principal", "Pôle / Département", "Intitulé de poste", "Statut AD"];
    const rows = users.map((u: any) => [
      u.displayName || u.username || "-",
      u.username || "-",
      u.email || "-",
      u.department || "Service IT",
      u.title || "Collaborateur",
      u.adEnabled ? "Actif" : "Désactivé"
    ]);
    exportToCSV("Annuaire_Active_Directory", headers, rows);
  };

  const handlePrintPDF = () => {
    if (users.length === 0) return;
    const headers = ["Nom d'affichage", "Identifiant AD", "Email principal", "Pôle / Département", "Intitulé de poste", "Statut AD"];
    const rows = users.map((u: any) => [
      u.displayName || u.username || "-",
      u.username || "-",
      u.email || "-",
      u.department || "Service IT",
      u.title || "Collaborateur",
      u.adEnabled ? "Actif" : "Désactivé"
    ]);
    printAuditReport("Inventaire de l'Annuaire Active Directory", "Identités et comptes utilisateurs synchronisés", headers, rows);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: '#10b981' }}>
            <UsersIcon size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Annuaire (Active Directory)</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Identités, comptes utilisateurs et attributs Active Directory synchronisés</p>
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
            <Loader2 className="spin" color="#10b981" />
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nom d'affichage</th>
                <th>Identifiant (sAMAccountName)</th>
                <th>Email</th>
                <th>Pôle / Département</th>
                <th>Statut AD</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              ) : (
                users.map((u: any) => (
                  <tr key={u.id}>
                    <td>
                      <Link href={`/users/${u.id}`} style={{ color: '#fff', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                          {(u.displayName || u.username || 'U')[0].toUpperCase()}
                        </div>
                        {u.displayName || u.username}
                      </Link>
                    </td>
                    <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{u.username}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{u.email || '-'}</td>
                    <td>{u.department || 'Service IT'}</td>
                    <td>
                      <span className={`badge ${u.adEnabled ? 'active' : ''}`} style={{ background: u.adEnabled ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: u.adEnabled ? '#10b981' : '#ef4444' }}>
                        {u.adEnabled ? 'Compte Actif' : 'Désactivé'}
                      </span>
                    </td>
                    <td>
                      <Link href={`/users/${u.id}`} style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center' }}>
                        <ChevronRight size={18} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
