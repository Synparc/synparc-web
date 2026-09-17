"use client";

import React, { useEffect, useState } from 'react';
import { FolderSync, Server, ArrowLeft, Loader2, Info, HardDrive, Download, Printer } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { apiRoute } from '@/lib/api';
import { exportToCSV, printAuditReport } from '@/lib/exportUtils';


export default function ResourceProfilePage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(apiRoute(`/resources/${id}`))
      .then(res => res.json())
      .then(json => {
        if (json.status === 'success') {
          setData(json.data);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: '#fff' }}><Loader2 className="spin" /></div>;
  }

  if (!data || !data.resource) {
    return <div style={{ color: '#ef4444', padding: 24 }}>Erreur: Ressource introuvable.</div>;
  }

  const { resource, machine, permissions = [], aclEntries = [] } = data;

  const getResourceTypeLabel = (type: string) => {
    switch (type) {
      case 'mapped_drive': return '🔌 Lecteur Réseau Mappé';
      case 'smb_share': return '📁 Partage SMB';
      case 'local_disk': return '💾 Disque Local';
      default: return 'Ressource Partagée';
    }
  };

  const handleExportCSV = () => {
    if (!permissions || permissions.length === 0) return;
    const headers = ["Utilisateur", "Identifiant AD", "Pôle / Département", "Niveau d'accès", "Origine du Droit"];
    const rows = permissions.map((p: any) => [
      p.displayName || p.username || "-",
      p.username || "-",
      p.department || "AD",
      p.accessLevel || "-",
      p.originType === 'inherited_group' ? `Hérité du groupe ${p.originGroupName || "AD"}` : "Attribution Directe"
    ]);
    exportToCSV(`AccessMatrix_${resource.path.replace(/[^a-zA-Z0-9]/g, '_')}`, headers, rows);
  };

  const handlePrintPDF = () => {
    if (!permissions || permissions.length === 0) return;
    const headers = ["Utilisateur", "Identifiant AD", "Pôle / Département", "Niveau d'accès", "Origine du Droit"];
    const rows = permissions.map((p: any) => [
      p.displayName || p.username || "-",
      p.username || "-",
      p.department || "AD",
      p.accessLevel || "-",
      p.originType === 'inherited_group' ? `Hérité du groupe ${p.originGroupName || "AD"}` : "Attribution Directe"
    ]);
    printAuditReport(
      `Rapport d'Audit d'Accès : ${resource.path}`,
      `Ressource hébergée sur ${machine?.hostname || 'Serveur Réseau'} (${getResourceTypeLabel(resource.resourceType)})`,
      headers,
      rows
    );
  };

  return (

    <div style={{ paddingBottom: '40px' }}>
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#9ca3af', textDecoration: 'none', marginBottom: '24px' }}>
        <ArrowLeft size={16} /> Retour
      </Link>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
        <div style={{ width: 80, height: 80, borderRadius: '16px', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
          {resource.resourceType === 'smb_share' ? <HardDrive size={40} /> : <FolderSync size={40} />}
        </div>
        <div>
          <h1 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px', wordBreak: 'break-all' }}>
            {resource.path}
            <span style={{ fontSize: '0.75rem', padding: '4px 8px', background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', borderRadius: '4px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              {getResourceTypeLabel(resource.resourceType)}
            </span>
          </h1>
          <div style={{ color: 'var(--text-muted)' }}>
            Hébergé sur : {machine ? <Link href={`/machines/${machine.id}`} style={{ color: '#3b82f6' }}>{machine.hostname}</Link> : 'Serveur Réseau'}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Info size={20} color="#3b82f6" /> Informations Générales
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Chemin d'accès</span>
              <span style={{ color: '#fff', fontFamily: 'monospace' }}>{resource.path}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Type de Ressource</span>
              <span style={{ color: '#fff' }}>{getResourceTypeLabel(resource.resourceType)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Dernière Analyse</span>
              <span style={{ color: '#fff' }}>{new Date(resource.lastScannedAt).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Server size={20} color="#8b5cf6" /> Statut de Sécurité & Audit
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)' }}>Utilisateurs Autorisés</span>
              <span className="badge active">{permissions.length} comptes</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)' }}>Groupes Sécurité Attribués</span>
              <span className="badge" style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#c084fc' }}>{aclEntries.length} groupes</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)' }}>Droits HÉRITÉS AD</span>
              <span style={{ color: '#10b981', fontWeight: 600 }}>Actif (Calcul Effectif)</span>
            </div>
          </div>
        </div>
      </div>

        <div style={{ padding: '20px 20px 10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#10b981' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>👤 Utilisateurs ayant accès à cette ressource ({permissions.length})</h2>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleExportCSV}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#10b981', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
            >
              <Download size={14} /> Export CSV
            </button>
            <button
              onClick={handlePrintPDF}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'rgba(139, 92, 246, 0.15)', border: '1px solid #8b5cf6', color: '#8b5cf6', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
            >
              <Printer size={14} /> Rapport Audit PDF
            </button>
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>Identifiant AD</th>
              <th>Pôle / Département</th>
              <th>Niveau d'accès</th>
              <th>Origine du Droit</th>
            </tr>
          </thead>
          <tbody>
            {permissions.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Aucun utilisateur n'a d'accès effectif enregistré sur cette ressource.
                </td>
              </tr>
            ) : (
              permissions.map((p: any) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>
                    {p.userId ? (
                      <Link href={`/users/${p.userId}`} style={{ color: '#fff', textDecoration: 'none' }}>
                        {p.displayName || p.username}
                      </Link>
                    ) : (
                      p.displayName || p.username || 'Utilisateur'
                    )}
                  </td>
                  <td style={{ color: '#3b82f6', fontFamily: 'monospace' }}>
                    {p.userId ? (
                      <Link href={`/users/${p.userId}`} style={{ color: '#3b82f6', textDecoration: 'none' }}>
                        {p.username}
                      </Link>
                    ) : (
                      p.username || '-'
                    )}
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{p.department || '-'}</td>
                  <td>
                    <span className="badge active">{p.accessLevel}</span>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>
                    {p.originType === 'inherited_group' ? (
                      <span style={{ color: '#c084fc' }}>
                        Hérité du groupe {p.originGroupId ? <Link href={`/groups/${p.originGroupId}`} style={{ color: '#c084fc', textDecoration: 'underline' }}>{p.originGroupName || 'AD'}</Link> : (p.originGroupName || 'AD')}
                      </span>
                    ) : (
                      <span style={{ color: '#10b981' }}>Attribution Directe</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* TABLEAU DES GROUPES AUTORISÉS (ACLs) */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '20px 20px 10px 20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#8b5cf6' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>👥 Groupes Active Directory Autorisés (ACLs) ({aclEntries.length})</h2>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Nom du Groupe AD</th>
              <th>Niveau de Permission NTFS / SMB</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {aclEntries.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Aucun groupe attribué directement dans les ACLs.
                </td>
              </tr>
            ) : (
              aclEntries.map((a: any) => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 600, color: '#c084fc' }}>
                    {a.groupId ? (
                      <Link href={`/groups/${a.groupId}`} style={{ color: '#c084fc', textDecoration: 'none' }}>
                        {a.groupName || 'Groupe AD'}
                      </Link>
                    ) : (
                      a.groupName || 'Groupe AD'
                    )}
                  </td>
                  <td>
                    <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                      {a.accessLevel}
                    </span>
                  </td>
                  <td>
                    {a.groupId && (
                      <Link href={`/groups/${a.groupId}`} style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '0.85rem' }}>
                        Voir les membres ➔
                      </Link>
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

