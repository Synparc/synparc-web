"use client";

import { useState, useEffect } from "react";
import { Settings, Key, RefreshCcw, ShieldCheck, Plus, CheckCircle2, AlertCircle } from "lucide-react";

export default function SettingsPage() {
  const [licenses, setLicenses] = useState<any[]>([]);
  const [syncRuns, setSyncRuns] = useState<any[]>([]);
  const [tokens, setTokens] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [newToken, setNewToken] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resLic, resSync, resTokens] = await Promise.all([
        fetch("http://127.0.0.1:3001/api/web/settings/licenses", { cache: "no-store" }),
        fetch("http://127.0.0.1:3001/api/web/settings/sync-runs", { cache: "no-store" }),
        fetch("http://127.0.0.1:3001/api/web/settings/tokens", { cache: "no-store" })
      ]);

      if (resLic.ok) {
        const data = await resLic.json();
        setLicenses(data.data || []);
      }
      if (resSync.ok) {
        const data = await resSync.json();
        setSyncRuns(data.data || []);
      }
      if (resTokens.ok) {
        const data = await resTokens.json();
        setTokens(data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const generateToken = async () => {
    setGenerating(true);
    try {
      const res = await fetch("http://127.0.0.1:3001/api/web/settings/tokens/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        const data = await res.json();
        setNewToken(data.data.rawToken);
        // Refresh token list
        fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <div style={{ padding: '12px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px', color: '#8b5cf6' }}>
          <Settings size={28} />
        </div>
        <h1>Paramètres Système</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        
        {/* LICENCE */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '1.25rem' }}>
            <Key size={20} color="#8b5cf6" />
            Licence Synparc
          </h2>
          {loading ? <p style={{ color: 'var(--text-muted)' }}>Chargement...</p> : (
            licenses.length === 0 ? <p>Aucune licence active.</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {licenses.map(lic => (
                  <div key={lic.id} style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 600 }}>{lic.issuedTo}</span>
                      <span className={`badge ${lic.status === 'active' ? 'active' : ''}`}>{lic.status.toUpperCase()}</span>
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>
                      Clé: {lic.keyValue}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      Limite: {lic.maxNodes} machines
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* TOKENS */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem' }}>
              <ShieldCheck size={20} color="#10b981" />
              Jetons d'Enrôlement (Agents)
            </h2>
            <button onClick={generateToken} disabled={generating} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: generating ? 'not-allowed' : 'pointer',
              opacity: generating ? 0.7 : 1
            }}>
              <Plus size={16} /> {generating ? 'Génération...' : 'Nouveau'}
            </button>
          </div>

          {newToken && (
            <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', marginBottom: '8px', fontWeight: 600 }}>
                <CheckCircle2 size={16} /> Nouveau jeton généré (à copier) :
              </div>
              <code style={{ background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '4px', display: 'block', wordBreak: 'break-all' }}>
                {newToken}
              </code>
            </div>
          )}

          {loading ? <p style={{ color: 'var(--text-muted)' }}>Chargement...</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {tokens.slice(0, 5).map(token => (
                <div key={token.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                  <span style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{token.tokenHash.substring(0, 16)}...</span>
                  <span className={`badge ${!token.revoked ? 'active' : ''}`}>{!token.revoked ? 'Valide' : 'Révoqué'}</span>
                </div>
              ))}
              {tokens.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Aucun jeton.</p>}
            </div>
          )}
        </div>

        {/* SYNC RUNS */}
        <div className="glass-panel" style={{ padding: '24px', gridColumn: '1 / -1' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '1.25rem' }}>
            <RefreshCcw size={20} color="#3b82f6" />
            Historique des Synchronisations
          </h2>
          
          {loading ? <p style={{ color: 'var(--text-muted)' }}>Chargement...</p> : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Connecteur</th>
                  <th>Début</th>
                  <th>Statut</th>
                  <th>Enregistrements</th>
                  <th>Message</th>
                </tr>
              </thead>
              <tbody>
                {syncRuns.map(run => (
                  <tr key={run.id}>
                    <td style={{ fontWeight: 600, textTransform: 'uppercase' }}>{run.connectorType}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{new Date(run.startedAt).toLocaleString()}</td>
                    <td>
                      {run.status === 'success' && <span className="badge active">SUCCÈS</span>}
                      {run.status === 'failed' && <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>ÉCHEC</span>}
                      {run.status === 'partial' && <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b' }}>PARTIEL</span>}
                    </td>
                    <td>{run.recordsProcessed || 0}</td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {run.errorMessage && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <AlertCircle size={14} color="#f59e0b" />
                          {run.errorMessage}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {syncRuns.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Aucune synchronisation récente.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}
