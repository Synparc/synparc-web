"use client";

import { ShieldAlert, Search, FileText, Users, Server, ChevronRight } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

interface SearchResults {
  foundUsers: any[];
  foundMachines: any[];
  foundPermissions: any[];
}

export default function PermissionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`http://127.0.0.1:3001/api/web/search?q=${encodeURIComponent(searchTerm.trim())}`, { cache: "no-store" });
      if (res.ok) {
        const resData = await res.json();
        setResults(resData.data || { foundUsers: [], foundMachines: [], foundPermissions: [] });
      } else {
        setResults({ foundUsers: [], foundMachines: [], foundPermissions: [] });
      }
    } catch (e) {
      console.error(e);
      setResults({ foundUsers: [], foundMachines: [], foundPermissions: [] });
    } finally {
      setLoading(false);
    }
  };

  const totalResults = results 
    ? (results.foundUsers.length + results.foundMachines.length + results.foundPermissions.length)
    : 0;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <div style={{ padding: '12px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', color: '#f59e0b' }}>
          <ShieldAlert size={28} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Sécurité, Droits & Recherche Globale</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Recherchez instantanément parmi les utilisateurs, machines et droits d'accès</p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              <Search size={20} />
            </div>
            <input 
              type="text" 
              placeholder="Ex: Employé Test, SRV-APPS, dossier compta..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '16px 16px 16px 48px',
                background: 'rgba(0,0,0,0.25)',
                border: '1px solid var(--border-light)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
          </div>
          <button type="submit" disabled={loading} style={{
            padding: '0 32px',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            transition: 'opacity 0.2s'
          }}>
            {loading ? 'Recherche...' : 'Rechercher'}
          </button>
        </form>
      </div>

      {/* RÉSULTATS DE RECHERCHE */}
      {results && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* 1. Utilisateurs trouvés */}
          {results.foundUsers.length > 0 && (
            <div className="glass-panel animate-fade-in" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: '#10b981' }}>
                <Users size={20} />
                <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Utilisateurs ({results.foundUsers.length})</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {results.foundUsers.map((u) => (
                  <Link 
                    key={u.id} 
                    href={`/users/${u.id}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 18px',
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      textDecoration: 'none',
                      color: 'inherit',
                      transition: 'transform 0.2s, background 0.2s'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{u.displayName || u.username}</div>
                      <div style={{ fontSize: '0.85rem', color: '#60a5fa', fontFamily: 'monospace' }}>{u.username}</div>
                      {u.department && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{u.department}</div>
                      )}
                    </div>
                    <ChevronRight size={18} color="var(--text-muted)" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 2. Machines trouvées */}
          {results.foundMachines.length > 0 && (
            <div className="glass-panel animate-fade-in" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: '#3b82f6' }}>
                <Server size={20} />
                <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Machines & Serveurs ({results.foundMachines.length})</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {results.foundMachines.map((m) => (
                  <Link 
                    key={m.id} 
                    href={`/machines/${m.id}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 18px',
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      textDecoration: 'none',
                      color: 'inherit'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{m.hostname}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{m.osName || 'OS Inconnu'}</div>
                      <div style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '4px', fontFamily: 'monospace' }}>IP: {m.lastIp || 'N/A'}</div>
                    </div>
                    <ChevronRight size={18} color="var(--text-muted)" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 3. Permissions effectives */}
          {results.foundPermissions.length > 0 && (
            <div className="glass-panel animate-fade-in" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '20px 20px 10px 20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#f59e0b' }}>
                <FileText size={20} />
                <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Matrice de Droits & Permissions ({results.foundPermissions.length})</h2>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Ressource</th>
                    <th>Serveur Hébergeur</th>
                    <th>Utilisateur Cible</th>
                    <th>Niveau d'accès</th>
                    <th>Origine</th>
                  </tr>
                </thead>
                <tbody>
                  {results.foundPermissions.map((r: any, idx: number) => (
                    <tr key={idx}>
                      <td style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
                        <FileText size={16} color="#9ca3af" />
                        {r.resourcePath || 'N/A'}
                      </td>
                      <td>
                        {r.machineId ? (
                          <Link href={`/machines/${r.machineId}`} style={{ color: '#3b82f6', textDecoration: 'none' }}>
                            {r.machineName}
                          </Link>
                        ) : (
                          r.machineName || 'N/A'
                        )}
                      </td>
                      <td style={{ fontWeight: 500 }}>
                        {r.userId ? (
                          <Link href={`/users/${r.userId}`} style={{ color: '#10b981', textDecoration: 'none' }}>
                            {r.displayName || r.username}
                          </Link>
                        ) : (
                          r.displayName || r.username || 'N/A'
                        )}
                      </td>
                      <td>
                        <span className="badge active">{r.accessLevel}</span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {r.originType === 'inherited_group' ? 'Hérité d\'un groupe' : 'Attribution Directe'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {hasSearched && totalResults === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Aucun résultat trouvé pour "{searchTerm}". Vérifiez l'orthographe ou essayez un autre terme.
        </div>
      )}
    </div>
  );
}

