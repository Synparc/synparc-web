"use client";

import { useState, useEffect } from "react";
import { 
  Settings, 
  Key, 
  RefreshCcw, 
  ShieldCheck, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Ban, 
  Server, 
  Zap, 
  Database,
  Cloud,
  Check
} from "lucide-react";
import { apiRoute } from "@/lib/api";

export default function SettingsPage() {
  const [licenses, setLicenses] = useState<any[]>([]);
  const [syncRuns, setSyncRuns] = useState<any[]>([]);
  const [tokens, setTokens] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [newToken, setNewToken] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);

  // Sync state
  const [syncingType, setSyncingType] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Form states for License Activation
  const [showLicenseForm, setShowLicenseForm] = useState(false);
  const [licKeyInput, setLicKeyInput] = useState("");
  const [licIssuedToInput, setLicIssuedToInput] = useState("");
  const [licNodesInput, setLicNodesInput] = useState("250");
  const [activatingLic, setActivatingLic] = useState(false);

  // Form states for System Config
  const [ldapUrl, setLdapUrl] = useState("ldap://dc.synparc.local:389");
  const [baseDn, setBaseDn] = useState("dc=synparc,dc=local");
  const [syncInterval, setSyncInterval] = useState("15");
  const [savingConfig, setSavingConfig] = useState(false);

  // Form states for M365 Graph API Config
  const [tenantId, setTenantId] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [hasClientSecret, setHasClientSecret] = useState(false);
  const [savingM365, setSavingM365] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resLic, resSync, resTokens, resM365] = await Promise.all([
        fetch(apiRoute("/settings/licenses"), { cache: "no-store" }),
        fetch(apiRoute("/settings/sync-runs"), { cache: "no-store" }),
        fetch(apiRoute("/settings/tokens"), { cache: "no-store" }),
        fetch(apiRoute("/settings/m365"), { cache: "no-store" })
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
      if (resM365.ok) {
        const data = await resM365.json();
        if (data.data) {
          setTenantId(data.data.tenantId || "");
          setClientId(data.data.clientId || "");
          setHasClientSecret(data.data.hasClientSecret || false);
          if (data.data.hasClientSecret) {
            setClientSecret("********");
          }
        }
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
    setCopiedToken(false);
    try {
      const res = await fetch(apiRoute("/settings/tokens/generate"), {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        const data = await res.json();
        setNewToken(data.data.rawToken);
        fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2500);
  };

  const revokeToken = async (tokenId: string) => {
    try {
      const res = await fetch(apiRoute(`/settings/tokens/${tokenId}/revoke`), {
        method: "POST"
      });
      if (res.ok) {
        setStatusMsg({ type: 'success', text: 'Jeton révoqué avec succès.' });
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const activateLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licKeyInput.trim()) return;
    setActivatingLic(true);
    try {
      const res = await fetch(apiRoute("/settings/licenses/activate"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: licKeyInput,
          issuedTo: licIssuedToInput || "Entreprise Partner",
          maxNodes: licNodesInput
        })
      });

      if (res.ok) {
        setStatusMsg({ type: 'success', text: 'Nouvelle licence activée avec succès !' });
        setLicKeyInput("");
        setLicIssuedToInput("");
        setShowLicenseForm(false);
        fetchData();
      } else {
        const err = await res.json();
        setStatusMsg({ type: 'error', text: err.message || "Erreur lors de l'activation." });
      }
    } catch (e) {
      console.error(e);
      setStatusMsg({ type: 'error', text: "Erreur réseau." });
    } finally {
      setActivatingLic(false);
    }
  };

  const triggerManualSync = async (type: string) => {
    setSyncingType(type);
    try {
      const res = await fetch(apiRoute("/settings/sync/trigger"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type })
      });
      if (res.ok) {
        setStatusMsg({ type: 'success', text: `Synchronisation ${type.toUpperCase()} exécutée !` });
        fetchData();
      }
    } catch (e) {
      console.error(e);
      setStatusMsg({ type: 'error', text: "Échec de la synchronisation." });
    } finally {
      setSyncingType(null);
    }
  };

  const saveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    setTimeout(() => {
      setSavingConfig(false);
      setStatusMsg({ type: 'success', text: 'Paramètres LDAP et système enregistrés avec succès !' });
    }, 600);
  };

  const saveM365ConfigHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingM365(true);
    try {
      const res = await fetch(apiRoute("/settings/m365"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId, clientId, clientSecret })
      });
      if (res.ok) {
        setStatusMsg({ type: 'success', text: 'Configuration Microsoft 365 Entra ID enregistrée avec succès !' });
        fetchData();
      } else {
        setStatusMsg({ type: 'error', text: 'Échec de l\'enregistrement de la configuration M365.' });
      }
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', text: 'Erreur réseau.' });
    } finally {
      setSavingM365(false);
    }
  };


  return (
    <div style={{ paddingBottom: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px', color: '#8b5cf6' }}>
            <Settings size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Paramètres Système</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Gestion des licences, jetons d'enrôlement et connecteurs d'infrastructure</p>
          </div>
        </div>
      </div>

      {statusMsg && (
        <div style={{
          padding: '14px 18px',
          marginBottom: '20px',
          borderRadius: '8px',
          background: statusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          border: `1px solid ${statusMsg.type === 'success' ? '#10b981' : '#ef4444'}`,
          color: statusMsg.type === 'success' ? '#10b981' : '#ef4444',
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          fontWeight: 500
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {statusMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {statusMsg.text}
          </div>
          <button onClick={() => setStatusMsg(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 700 }}>✕</button>
        </div>
      )}

      {/* QUICK SYNC TRIGGER BAR */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: 600 }}>
            <Zap size={20} color="#f59e0b" />
            Synchronisations Manuelles (Action Immédiate)
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Déclencher le rafraîchissement forcé des inventaires et attributs AD/M365</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => triggerManualSync('ad')} 
            disabled={syncingType === 'ad'}
            style={{
              padding: '10px 16px', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid #3b82f6', color: '#3b82f6', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <RefreshCcw size={16} className={syncingType === 'ad' ? 'spin' : ''} />
            {syncingType === 'ad' ? 'Synchro AD en cours...' : 'Synchro AD'}
          </button>
          
          <button 
            onClick={() => triggerManualSync('m365')} 
            disabled={syncingType === 'm365'}
            style={{
              padding: '10px 16px', background: 'rgba(139, 92, 246, 0.15)', border: '1px solid #8b5cf6', color: '#8b5cf6', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <Cloud size={16} />
            {syncingType === 'm365' ? 'Synchro M365 en cours...' : 'Synchro M365'}
          </button>

          <button 
            onClick={() => triggerManualSync('smb_scanner')} 
            disabled={syncingType === 'smb_scanner'}
            style={{
              padding: '10px 16px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#10b981', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <Database size={16} />
            {syncingType === 'smb_scanner' ? 'Scan Partages en cours...' : 'Scan Partages SMB'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        
        {/* LICENCES SYNPARC */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem' }}>
              <Key size={20} color="#8b5cf6" />
              Licences Synparc
            </h2>
            <button 
              onClick={() => setShowLicenseForm(!showLicenseForm)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 12px', background: 'rgba(139, 92, 246, 0.2)', border: '1px solid #8b5cf6', color: '#8b5cf6', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer'
              }}
            >
              <Plus size={14} /> {showLicenseForm ? 'Fermer' : 'Ajouter'}
            </button>
          </div>

          {showLicenseForm && (
            <form onSubmit={activateLicense} style={{ marginBottom: '20px', padding: '16px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-light)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Clé de Licence</label>
                <input 
                  type="text" 
                  placeholder="SYNPARC-ENTERPRISE-2026-XXXX" 
                  value={licKeyInput}
                  onChange={(e) => setLicKeyInput(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--background)', border: '1px solid var(--border-light)', color: '#fff', borderRadius: '6px', fontFamily: 'monospace' }}
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Titulaire / Entité</label>
                  <input 
                    type="text" 
                    placeholder="ex: Synparc France SAS" 
                    value={licIssuedToInput}
                    onChange={(e) => setLicIssuedToInput(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', background: 'var(--background)', border: '1px solid var(--border-light)', color: '#fff', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Limite (Machines)</label>
                  <input 
                    type="number" 
                    placeholder="250" 
                    value={licNodesInput}
                    onChange={(e) => setLicNodesInput(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', background: 'var(--background)', border: '1px solid var(--border-light)', color: '#fff', borderRadius: '6px' }}
                  />
                </div>
              </div>
              <button 
                type="submit"
                disabled={activatingLic}
                style={{
                  padding: '10px', background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer'
                }}
              >
                {activatingLic ? 'Activation...' : 'Activer la Licence'}
              </button>
            </form>
          )}

          {loading ? <p style={{ color: 'var(--text-muted)' }}>Chargement...</p> : (
            licenses.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>Aucune licence enregistrée.</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {licenses.map(lic => (
                  <div key={lic.id} style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 600 }}>{lic.issuedTo || 'Titulaire Inconnu'}</span>
                      <span className={`badge ${lic.status === 'active' ? 'active' : ''}`}>{lic.status.toUpperCase()}</span>
                    </div>
                    <div style={{ color: '#8b5cf6', fontFamily: 'monospace', fontSize: '0.9rem', marginBottom: '4px' }}>
                      Clé: {lic.keyValue}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      <span>Limite: <strong>{lic.maxNodes} machines</strong></span>
                      {lic.expiresAt && <span>Expire le: {new Date(lic.expiresAt).toLocaleDateString()}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* TOKENS D'ENRÔLEMENT */}
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: 600 }}>
                  <CheckCircle2 size={16} /> Nouveau jeton brut (copiez-le maintenant) :
                </span>
                <button onClick={() => copyToClipboard(newToken)} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(16, 185, 129, 0.2)', border: 'none', color: '#10b981', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>
                  {copiedToken ? <Check size={14} /> : <Copy size={14} />} {copiedToken ? 'Copié !' : 'Copier'}
                </button>
              </div>
              <code style={{ background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '4px', display: 'block', wordBreak: 'break-all', fontFamily: 'monospace', color: '#fff' }}>
                {newToken}
              </code>
            </div>
          )}

          {loading ? <p style={{ color: 'var(--text-muted)' }}>Chargement...</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {tokens.slice(0, 5).map(token => (
                <div key={token.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                  <div>
                    <span style={{ fontFamily: 'monospace', color: 'var(--text-main)', fontSize: '0.9rem', display: 'block' }}>{token.tokenHash.substring(0, 20)}...</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Créé le {new Date(token.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`badge ${!token.revoked ? 'active' : ''}`}>{!token.revoked ? 'Valide' : 'Révoqué'}</span>
                    {!token.revoked && (
                      <button 
                        onClick={() => revokeToken(token.id)}
                        title="Révoquer ce jeton"
                        style={{ padding: '4px 8px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}
                      >
                        <Ban size={12} /> Révoquer
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {tokens.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Aucun jeton généré.</p>}
            </div>
          )}
        {/* CONFIGURATION MICROSOFT 365 (ENTRA ID GRAPH API) */}
        <div className="glass-panel" style={{ padding: '24px', gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem' }}>
              <Cloud size={20} color="#8b5cf6" />
              Connecteur Microsoft 365 (Entra ID / Graph API)
            </h2>
            <span className={`badge ${hasClientSecret ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {hasClientSecret ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              {hasClientSecret ? 'Clé API Enregistrée' : 'Non Configuré'}
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
            Configurez l'Application Azure AD / Entra ID pour la synchronisation automatique des licences M365 (E5, Business Premium) et du statut de double authentification MFA.
          </p>
          <form onSubmit={saveM365ConfigHandler} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Directory (Tenant) ID</label>
              <input 
                type="text" 
                placeholder="00000000-0000-0000-0000-000000000000"
                value={tenantId} 
                onChange={(e) => setTenantId(e.target.value)}
                style={{ width: '100%', padding: '10px', background: 'var(--background)', border: '1px solid var(--border-light)', color: '#fff', borderRadius: '6px', fontFamily: 'monospace' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Application (Client) ID</label>
              <input 
                type="text" 
                placeholder="00000000-0000-0000-0000-000000000000"
                value={clientId} 
                onChange={(e) => setClientId(e.target.value)}
                style={{ width: '100%', padding: '10px', background: 'var(--background)', border: '1px solid var(--border-light)', color: '#fff', borderRadius: '6px', fontFamily: 'monospace' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Client Secret (Clé API Graph)</label>
              <input 
                type="password" 
                placeholder="Valeur du secret d'application Azure"
                value={clientSecret} 
                onChange={(e) => setClientSecret(e.target.value)}
                style={{ width: '100%', padding: '10px', background: 'var(--background)', border: '1px solid var(--border-light)', color: '#fff', borderRadius: '6px', fontFamily: 'monospace' }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
              <button 
                type="submit"
                disabled={savingM365}
                style={{
                  padding: '10px 24px', background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                }}
              >
                <Cloud size={16} />
                {savingM365 ? 'Enregistrement...' : 'Enregistrer la Clé API M365'}
              </button>
            </div>
          </form>
        </div>

        {/* CONFIGURATION LDAP & INFRASTRUCTURE */}
        <div className="glass-panel" style={{ padding: '24px', gridColumn: '1 / -1' }}>

          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '1.25rem' }}>
            <Server size={20} color="#3b82f6" />
            Configuration des Connecteurs & Service LDAP
          </h2>
          <form onSubmit={saveConfig} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Serveur LDAP Active Directory</label>
              <input 
                type="text" 
                value={ldapUrl} 
                onChange={(e) => setLdapUrl(e.target.value)}
                style={{ width: '100%', padding: '10px', background: 'var(--background)', border: '1px solid var(--border-light)', color: '#fff', borderRadius: '6px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Base DN d'Annuaire</label>
              <input 
                type="text" 
                value={baseDn} 
                onChange={(e) => setBaseDn(e.target.value)}
                style={{ width: '100%', padding: '10px', background: 'var(--background)', border: '1px solid var(--border-light)', color: '#fff', borderRadius: '6px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Fréquence de Synchronisation Auto (min)</label>
              <select 
                value={syncInterval} 
                onChange={(e) => setSyncInterval(e.target.value)}
                style={{ width: '100%', padding: '10px', background: 'var(--background)', border: '1px solid var(--border-light)', color: '#fff', borderRadius: '6px' }}
              >
                <option value="5">Toutes les 5 minutes</option>
                <option value="15">Toutes les 15 minutes</option>
                <option value="60">Toutes les heures</option>
                <option value="1440">Une fois par jour</option>
              </select>
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button 
                type="submit"
                disabled={savingConfig}
                style={{
                  padding: '10px 24px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer'
                }}
              >
                {savingConfig ? 'Enregistrement...' : 'Enregistrer la Configuration'}
              </button>
            </div>
          </form>
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
                      {run.errorMessage ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <AlertCircle size={14} color="#f59e0b" />
                          {run.errorMessage}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Opérationnelle</span>
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

