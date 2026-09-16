import { Server, Activity, ChevronRight } from "lucide-react";
import Link from "next/link";

async function getMachines() {
  try {
    const res = await fetch("http://127.0.0.1:3001/api/web/machines", { cache: "no-store" });
    if (!res.ok) return [];
    const resData = await res.json();
    return resData.data || [];
  } catch (e) {
    return [];
  }
}

export default async function MachinesPage() {
  const machines = await getMachines();

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <div style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', color: '#3b82f6' }}>
          <Server size={28} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Parc Informatique</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Gestion des serveurs, postes de travail et métriques système en temps réel</p>
        </div>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
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
              machines.map((m: any) => (
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
                      <Activity size={16} color="#10b981" />
                      <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 500 }}>En ligne</span>
                    </div>
                  </td>
                  <td>
                    <Link href={`/machines/${m.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#3b82f6', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500 }}>
                      Détails <ChevronRight size={16} />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

