'use client';

import { useState, useEffect } from 'react';
import { 
  FileCheck, Shield, AlertTriangle, CheckCircle2, XCircle, 
  Download, Printer, Filter, Search, ArrowRight, ExternalLink, 
  HelpCircle, ChevronDown, ChevronUp, Layers, Key, Server, Cloud, UserX, Info
} from 'lucide-react';
import { exportToCSV, printNIS2AuditReport } from '@/lib/exportUtils';

export default function CompliancePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [entityCategory, setEntityCategory] = useState<'EE' | 'EI'>('EE'); // EE = Entité Essentielle, EI = Entité Importante
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterStandard, setFilterStandard] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchComplianceData();
  }, []);

  const fetchComplianceData = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://127.0.0.1:3001/api/web/compliance/nis2');
      const json = await res.json();
      if (json.status === 'success') {
        setData(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch compliance data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!data) return;
    const headers = ['Article NIS2', 'ISO 27001', 'Titre Exigence', 'Statut', 'Criticité', 'Impact Score', 'Preuve Technique (SI)', 'Recommandation'];
    const rows = data.checkpoints.map((c: any) => [
      c.nis2Article,
      c.isoControl,
      c.title,
      c.status === 'pass' ? 'Conforme' : c.status === 'warn' ? 'Avertissement' : 'Non Conforme',
      c.severity,
      `-${c.scoreImpact} pts`,
      c.evidence,
      c.recommendation
    ]);
    exportToCSV(`Synthese_Conformite_NIS2_ISO27001_${entityCategory}`, headers, rows);
  };

  const handlePrintPDF = () => {
    if (!data) return;
    printNIS2AuditReport(
      data.overallScore,
      data.nis2Status,
      entityCategory,
      data.pillars,
      data.checkpoints
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="spinner" style={{ width: 40, height: 40, border: '4px solid rgba(139,92,246,0.2)', borderTopColor: '#8b5cf6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ marginTop: 16, color: 'var(--text-muted)' }}>Évaluation automatique des exigences NIS2 & ISO 27001 en cours...</p>
      </div>
    );
  }

  const score = data?.overallScore || 0;
  const statusColor = score >= 85 ? '#10b981' : score >= 65 ? '#f59e0b' : '#ef4444';
  const statusLabel = score >= 85 ? 'Conforme NIS2' : score >= 65 ? 'Partiellement Conforme' : 'Non Conforme - Risque Légal';

  const filteredCheckpoints = (data?.checkpoints || []).filter((c: any) => {
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    if (filterStandard === 'nis2' && !c.nis2Article) return false;
    if (filterStandard === 'iso' && !c.isoControl) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.title.toLowerCase().includes(q) ||
        c.evidence.toLowerCase().includes(q) ||
        c.nis2Article.toLowerCase().includes(q) ||
        c.isoControl.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div style={{ paddingBottom: '3rem' }}>
      
      {/* En-tête Principal de Gouvernance */}
      <div className="glass-panel" style={{ padding: '28px', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '220px', height: '220px', background: `radial-gradient(circle, ${statusColor}22 0%, transparent 70%)`, pointerEvents: 'none' }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ padding: '8px', background: 'rgba(139, 92, 246, 0.2)', color: '#c084fc', borderRadius: '8px' }}>
                <FileCheck size={24} />
              </div>
              <div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Centre de Gouvernance & Conformité NIS2 / ISO 27001
                </h1>
                <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Évaluation continue et matrice de preuves réglementaires pour la Directive Européenne (UE) 2022/2555
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="btn btn-secondary" onClick={handleExportCSV} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px' }}>
              <Download size={16} /> Export CSV
            </button>
            <button className="btn btn-primary" onClick={handlePrintPDF} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' }}>
              <Printer size={16} /> Rapport d'Audit Officiel (PDF)
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          
          {/* Jauge Global Compliance */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ position: 'relative', width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="70" height="70" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={statusColor} strokeWidth="3.5" strokeDasharray={`${score}, 100`} strokeLinecap="round" />
              </svg>
              <span style={{ position: 'absolute', fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>{score}%</span>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Score de Conformité Global</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: statusColor, marginTop: '2px' }}>{statusLabel}</div>
              <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '2px' }}>Directive UE NIS2 Art. 21</div>
            </div>
          </div>

          {/* Catégorie d'Entité */}
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px' }}>Catégorie d'Entité Réglementée</div>
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <button 
                onClick={() => setEntityCategory('EE')}
                style={{ flex: 1, padding: '6px 12px', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', background: entityCategory === 'EE' ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' : 'transparent', color: entityCategory === 'EE' ? '#fff' : 'var(--text-muted)', transition: 'all 0.2s' }}
              >
                Entité Essentielle (EE)
              </button>
              <button 
                onClick={() => setEntityCategory('EI')}
                style={{ flex: 1, padding: '6px 12px', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', background: entityCategory === 'EI' ? 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' : 'transparent', color: entityCategory === 'EI' ? '#fff' : 'var(--text-muted)', transition: 'all 0.2s' }}
              >
                Entité Importante (EI)
              </button>
            </div>
          </div>

          {/* Synthèse des Checkpoints */}
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>{data?.stats?.passCheckpoints || 0}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Conformes</div>
            </div>
            <div style={{ height: '30px', width: '1px', background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b' }}>{data?.stats?.warnCheckpoints || 0}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Avertissements</div>
            </div>
            <div style={{ height: '30px', width: '1px', background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444' }}>{data?.stats?.failCheckpoints || 0}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Non Conformes</div>
            </div>
          </div>

        </div>
      </div>

      {/* Cartes des 5 Piliers NIS2 */}
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Layers size={20} style={{ color: '#8b5cf6' }} /> Piliers d'Égalité & Exigences NIS2 (Art. 21)
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {(data?.pillars || []).map((p: any) => {
          const pillarColor = p.score >= 85 ? '#10b981' : p.score >= 60 ? '#f59e0b' : '#ef4444';
          return (
            <div key={p.id} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '3px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', color: '#c084fc', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {p.nis2Article}
                  </span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: pillarColor }}>{p.score}%</span>
                </div>
                
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '8px 0 4px 0', color: '#fff', lineHeight: '1.3' }}>{p.name}</h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.isoControl}</div>
              </div>

              <div style={{ marginTop: '16px' }}>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' }}>
                  <div style={{ width: `${p.score}%`, height: '100%', background: pillarColor, transition: 'width 0.5s ease' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>{p.passCount} valides</span>
                  {p.failCount > 0 && <span style={{ color: '#ef4444', fontWeight: 600 }}>{p.failCount} échecs</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Section Matrice des Checkpoints */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={20} style={{ color: '#3b82f6' }} /> Matrice des Checkpoints & Preuves d'Audit
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Constats réels calculés en temps réel d'après les données d'Active Directory, M365 et des agents.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '220px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Rechercher une exigence..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '8px 12px 8px 36px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
              />
            </div>

            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
            >
              <option value="all">Tous les statuts</option>
              <option value="pass">Conformes uniquement</option>
              <option value="warn">Avertissements</option>
              <option value="fail">Non Conformes (Critiques)</option>
            </select>
          </div>
        </div>

        {/* Liste des Checkpoints */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredCheckpoints.map((c: any) => {
            const isExpanded = expandedId === c.id;
            const badgeColor = c.status === 'pass' ? '#10b981' : c.status === 'warn' ? '#f59e0b' : '#ef4444';

            return (
              <div 
                key={c.id} 
                style={{ 
                  background: 'rgba(255,255,255,0.02)', 
                  border: '1px solid rgba(255,255,255,0.06)', 
                  borderRadius: '10px', 
                  overflow: 'hidden',
                  transition: 'all 0.2s' 
                }}
              >
                <div 
                  onClick={() => setExpandedId(isExpanded ? null : c.id)}
                  style={{ 
                    padding: '16px 20px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    cursor: 'pointer',
                    background: isExpanded ? 'rgba(255,255,255,0.04)' : 'transparent'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                    <div style={{ padding: '8px', background: `${badgeColor}18`, borderRadius: '8px', color: badgeColor }}>
                      {c.status === 'pass' ? <CheckCircle2 size={20} /> : c.status === 'warn' ? <AlertTriangle size={20} /> : <XCircle size={20} />}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3b82f6', background: 'rgba(59,130,246,0.12)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(59,130,246,0.2)' }}>
                          {c.nis2Article}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {c.isoControl}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '4px 0 0 0', color: '#fff' }}>
                        {c.title}
                      </h4>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {c.scoreImpact > 0 && (
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '4px 10px', borderRadius: '12px' }}>
                        -{c.scoreImpact} pts
                      </span>
                    )}
                    <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700, background: `${badgeColor}20`, color: badgeColor }}>
                      {c.status === 'pass' ? 'Conforme' : c.status === 'warn' ? 'Avertissement' : 'Non Conforme'}
                    </span>
                    {isExpanded ? <ChevronUp size={18} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={18} style={{ color: 'var(--text-muted)' }} />}
                  </div>
                </div>

                {/* Panneau de Détail & Assistant de Résolution */}
                {isExpanded && (
                  <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                      
                      {/* Constat & Preuve */}
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#3b82f6', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Info size={16} /> Preuve Technique Collectée (SI)
                        </div>
                        <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', fontSize: '0.875rem', color: '#e2e8f0', fontFamily: 'monospace' }}>
                          {c.evidence}
                        </div>
                      </div>

                      {/* Recommandation de Résolution */}
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#8b5cf6', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Shield size={16} /> Plan d'Action Correctif Recomendé
                        </div>
                        <div style={{ padding: '12px 16px', background: 'rgba(139, 92, 246, 0.08)', borderRadius: '8px', border: '1px solid rgba(139, 92, 246, 0.2)', fontSize: '0.875rem', color: '#d8b4fe' }}>
                          {c.recommendation}
                        </div>
                      </div>

                    </div>

                    {c.targetUrl && (
                      <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                        <a 
                          href={c.targetUrl} 
                          className="btn btn-secondary" 
                          style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px' }}
                        >
                          Accéder au composant concerné <ExternalLink size={14} />
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Plan d'Action Priorisé (Remediation Roadmap) */}
      {(data?.remediationRoadmap || []).length > 0 && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b' }}>
            <ArrowRight size={20} /> Feuille de Route de Remédiation Prioritaire
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
            Actions recommandées classées par impact direct sur le score global de conformité NIS2.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.remediationRoadmap.map((item: any, idx: number) => (
              <div 
                key={item.checkpointId} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '14px 18px', 
                  background: 'rgba(255,255,255,0.03)', 
                  borderRadius: '8px', 
                  borderLeft: `4px solid ${item.severity === 'critical' ? '#ef4444' : '#f59e0b'}` 
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-muted)', width: '24px' }}>#{idx + 1}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>{item.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{item.recommendation}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10b981', background: 'rgba(16, 185, 129, 0.12)', padding: '4px 10px', borderRadius: '12px' }}>
                    +{item.scoreGain}% de score
                  </span>
                  {item.targetUrl && (
                    <a href={item.targetUrl} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                      Corriger
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
