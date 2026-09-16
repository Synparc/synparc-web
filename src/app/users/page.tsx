import { Users } from "lucide-react";

async function getUsers() {
  try {
    const res = await fetch("http://localhost:3000/api/web/users", { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
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
          <Users size={28} />
        </div>
        <h1>Annuaire (Active Directory)</h1>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Nom d'affichage</th>
              <th>Identifiant (sAMAccountName)</th>
              <th>Email</th>
              <th>Object GUID</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Aucun utilisateur synchronisé. Exécutez le script ad-sync.
                </td>
              </tr>
            ) : (
              users.map((u: any) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{u.displayName}</td>
                  <td style={{ color: '#3b82f6' }}>{u.samAccountName}</td>
                  <td>{u.email || '-'}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.objectGuid}</td>
                  <td>
                    {u.isActive ? (
                      <span className="badge active">Actif</span>
                    ) : (
                      <span className="badge inactive">Désactivé</span>
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
