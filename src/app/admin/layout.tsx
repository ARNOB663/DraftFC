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
        className={`fixed left-0 top-0 h-full z-40 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'
          }`}
      >
        <div className="h-full bg-white/5 backdrop-blur-xl border-r border-white/10 flex flex-col">
          {/* Logo Section */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-cyan-500/20">
                ⚽
              </div>
              {sidebarOpen && (
                <div>
                  <h1 className="text-white font-bold text-lg">DraftFC</h1>
                  <p className="text-white/50 text-xs">Admin Panel</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/admin' && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 text-white shadow-lg shadow-cyan-500/10'
                      : 'text-white/60 hover:bg-white/10 hover:text-white'
                    }`}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-cyan-400' : ''}`} />
                  {sidebarOpen && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      {isActive && <ChevronRight className="w-4 h-4 text-cyan-400" />}
                    </>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Toggle Button */}
          <div className="p-4 border-t border-white/10">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              {sidebarOpen && <span className="text-sm">Collapse</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`relative z-10 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'
          }`}
      >
        {children}
      </main>
    </div>
  );
}
