import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from '@/lib/auth';
import { Layout, type Page } from '@/components/Layout';
import { Landing } from '@/pages/Landing';
import { AuthPage } from '@/pages/AuthPage';
import { Dashboard } from '@/pages/Dashboard';
import { ReportLost } from '@/pages/ReportLost';
import { ReportFound } from '@/pages/ReportFound';
import { Matches } from '@/pages/Matches';
import { OwnershipChallenge } from '@/pages/OwnershipChallenge';
import { RecoveryPage } from '@/pages/Recovery';
import { ProfilePage } from '@/pages/Profile';
import { AdminDashboard } from '@/pages/Admin';

function AppContent() {
  const { session, loading } = useAuth();
  const [page, setPage] = useState<Page>('landing');
  const [params, setParams] = useState<Record<string, string>>({});

  const navigate = (newPage: string, newParams: Record<string, string> = {}) => {
    setPage(newPage as Page);
    setParams(newParams);
    window.scrollTo(0, 0);
  };

  // Redirect to dashboard after login
  useEffect(() => {
    if (session && (page === 'landing' || page === 'signin' || page === 'signup')) {
      setPage('dashboard');
    }
    if (!session && !loading && page !== 'landing' && page !== 'signin' && page !== 'signup') {
      setPage('landing');
    }
  }, [session, loading, page]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Public pages
  if (!session) {
    if (page === 'signin') return <AuthPage mode="signin" onNavigate={navigate} />;
    if (page === 'signup') return <AuthPage mode="signup" onNavigate={navigate} />;
    return <Landing onNavigate={navigate} />;
  }

  // Protected pages
  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        return <Dashboard onNavigate={navigate} />;
      case 'report-lost':
        return <ReportLost onNavigate={navigate} />;
      case 'report-found':
        return <ReportFound onNavigate={navigate} />;
      case 'matches':
        return <Matches onNavigate={navigate} params={params} />;
      case 'challenge':
        return <OwnershipChallenge onNavigate={navigate} params={params} />;
      case 'recovery':
        return <RecoveryPage onNavigate={navigate} params={params} />;
      case 'profile':
        return <ProfilePage onNavigate={navigate} />;
      case 'admin':
        return <AdminDashboard onNavigate={navigate} />;
      default:
        return <Dashboard onNavigate={navigate} />;
    }
  };

  return (
    <Layout currentPage={page} onNavigate={navigate}>
      {renderPage()}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
