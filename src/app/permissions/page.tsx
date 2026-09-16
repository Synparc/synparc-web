"use client";

import { ShieldAlert, Search, FileText } from "lucide-react";
import { useState } from "react";

export default function PermissionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm) return;
    
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/web/permissions/search?userId=${searchTerm}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      } else {
        setResults([]);
      }
    } catch (e) {
      console.error(e);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <div style={{ padding: '12px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', color: '#f59e0b' }}>
          <ShieldAlert size={28} />
        </div>
        <h1>Sécurité & Droits (Recherche)</h1>
      </div>

      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              <Search size={20} />
            </div>
            <input 
              type="text" 
              placeholder="Rechercher par ID Utilisateur..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '16px 16px 16px 48px',
                background: 'rgba(0,0,0,0.2)',
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

      {results.length > 0 && (
        <div className="glass-panel animate-fade-in" style={{ overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Ressource (Chemin / URL)</th>
                <th>Type de permission</th>
                <th>Source d'héritage</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r: any, idx: number) => (
                <tr key={idx}>
                  <td style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
                    <FileText size={16} color="#9ca3af" />
                    {r.resourceId}
                  </td>
                  <td>
                    <span className="badge active">{r.permissionType}</span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Via Groupe ID: {r.sourceGroupId || 'Direct'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {results.length === 0 && searchTerm && !loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Aucun résultat trouvé ou base de données vide.
        </div>
      )}
    </div>
  );
}
