"use client";

import React, { useEffect, useState } from 'react';
import { Users, Shield, ArrowLeft, Loader2, Info } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function GroupProfilePage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/web/groups/${id}`)
      .then(res => res.json())
      .then(json => {
        if (json.status === 'success') {
          setData(json.data);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: '#fff' }}><Loader2 className="animate-spin" /></div>;
  }

  if (!data || !data.group) {
    return <div style={{ color: '#ef4444', padding: 24 }}>Erreur: Groupe introuvable.</div>;
  }

  const { group, members } = data;

  return (
    <div>
      <Link href="/users" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#9ca3af', textDecoration: 'none', marginBottom: '24px' }}>
        <ArrowLeft size={16} /> Retour à l'annuaire
      </Link>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
        <div style={{ width: 80, height: 80, borderRadius: '16px', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6' }}>
          <Users size={40} />
        </div>
        <div>
          <h1 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            {group.name}
            <span style={{ fontSize: '0.75rem', padding: '4px 8px', background: 'rgba(139, 92, 246, 0.2)', color: '#c4b5fd', borderRadius: '4px', textTransform: 'uppercase' }}>
              {group.groupType || 'Groupe AD'}
            </span>
          </h1>
          <div style={{ color: 'var(--text-muted)' }}>
            {group.description || 'Aucune description disponible pour ce groupe.'}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Info size={20} color="#3b82f6" /> Informations Générales
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>GUID</span>
              <span style={{ color: '#fff', fontFamily: 'monospace' }}>{group.adGuid}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Membres Actifs</span>
              <span style={{ color: '#fff', fontWeight: 600 }}>{members?.length || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Dernière Synchro</span>
              <span style={{ color: '#fff' }}>{new Date(group.updatedAt).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
        </div>
        
        <div className="glass-panel" style={{ padding: '24px', gridColumn: '1 / -1' }}>
          <h2 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={20} color="#10b981" /> Liste des Membres
          </h2>
          {members && members.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af', textAlign: 'left', fontSize: '0.875rem' }}>
                    <th style={{ padding: '12px 0' }}>Nom d'affichage</th>
                    <th style={{ padding: '12px 0' }}>Identifiant</th>
                    <th style={{ padding: '12px 0' }}>Département</th>
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
                      <td style={{ padding: '12px 0' }}>{member.department || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)' }}>Aucun membre trouvé dans ce groupe.</div>
          )}
        </div>
      </div>
    </div>
  );
}
