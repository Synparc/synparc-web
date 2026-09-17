"use client";

import React, { useEffect, useState } from 'react';
import { Briefcase, ArrowLeft, Loader2, Users } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function DepartmentProfilePage() {
  const { name } = useParams();
  const decodedName = decodeURIComponent(name as string);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/web/departments/${name}`)
      .then(res => res.json())
      .then(json => {
        if (json.status === 'success') {
          setData(json.data);
        }
      })
      .finally(() => setLoading(false));
  }, [name]);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: '#fff' }}><Loader2 className="animate-spin" /></div>;
  }

  if (!data || !data.department) {
    return <div style={{ color: '#ef4444', padding: 24 }}>Erreur: Département introuvable.</div>;
  }

  const { members } = data;

  return (
    <div>
      <Link href="/users" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#9ca3af', textDecoration: 'none', marginBottom: '24px' }}>
        <ArrowLeft size={16} /> Retour à l'annuaire
      </Link>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
        <div style={{ width: 80, height: 80, borderRadius: '16px', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
          <Briefcase size={40} />
        </div>
        <div>
          <h1 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            Pôle : {decodedName}
          </h1>
          <div style={{ color: 'var(--text-muted)' }}>
            Département répertorié dans l'Active Directory.
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h2 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={20} color="#10b981" /> Effectif ({members?.length || 0})
        </h2>
        {members && members.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af', textAlign: 'left', fontSize: '0.875rem' }}>
                  <th style={{ padding: '12px 0' }}>Nom d'affichage</th>
                  <th style={{ padding: '12px 0' }}>Identifiant</th>
                  <th style={{ padding: '12px 0' }}>Statut</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member: any) => (
                  <tr key={member.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#fff' }}>
                    <td style={{ padding: '12px 0' }}>
                      <Link href={`/users/${member.id}`} style={{ color: '#3b82f6', textDecoration: 'none' }}>
                        {member.displayName || member.username}
                      </Link>
                    </td>
                    <td style={{ padding: '12px 0', color: 'var(--text-muted)' }}>{member.username}</td>
                    <td style={{ padding: '12px 0' }}>
                      {member.adEnabled ? (
                         <span style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>Actif</span>
                      ) : (
                         <span style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>Désactivé</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)' }}>Aucun membre trouvé dans ce département.</div>
        )}
      </div>
    </div>
  );
}
