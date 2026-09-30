import { Trophy, Search, ShieldCheck, PackageCheck, ArrowRight, MapPin, Clock, Sparkles, HandHelping, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface LandingProps {
  onNavigate: (page: string) => void;
}

export function Landing({ onNavigate }: LandingProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-sm">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900 tracking-tight">RECLAIM</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => onNavigate('signin')}>Sign In</Button>
          <Button variant="primary" size="sm" onClick={() => onNavigate('signup')}>Get Started</Button>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          AI-Powered Campus Lost & Found
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight max-w-3xl mx-auto leading-tight">
          Reclaim what's yours.<br />
          <span className="bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">No lost-and-found team needed.</span>
        </h1>
        <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">
          RECLAIM connects students who lost items with those who found them. AI-powered matching, ownership verification, and secure handover — all in one platform.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button size="lg" onClick={() => onNavigate('signin')}>
            Try Demo Login
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="lg" onClick={() => onNavigate('signup')}>
            Create Account
          </Button>
        </div>
        <p className="mt-3 text-sm text-slate-400">Demo account ready — sign in instantly with pre-seeded data</p>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Search, title: 'Smart Matching', desc: 'AI extracts item attributes and deterministic scoring finds the best possible matches automatically.' },
            { icon: ShieldCheck, title: 'Ownership Verification', desc: 'Answer private questions about distinguishing features to prove the item is truly yours.' },
            { icon: PackageCheck, title: 'Secure Handover', desc: 'Get a unique recovery token and choose a handover point. Track progress from reported to recovered.' },
          ].map((feature, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all">
              <div className="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                <feature.icon className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 sm:p-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">How it works</h2>
          <p className="text-slate-400 mb-10 max-w-xl mx-auto">From lost to recovered in five simple steps</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { icon: HandHelping, label: 'Report', desc: 'Lost or found an item' },
              { icon: Zap, label: 'AI Match', desc: 'Smart attribute extraction' },
              { icon: Search, label: 'Matches', desc: 'See possible matches' },
              { icon: ShieldCheck, label: 'Verify', desc: 'Prove ownership' },
              { icon: PackageCheck, label: 'Recover', desc: 'Get your item back' },
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center mb-3">
                  <step.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm font-semibold text-white">{step.label}</p>
                <p className="text-xs text-slate-400 mt-1">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Demo credentials</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
              <p className="text-xs font-medium text-slate-500 mb-1">Student Account</p>
              <p className="text-sm text-slate-900">demo@reclaim.edu</p>
              <p className="text-sm text-slate-900">demo123456</p>
            </div>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
              <p className="text-xs font-medium text-slate-500 mb-1">Admin Account</p>
              <p className="text-sm text-slate-900">admin@reclaim.edu</p>
              <p className="text-sm text-slate-900">admin123456</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-slate-700">RECLAIM</span>
          </div>
          <p className="text-xs text-slate-400">Campus Recovery System</p>
        </div>
      </footer>
    </div>
  );
}
