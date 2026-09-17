import { Activity, Server, Users, ShieldAlert, Cpu, AlertTriangle, ShieldCheck, CheckCircle2, ChevronRight } from "lucide-react";
import Link from "next/link";
import { apiRoute } from "@/lib/api";
import AutoRefresh from "@/components/AutoRefresh";
import DashboardCharts from "@/components/DashboardCharts";

async function getStats() {
  try {
    const [machinesRes, usersRes, activityRes, auditRes] = await Promise.all([
      fetch(apiRoute("/machines"), { cache: "no-store" }),
      fetch(apiRoute("/users"), { cache: "no-store" }),
      fetch(apiRoute("/dashboard/activity"), { cache: "no-store" }),
      fetch(apiRoute("/audit/security"), { cache: "no-store" })
    ]);
    
    const machinesData = machinesRes.ok ? await machinesRes.json() : { data: [] };
    const usersData = usersRes.ok ? await usersRes.json() : { data: [] };
    const activityData = activityRes.ok ? await activityRes.json() : { data: [] };
    const auditData = auditRes.ok ? await auditRes.json() : { data: { score: 100, riskCounts: { critical: 0, high: 0, medium: 0, low: 0 }, alerts: [] } };
    
    return {
      machines: machinesData.data || [],
      users: usersData.data || [],
      machineCount: machinesData.data ? machinesData.data.length : 0,
      userCount: usersData.data ? usersData.data.length : 0,
      recentActivity: activityData.data || [],
      audit: auditData.data || { score: 100, riskCounts: { critical: 0, high: 0, medium: 0, low: 0 }, alerts: [] }
    };
  } catch (e) {
    return { machines: [], users: [], machineCount: 0, userCount: 0, recentActivity: [], audit: { score: 100, riskCounts: { critical: 0, high: 0, medium: 0, low: 0 }, alerts: [] } };
  }
}

export default async function DashboardPage() {
  const stats = await getStats();
  const { audit } = stats;

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div>
      <AutoRefresh intervalMs={15000} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Vue d'ensemble SI & Posture de Sécurité</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Tableau de bord unifié du parc informatique, des identités AD et de l'audit des accès</p>
        </div>
      </div>
      
      {/* KPI CARDS & SCORE DE SÉCURITÉ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        
        {/* Stat Card 1: Score de Sécurité */}
        <div className="glass-panel interactive" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -20, right: -20, opacity: 0.1, color: getScoreColor(audit.score) }}>
            <ShieldCheck size={120} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ padding: '10px', background: `${getScoreColor(audit.score)}20`, borderRadius: '10px', color: getScoreColor(audit.score) }}>
              <ShieldCheck size={22} />
            </div>
            <h3 style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.9rem' }}>Score Posture Sécurité</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '2.75rem', fontWeight: 800, color: getScoreColor(audit.score) }}>{audit.score}%</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ 100</span>
          </div>
        </div>

        {/* Stat Card 2: Serveurs & Postes */}
        <div className="glass-panel interactive" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -20, right: -20, opacity: 0.1, color: '#3b82f6' }}>
            <Server size={120} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ padding: '10px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '10px', color: '#3b82f6' }}>
              <Server size={22} />
            </div>
            <h3 style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.9rem' }}>Serveurs & Postes</h3>
          </div>
          <div style={{ fontSize: '2.75rem', fontWeight: 800, color: '#fff' }}>{stats.machineCount}</div>
        </div>

        {/* Stat Card 3: Identités AD */}
        <div className="glass-panel interactive" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -20, right: -20, opacity: 0.1, color: '#10b981' }}>
            <Users size={120} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '10px', color: '#10b981' }}>
              <Users size={22} />
            </div>
            <h3 style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.9rem' }}>Identités AD</h3>
          </div>
          <div style={{ fontSize: '2.75rem', fontWeight: 800, color: '#fff' }}>{stats.userCount}</div>
        </div>

        {/* Stat Card 4: Alertes Critiques & Élevées */}
        <div className="glass-panel interactive" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -20, right: -20, opacity: 0.1, color: '#ef4444' }}>
            <ShieldAlert size={120} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '10px', color: '#ef4444' }}>
              <ShieldAlert size={22} />
            </div>
            <h3 style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.9rem' }}>Risques Critiques & Élevés</h3>
          </div>
          <div style={{ fontSize: '2.75rem', fontWeight: 800, color: (audit.riskCounts.critical + audit.riskCounts.high) > 0 ? '#ef4444' : '#10b981' }}>
            {audit.riskCounts.critical + audit.riskCounts.high}
          </div>
        </div>
      </div>

      {/* WIDGET ALERTES DE SÉCURITÉ ET CONFORMITÉ */}
      {audit.alerts && audit.alerts.length > 0 && (
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', color: '#f59e0b' }}>
              <AlertTriangle size={22} />
              Alertes de Sécurité Identifiées ({audit.alerts.length})
            </h2>
            <Link href="/permissions" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#3b82f6', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>
              Consulter l'Audit de Sécurité Complet <ChevronRight size={16} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {audit.alerts.slice(0, 4).map((alert: any) => (
              <div 
                key={alert.id} 
                style={{
                  padding: '14px 16px',
                  borderRadius: '8px',
                  background: 'rgba(0,0,0,0.2)',
                  border: `1px solid ${
                    alert.severity === 'critical' ? 'rgba(239, 68, 68, 0.4)' :
                    alert.severity === 'high' ? 'rgba(245, 158, 11, 0.4)' :
                    'rgba(59, 130, 246, 0.3)'
                  }`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span 
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        background: alert.severity === 'critical' ? '#ef4444' : alert.severity === 'high' ? '#f59e0b' : '#3b82f6',
                        color: '#fff'
                      }}
                    >
                      {alert.severity}
                    </span>
                    <span style={{ fontWeight: 600, color: '#fff' }}>{alert.title}</span>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{alert.description}</div>
                </div>
                {alert.targetUrl && (
                  <Link 
                    href={alert.targetUrl}
                    style={{
                      padding: '6px 12px',
                      background: 'rgba(255,255,255,0.08)',
                      borderRadius: '6px',
                      color: '#fff',
                      textDecoration: 'none',
                      fontSize: '0.8rem',
                      whiteSpace: 'nowrap',
                      fontWeight: 500
                    }}
                  >
                    Examiner →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CHARTS DE GRAPHIQUES DE PARC ET DROITS */}
      <DashboardCharts machines={stats.machines} users={stats.users} />

      {/* ACTIVITÉ RÉCENTE */}
      <div className="glass-panel" style={{ padding: '24px', marginTop: '32px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '16px' }}>Activité Récente</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {stats.recentActivity.length === 0 ? (
            <div style={{ color: 'var(--text-muted)' }}>Aucune activité récente.</div>
          ) : (
            stats.recentActivity.map((act: any) => (
              <div key={act.id} style={{ display: 'flex', gap: '16px' }}>
                <div style={{ marginTop: 4, color: act.type === 'machine_checkin' ? '#3b82f6' : '#10b981' }}>
                  <Activity size={20} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 4 }}>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{act.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(act.date).toLocaleString('fr-FR')}
                    </div>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{act.description}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
