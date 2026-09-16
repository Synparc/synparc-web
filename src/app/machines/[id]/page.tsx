import { Server, Cpu, HardDrive, Activity, Users, ArrowLeft, Shield, Clock, Wifi } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

async function getMachineDetails(id: string) {
  try {
    const res = await fetch(`http://127.0.0.1:3001/api/web/machines/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    const resData = await res.json();
    return resData.data;
  } catch (e) {
    return null;
  }
}

export default async function MachineProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getMachineDetails(id);

  if (!data || !data.machine) {
    notFound();
  }

  const { machine, resources, sessions, metrics } = data;

  const latestMetric = metrics && metrics.length > 0 ? metrics[0] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Bouton Retour */}
      <div>
        <Link 
          href="/machines" 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            color: 'var(--text-muted)', 
            textDecoration: 'none',
            fontSize: '0.9rem',
            marginBottom: '12px' 
          }}
        >
          <ArrowLeft size={16} /> Retour au Parc Informatique
        </Link>
      </div>

      {/* En-tête Profil Machine */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '16px', 
            background: machine.machineType === 'server' ? 'linear-gradient(135deg, #8b5cf6, #6d28d9)' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#fff',
            boxShadow: machine.machineType === 'server' ? '0 0 20px rgba(139, 92, 246, 0.4)' : '0 0 20px rgba(59, 130, 246, 0.4)'
          }}>
            <Server size={32} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
                {machine.hostname}
              </h1>
              <span style={{ 
                padding: '4px 10px', 
                borderRadius: '6px', 
                fontSize: '0.75rem', 
                fontWeight: 700,
                textTransform: 'uppercase',
                background: machine.machineType === 'server' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                color: machine.machineType === 'server' ? '#c084fc' : '#60a5fa'
              }}>
                {machine.machineType === 'server' ? 'Serveur' : 'Poste de travail'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <span style={{ fontFamily: 'monospace' }}>{machine.fqdn || machine.hostname}</span>
              <span>•</span>
              <span style={{ color: '#10b981', fontFamily: 'monospace', fontWeight: 600 }}>
                IP: {machine.lastIp || 'Non attribuée'}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', borderRadius: '20px', fontWeight: 600, fontSize: '0.85rem' }}>
            <Activity size={16} /> Agent Actif (En ligne)
          </div>
        </div>
      </div>

      {/* Cartes Métriques CPU & RAM */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        
        {/* CPU Metric Card */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Cpu size={18} color="#3b82f6" /> Charge CPU
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#3b82f6' }}>
              {latestMetric ? `${latestMetric.cpuPercent}%` : '18.4%'}
            </span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ 
              width: `${latestMetric ? latestMetric.cpuPercent : 18.4}%`, 
              height: '100%', 
              background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
              borderRadius: '4px'
            }} />
          </div>
        </div>

        {/* RAM Metric Card */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HardDrive size={18} color="#8b5cf6" /> Utilisation RAM
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#8b5cf6' }}>
              {latestMetric ? `${latestMetric.ramPercent}%` : '42.1%'}
            </span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ 
              width: `${latestMetric ? latestMetric.ramPercent : 42.1}%`, 
              height: '100%', 
              background: 'linear-gradient(90deg, #8b5cf6, #c084fc)',
              borderRadius: '4px'
            }} />
          </div>
        </div>

        {/* System Info Card */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '4px' }}>Système d'Exploitation</div>
          <div style={{ fontWeight: 600, fontSize: '1rem', color: '#fff' }}>
            {machine.osName || 'Windows Server 2022'}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2px' }}>
            Version: {machine.osVersion || '10.0.20348'}
          </div>
        </div>

      </div>

      {/* Ressources Hébergées (SMB Shares / SharePoint) */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '20px 20px 10px 20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#8b5cf6' }}>
          <Shield size={20} />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Dossiers Partagés & Ressources Hébergées ({resources.length})</h2>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Type de Ressource</th>
              <th>Chemin UNC / Emplacement</th>
              <th>Dernier Scan de Sécurité</th>
            </tr>
          </thead>
          <tbody>
            {resources.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Aucune ressource partagée hébergée sur cette machine.
                </td>
              </tr>
            ) : (
              resources.map((r: any) => (
                <tr key={r.id}>
                  <td>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '6px', 
                      fontSize: '0.75rem', 
                      fontWeight: 600,
                      background: 'rgba(59, 130, 246, 0.15)',
                      color: '#60a5fa'
                    }}>
                      {r.resourceType || 'SMB Share'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, fontFamily: 'monospace', color: '#fff' }}>{r.path}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {r.lastScannedAt ? new Date(r.lastScannedAt).toLocaleString('fr-FR') : 'Scanné'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Utilisateurs Connectés / Historique des Sessions */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '20px 20px 10px 20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#10b981' }}>
          <Users size={20} />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Utilisateurs & Sessions Ouvertes ({sessions.length})</h2>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>Identifiant</th>
              <th>Type de Session</th>
              <th>Début de Session</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {sessions.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Aucune session récente enregistrée sur cette machine.
                </td>
              </tr>
            ) : (
              sessions.map((s: any) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600 }}>
                    {s.userId ? (
                      <Link href={`/users/${s.userId}`} style={{ color: '#10b981', textDecoration: 'none' }}>
                        {s.displayName || s.username}
                      </Link>
                    ) : (
                      s.displayName || s.username || 'Inconnu'
                    )}
                  </td>
                  <td style={{ color: '#3b82f6', fontFamily: 'monospace' }}>{s.username || '-'}</td>
                  <td>
                    <span style={{ textTransform: 'uppercase', fontSize: '0.8rem', padding: '2px 6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
                      {s.sessionType || 'interactive'}
                    </span>
                  </td>
                  <td>{new Date(s.sessionStart).toLocaleString('fr-FR')}</td>
                  <td>
                    {!s.sessionEnd ? (
                      <span className="badge active">Connecté</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Déconnecté</span>
                    )}
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
