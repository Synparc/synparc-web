import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { LayoutDashboard, Server, Users, ShieldAlert, Settings } from "lucide-react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Synparc Dashboard",
  description: "Centralized IT Management & Monitoring",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={inter.variable}>
        <div className="app-container">
          
          {/* Sidebar */}
          <aside className="sidebar">
            <div style={{ padding: '2rem 1.5rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src="/logo.png" alt="Synparc Logo" width={32} height={32} style={{ borderRadius: 8, boxShadow: '0 0 15px rgba(59,130,246,0.5)' }} />
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', letterSpacing: '1px' }}>SYNPARC</span>
              </div>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <Link href="/" className="nav-link">
                <LayoutDashboard size={20} /> Vue d'ensemble
              </Link>
              <Link href="/machines" className="nav-link">
                <Server size={20} /> Parc Informatique
              </Link>
              <Link href="/users" className="nav-link">
                <Users size={20} /> Annuaire (AD)
              </Link>
              <Link href="/permissions" className="nav-link">
                <ShieldAlert size={20} /> Sécurité & Droits
              </Link>
              <Link href="/settings" className="nav-link">
                <Settings size={20} /> Paramètres
              </Link>
            </nav>
            
            <div style={{ marginTop: 'auto', padding: '2rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                System Status: <span style={{ color: 'var(--status-green)', textShadow: '0 0 5px var(--status-green)' }}>● Online</span>
              </div>
            </div>
          </aside>

          {/* Main Area */}
          <main className="main-content">
            <header className="topbar">
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff' }}>Admin System</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>admin@synparc.local</div>
                </div>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
                  A
                </div>
              </div>
            </header>
            <div className="page-content animate-fade-in">
              {children}
            </div>
          </main>

        </div>
      </body>
    </html>
  );
}
