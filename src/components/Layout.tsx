import type { ReactNode } from 'react';
import { useState } from 'react';
import { Home, LayoutDashboard, PackageSearch, PackagePlus, Shield, User, LogOut, Menu, X, Search, HandHelping, Trophy } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Button } from './ui/Button';

type Page = 'landing' | 'signin' | 'signup' | 'dashboard' | 'report-lost' | 'report-found' | 'matches' | 'challenge' | 'recovery' | 'profile' | 'admin';

interface LayoutProps {
  children: ReactNode;
  currentPage: Page;
  onNavigate: (page: Page, params?: Record<string, string>) => void;
}

const navItems: { page: Page; label: string; icon: typeof Home }[] = [
  { page: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { page: 'report-lost', label: 'Report Lost', icon: PackagePlus },
  { page: 'report-found', label: 'Report Found', icon: HandHelping },
  { page: 'matches', label: 'Matches', icon: Search },
];

export function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const { profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = profile?.role === 'admin';

  const handleNav = (page: Page) => {
    onNavigate(page);
    setMobileOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    onNavigate('landing');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNav('dashboard')}>
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-sm">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">RECLAIM</span>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.page}
                  onClick={() => handleNav(item.page)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentPage === item.page
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
              {isAdmin && (
                <button
                  onClick={() => handleNav('admin')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentPage === 'admin' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </button>
              )}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => handleNav('profile')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentPage === 'profile' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <User className="w-4 h-4" />
                {profile?.full_name || 'Profile'}
              </button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>

            <button className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {mobileOpen && (
            <div className="md:hidden py-3 border-t border-slate-200 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.page}
                  onClick={() => handleNav(item.page)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    currentPage === item.page ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
              {isAdmin && (
                <button
                  onClick={() => handleNav('admin')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    currentPage === 'admin' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </button>
              )}
              <button
                onClick={() => handleNav('profile')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  currentPage === 'profile' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <User className="w-4 h-4" />
                {profile?.full_name || 'Profile'}
              </button>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-xs text-slate-400 text-center">RECLAIM - Campus Recovery System</p>
        </div>
      </footer>
    </div>
  );
}

export type { Page };
