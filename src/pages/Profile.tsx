import { useEffect, useState } from 'react';
import { supabase, type Item, type Profile } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { User as UserIcon, Mail, IdCard, Trophy, PackageX, PackageSearch, PackageCheck, Shield, ArrowRight, Clock } from 'lucide-react';
import { timeAgo } from '@/lib/matching';

interface ProfilePageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export function ProfilePage({ onNavigate }: ProfilePageProps) {
  const { user, profile } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) return;
      const { data } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setItems((data as Item[]) || []);
      setLoading(false);
    }
    load();
  }, [user]);

  const myLost = items.filter((i) => i.type === 'lost');
  const myFound = items.filter((i) => i.type === 'found');
  const recovered = items.filter((i) => i.status === 'recovered');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
        <p className="text-sm text-slate-500 mt-1">Your account and activity</p>
      </div>

      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-xl font-bold">
            {profile?.full_name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-900">{profile?.full_name}</h2>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-500">
              <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{user?.email}</span>
              <span className="flex items-center gap-1.5"><IdCard className="w-3.5 h-3.5" />{profile?.student_id}</span>
            </div>
            <div className="mt-2">
              {profile?.role === 'admin' ? (
                <Badge variant="danger"><Shield className="w-3 h-3" /> Administrator</Badge>
              ) : (
                <Badge variant="info"><UserIcon className="w-3 h-3" /> Student</Badge>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-5 text-center">
          <PackageX className="w-6 h-6 text-red-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-slate-900">{myLost.length}</p>
          <p className="text-xs text-slate-500">Lost Reports</p>
        </Card>
        <Card className="p-5 text-center">
          <PackageSearch className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-slate-900">{myFound.length}</p>
          <p className="text-xs text-slate-500">Found Reports</p>
        </Card>
        <Card className="p-5 text-center">
          <Trophy className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-slate-900">{recovered.length}</p>
          <p className="text-xs text-slate-500">Recovered</p>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">My Reports</h2>
        {items.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-sm text-slate-500">No reports yet</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <Card key={item.id} hover className="p-4" onClick={() => onNavigate('matches', item.type === 'lost' ? { lostItemId: item.id } : { foundItemId: item.id })}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.type === 'lost' ? 'bg-red-50' : 'bg-blue-50'}`}>
                      {item.type === 'lost' ? <PackageX className="w-5 h-5 text-red-500" /> : <PackageSearch className="w-5 h-5 text-blue-500" />}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{item.title}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />{timeAgo(item.reported_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={item.status} />
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
