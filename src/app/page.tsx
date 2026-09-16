import { Activity, ShieldAlert, Users, Server } from "lucide-react";

async function getStats() {
  try {
    const [machinesRes, usersRes] = await Promise.all([
      fetch("http://localhost:3000/api/web/machines", { cache: "no-store" }),
      fetch("http://localhost:3000/api/web/users", { cache: "no-store" }),
    ]);
    
    const machines = machinesRes.ok ? await machinesRes.json() : [];
    const users = usersRes.ok ? await usersRes.json() : [];
    
    return {
      machineCount: machines.length,
      userCount: users.length,
    };
  } catch (e) {
    return { machineCount: 0, userCount: 0 };
  }
}

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div>
      <h1>Vue d'ensemble</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        
        {/* Stat Card 1 */}
        <div className="glass-panel interactive" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -20, right: -20, opacity: 0.1, color: '#3b82f6' }}>
            <Server size={120} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', color: '#3b82f6' }}>
              <Server size={24} />
            </div>
            <h3 style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Serveurs & Postes</h3>
          </div>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: '#fff' }}>{stats.machineCount}</div>
        </div>

        {/* Stat Card 2 */}
        <div className="glass-panel interactive" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -20, right: -20, opacity: 0.1, color: '#10b981' }}>
            <Users size={120} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: '#10b981' }}>
              <Users size={24} />
            </div>
            <h3 style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Identités AD</h3>
          </div>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: '#fff' }}>{stats.userCount}</div>
        </div>

        {/* Stat Card 3 */}
        <div className="glass-panel interactive" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -20, right: -20, opacity: 0.1, color: '#f59e0b' }}>
            <ShieldAlert size={120} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ padding: '12px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', color: '#f59e0b' }}>
              <ShieldAlert size={24} />
            </div>
            <h3 style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Alertes Sécurité</h3>
          </div>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: '#fff' }}>0</div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h2>Activité Récente</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
          {/* Timeline Item */}
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ marginTop: 4, color: '#3b82f6' }}><Activity size={20} /></div>
            <div>
              <div style={{ fontWeight: 600, color: '#fff', marginBottom: 4 }}>Check-in de l'Agent réussi</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Une nouvelle machine vient de s'enregistrer et de transmettre ses métriques au serveur central.</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ marginTop: 4, color: '#10b981' }}><Activity size={20} /></div>
            <div>
              <div style={{ fontWeight: 600, color: '#fff', marginBottom: 4 }}>Synchronisation AD terminée</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Le connecteur Active Directory a mis à jour les identités avec succès.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
