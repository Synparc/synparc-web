"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, Server, Users, FolderSync, Briefcase, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { apiRoute } from '@/lib/api';

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsLoading(true);
      fetch(apiRoute(`/search?q=${encodeURIComponent(query.trim())}`))
        .then(res => res.json())
        .then(data => {
          if (data.status === 'success') {
            setResults(data.data || []);
            setIsOpen(true);
          }
        })
        .catch(err => console.error(err))
        .finally(() => setIsLoading(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const getIcon = (type: string) => {
    switch(type) {
      case 'machine': return <Server size={18} color="#3b82f6" />;
      case 'user': return <Users size={18} color="#10b981" />;
      case 'group': return <Users size={18} color="#8b5cf6" />;
      case 'department': return <Briefcase size={18} color="#f59e0b" />;
      case 'resource': return <FolderSync size={18} color="#ef4444" />;
      default: return <Search size={18} color="#9ca3af" />;
    }
  };

  return (
    <div ref={searchRef} style={{ position: 'relative', width: '300px' }}>
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: '50%', left: 12, transform: 'translateY(-50%)', color: '#9ca3af' }}>
          <Search size={18} />
        </div>
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher (PCs, Utilisateurs, Disques...)" 
          style={{
            width: '100%',
            background: 'rgba(30,41,59,0.8)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '24px',
            padding: '10px 16px 10px 40px',
            color: '#fff',
            outline: 'none',
            fontSize: '0.875rem',
            transition: 'all 0.2s',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
          }}
          onFocus={(e) => {
            e.target.style.border = '1px solid #3b82f6';
            if (results.length > 0) setIsOpen(true);
          }}
          onBlur={(e) => e.target.style.border = '1px solid rgba(255,255,255,0.1)'}


        />
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          left: 0,
          right: 0,
          background: 'rgba(15,23,42,0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          zIndex: 50,
          maxHeight: '400px',
          overflowY: 'auto'
        }}>
          {isLoading && results.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>Recherche...</div>
          ) : results.length > 0 ? (
            <div style={{ padding: '8px' }}>
              {results.map((result, idx) => (
                <Link key={idx} href={result.url} onClick={() => setIsOpen(false)} style={{ textDecoration: 'none' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }} className="hover-bg-slate">
                    <div style={{
                      width: 36, height: 36, borderRadius: '8px', 
                      background: 'rgba(255,255,255,0.05)', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {getIcon(result.type)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 500, color: '#fff', fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {result.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {result.subtitle}
                      </div>
                    </div>
                    <ChevronRight size={16} color="#4b5563" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
             <div style={{ padding: '16px', textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>Aucun résultat trouvé.</div>
          )}
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        .hover-bg-slate:hover { background: rgba(59,130,246,0.1) !important; }
      `}} />
    </div>
  );
}
