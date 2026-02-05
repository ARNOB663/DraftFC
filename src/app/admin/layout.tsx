'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, LayoutDashboard, Settings, Menu, X, ChevronRight } from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/players', label: 'Players', icon: Users },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-purple-500/5 to-cyan-500/5 rounded-full blur-3xl" />
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full z-40 transition-all duration-300 ${sidebarOpen ? 'w-48' : 'w-14'
          }`}
      >
        <div className="h-full bg-white/5 backdrop-blur-xl border-r border-white/10 flex flex-col">
          {/* Logo Section */}
          <div className="p-2 border-b border-white/10">
            <div className={`flex items-center ${sidebarOpen ? 'gap-2 px-1' : 'justify-center'} h-10`}>
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-cyan-500/20 shrink-0">
                ⚽
              </div>
              {sidebarOpen && (
                <div className="overflow-hidden">
                  <h1 className="text-white font-bold text-sm leading-tight truncate">DraftFC</h1>
                  <p className="text-white/50 text-[10px] leading-tight truncate">Admin Panel</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-2 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/admin' && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center ${sidebarOpen ? 'gap-2.5 px-2.5' : 'justify-center px-0'} py-2 rounded-lg transition-all duration-200 group ${isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 text-white shadow-lg shadow-cyan-500/10'
                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                    }`}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : ''}`} />
                  {sidebarOpen && (
                    <>
                      <span className="flex-1 text-xs font-medium">{item.label}</span>
                      {isActive && <ChevronRight className="w-3 h-3 text-cyan-400" />}
                    </>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Toggle Button */}
          <div className="p-2 border-t border-white/10">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`w-full flex items-center ${sidebarOpen ? 'justify-center gap-2' : 'justify-center'} px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors`}
            >
              {sidebarOpen ? <X className="w-3.5 h-3.5" /> : <Menu className="w-3.5 h-3.5" />}
              {sidebarOpen && <span className="text-[10px] uppercase font-bold tracking-wider">Collapse</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`relative z-10 transition-all duration-300 ${sidebarOpen ? 'ml-48' : 'ml-14'
          }`}
      >
        {children}
      </main>
    </div>
  );
}
