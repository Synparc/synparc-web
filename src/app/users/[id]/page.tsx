import { Users, Shield, Server, Key, ArrowLeft, CheckCircle2, XCircle, Clock, Building, Mail, UserCheck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

async function getUserDetails(id: string) {
  try {
    const res = await fetch(`http://127.0.0.1:3001/api/web/users/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    const resData = await res.json();
    return resData.data;
  } catch (e) {
    return null;
  }
}

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getUserDetails(id);

  if (!data || !data.user) {
    notFound();
  }

  const { user, groups, sessions, permissions, licenses } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Bouton Retour */}
      <div>
        <Link 
          href="/users" 
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
          <ArrowLeft size={16} /> Retour à l'Annuaire
        </Link>
      </div>

      {/* En-tête Profil */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '16px', 
            background: 'linear-gradient(135deg, #10b981, #059669)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#fff',
            fontSize: '1.75rem',
            fontWeight: 'bold',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
          }}>
            {(user.displayName || user.username).charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
              {user.displayName || user.username}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <span style={{ fontFamily: 'monospace', color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                {user.username}
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Building size={14} /> {user.department || 'Département non spécifié'}
              </span>
              {user.title && (
                <>
                  <span>•</span>
                  <span>{user.title}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user.adEnabled !== false ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', borderRadius: '20px', fontWeight: 600, fontSize: '0.85rem' }}>
              <CheckCircle2 size={16} /> Compte AD Actif
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', borderRadius: '20px', fontWeight: 600, fontSize: '0.85rem' }}>
              <XCircle size={16} /> Compte AD Désactivé
            </div>
          )}
        </div>
      </div>

      {/* Grille d'informations principales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Identité & Attributs AD */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6' }}>
            <Users size={18} /> Attributs Active Directory
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Email principal:</span>
              <span style={{ fontWeight: 500 }}>{user.email || 'Non renseigné'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Object GUID (AD):</span>
              <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#9ca3af' }}>{user.adGuid}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Dernière connexion AD:</span>
              <span>{user.lastLogonAd ? new Date(user.lastLogonAd).toLocaleString('fr-FR') : 'Inconnue'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Date de synchronisation:</span>
              <span>{new Date(user.updatedAt).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
        </div>

        {/* Groupes Sécurité & AD */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#8b5cf6' }}>
            <Shield size={18} /> Groupes de Sécurité ({groups.length})
          </h2>
          {groups.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Aucun groupe direct affecté.</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {groups.map((g: any) => (
                <div key={g.id} style={{ 
                  padding: '6px 12px', 
                  borderRadius: '6px', 
                  background: 'rgba(139, 92, 246, 0.15)', 
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  color: '#c084fc',
                  fontSize: '0.85rem',
                  fontWeight: 500 
                }}>
                  {g.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Licences Microsoft 365 */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b' }}>
            <Key size={18} /> Licences & Cloud M365 ({licenses.length})
          </h2>
          {licenses.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Aucune licence M365 associée.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {licenses.map((lic: any) => (
                <div key={lic.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                  <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{lic.licenseSku}</span>
                  <span className={`badge ${lic.mfaEnabled ? 'active' : 'inactive'}`}>
                    {lic.mfaEnabled ? 'MFA Activé' : 'MFA Inactif'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Sessions Machines Récents */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '20px 20px 10px 20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#3b82f6' }}>
          <Server size={20} />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Sessions & Connexions sur le Parc ({sessions.length})</h2>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Machine Hostname</th>
              <th>Type de Session</th>
              <th>Début de Session</th>
              <th>Fin de Session</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {sessions.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Aucune session enregistrée pour cet utilisateur.
                </td>
              </tr>
            ) : (
              sessions.map((s: any) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600 }}>
                    {s.machineId ? (
                      <Link href={`/machines/${s.machineId}`} style={{ color: '#3b82f6', textDecoration: 'none' }}>
                        {s.hostname}
                      </Link>
                    ) : (
                      s.hostname || 'N/A'
                    )}
                  </td>
                  <td>
                    <span style={{ textTransform: 'uppercase', fontSize: '0.8rem', padding: '2px 6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
                      {s.sessionType || 'interactive'}
                    </span>
                  </td>
                  <td>{new Date(s.sessionStart).toLocaleString('fr-FR')}</td>
                  <td>{s.sessionEnd ? new Date(s.sessionEnd).toLocaleString('fr-FR') : 'Session Active'}</td>
                  <td>
                    {!s.sessionEnd ? (
                      <span className="badge active">En cours</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Terminée</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Permissions effectives */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '20px 20px 10px 20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#10b981' }}>
          <Shield size={20} />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Droits & Permissions Effectives ({permissions.length})</h2>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Ressource / Partage</th>
              <th>Machine Hébergeuse</th>
              <th>Niveau de Droit</th>
              <th>Origine de l'Accès</th>
            </tr>
          </thead>
          <tbody>
            {permissions.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Aucun droit direct ou hérité recensé pour cet utilisateur.
                </td>
              </tr>
            ) : (
              permissions.map((p: any, idx: number) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 500, fontFamily: 'monospace', color: '#fff' }}>{p.resourcePath}</td>
                  <td>
                    {p.machineId ? (
                      <Link href={`/machines/${p.machineId}`} style={{ color: '#3b82f6', textDecoration: 'none' }}>
                        {p.machineName}
                      </Link>
                    ) : (
                      p.machineName || 'N/A'
                    )}
                  </td>
                  <td>
                    <span className="badge active">{p.accessLevel}</span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {p.originType === 'inherited_group' ? 'Hérité d\'un groupe AD' : 'Attribution Directe'}
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
