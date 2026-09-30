import { useState } from 'react';
import { Trophy, Mail, Lock, ArrowLeft, Zap } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface AuthPageProps {
  mode: 'signin' | 'signup';
  onNavigate: (page: string) => void;
}

export function AuthPage({ mode, onNavigate }: AuthPageProps) {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState(mode === 'signin' ? 'demo@reclaim.edu' : '');
  const [password, setPassword] = useState(mode === 'signin' ? 'demo123456' : '');
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === 'signin') {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error);
        setLoading(false);
      } else {
        onNavigate('dashboard');
      }
    } else {
      if (!fullName || !studentId) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, fullName, studentId);
      if (error) {
        setError(error);
        setLoading(false);
      } else {
        onNavigate('dashboard');
      }
    }
  };

  const fillDemo = () => {
    setEmail('demo@reclaim.edu');
    setPassword('demo123456');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex flex-col">
      <nav className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5">
        <button onClick={() => onNavigate('landing')} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 items-center justify-center shadow-sm mb-4">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              {mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {mode === 'signin' ? 'Sign in to your RECLAIM account' : 'Join the campus recovery network'}
            </p>
          </div>

          {mode === 'signin' && (
            <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200 flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <p className="text-xs text-blue-700">
                Demo credentials are pre-filled. Just click Sign In.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            {mode === 'signup' && (
              <Input
                label="Full Name"
                placeholder="Alex Chen"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            )}
            {mode === 'signup' && (
              <Input
                label="Student ID"
                placeholder="S100001"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
              />
            )}
            <Input
              label="College Email"
              type="email"
              placeholder="you@reclaim.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
              required
            />

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-xs text-red-700">{error}</p>
              </div>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </Button>

            {mode === 'signin' && (
              <button type="button" onClick={fillDemo} className="w-full text-xs text-blue-600 hover:text-blue-700 font-medium">
                Fill demo credentials
              </button>
            )}
          </form>

          <p className="text-center text-sm text-slate-500 mt-4">
            {mode === 'signin' ? (
              <>
                Don't have an account?{' '}
                <button onClick={() => onNavigate('signup')} className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button onClick={() => onNavigate('signin')} className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
