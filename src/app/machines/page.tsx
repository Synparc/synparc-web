import { Server, Activity } from "lucide-react";

async function getMachines() {
  try {
    const res = await fetch("http://localhost:3000/api/web/machines", { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
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
        <h1>Parc Informatique</h1>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Machine ID</th>
              <th>Hostname</th>
              <th>Système d'exploitation</th>
              <th>Statut réseau</th>
              <th>Dernier Contact</th>
              <th>Métriques Actuelles</th>
            </tr>
          </thead>
          <tbody>
            {machines.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Aucune machine enregistrée pour le moment.
                </td>
              </tr>
            ) : (
              machines.map((m: any) => (
                <tr key={m.id}>
                  <td style={{ fontFamily: 'monospace', color: '#3b82f6' }}>{m.id.substring(0,8)}...</td>
                  <td style={{ fontWeight: 600 }}>{m.hostname}</td>
                  <td>{m.osName} {m.osVersion}</td>
                  <td>{m.ipAddress}</td>
                  <td>{new Date(m.lastContactAt).toLocaleString()}</td>
                  <td>
                    {/* Placeholder for metrics visualization */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Activity size={16} color="#10b981" />
                      <span style={{ fontSize: '0.85rem' }}>En ligne</span>
                    </div>
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
