import { Users as UsersIcon, ChevronRight } from "lucide-react";
import Link from "next/link";

async function getUsers() {
  try {
    const res = await fetch("http://127.0.0.1:3001/api/web/users", { cache: "no-store" });
    if (!res.ok) return [];
    const resData = await res.json();
    return resData.data || [];
  } catch (e) {
    return [];
  }
}

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: '#10b981' }}>
          <UsersIcon size={28} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Annuaire (Active Directory)</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Identités, comptes utilisateurs et attributs Active Directory synchronisés</p>
        </div>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Nom d'affichage</th>
              <th>Identifiant (sAMAccountName)</th>
              <th>Email</th>
              <th>Département / Fonction</th>
              <th>Statut AD</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Aucun utilisateur synchronisé.
                </td>
              </tr>
            ) : (
              users.map((u: any) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>
                    <Link href={`/users/${u.id}`} style={{ color: 'var(--foreground)', textDecoration: 'none' }}>
                      {u.displayName || u.username}
                    </Link>
                  </td>
                  <td style={{ color: '#3b82f6', fontFamily: 'monospace' }}>
                    <Link href={`/users/${u.id}`} style={{ color: '#3b82f6', textDecoration: 'none' }}>
                      {u.username}
                    </Link>
                  </td>
                  <td>{u.email || '-'}</td>
                  <td style={{ fontSize: '0.85rem' }}>
                    {u.department ? (
                      <span style={{ color: 'var(--text-main)' }}>{u.department} {u.title ? `(${u.title})` : ''}</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>-</span>
                    )}
                  </td>
                  <td>
                    {u.adEnabled !== false ? (
                      <span className="badge active">Actif</span>
                    ) : (
                      <span className="badge inactive">Désactivé</span>
                    )}
                  </td>
                  <td>
                    <Link href={`/users/${u.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#3b82f6', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500 }}>
                      Détails <ChevronRight size={16} />
                    </Link>
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

