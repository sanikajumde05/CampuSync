import { useEffect, useState } from 'react';
import { PackageX, PackageSearch, AlertCircle, Trophy, Plus, Search, ArrowRight, MapPin, Clock, PackageCheck } from 'lucide-react';
import { supabase, type Item } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { timeAgo } from '@/lib/matching';

interface DashboardProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false });
      setItems((data as Item[]) || []);
      setLoading(false);
    }
    load();
  }, []);

  const lostItems = items.filter((i) => i.type === 'lost');
  const foundItems = items.filter((i) => i.type === 'found');
  const matchedItems = items.filter((i) => i.status === 'matched');
  const recoveredItems = items.filter((i) => i.status === 'recovered');

  const myLost = lostItems.filter((i) => i.user_id === user?.id);
  const myFound = foundItems.filter((i) => i.user_id === user?.id);

  const stats = [
    { label: 'Lost Reports', value: lostItems.length, icon: PackageX, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Found Reports', value: foundItems.length, icon: PackageSearch, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pending Claims', value: matchedItems.length, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Recovered', value: recoveredItems.length, icon: Trophy, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Track your lost and found reports, matches, and recoveries</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="p-5">
            <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={() => onNavigate('report-lost')}>
          <Plus className="w-4 h-4" />
          Report Lost
        </Button>
        <Button variant="outline" onClick={() => onNavigate('report-found')}>
          <Plus className="w-4 h-4" />
          Report Found
        </Button>
        <Button variant="outline" onClick={() => onNavigate('matches')}>
          <Search className="w-4 h-4" />
          View Matches
        </Button>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">My Lost Reports</h2>
          {myLost.length > 0 && <span className="text-xs text-slate-400">{myLost.length} items</span>}
        </div>
        {myLost.length === 0 ? (
          <Card className="p-8 text-center">
            <PackageX className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No lost reports yet</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myLost.map((item) => (
              <Card key={item.id} hover className="p-5" onClick={() => onNavigate('matches', { lostItemId: item.id })}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{item.category} - {item.color}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{item.location}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(item.reported_at)}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">My Found Reports</h2>
          {myFound.length > 0 && <span className="text-xs text-slate-400">{myFound.length} items</span>}
        </div>
        {myFound.length === 0 ? (
          <Card className="p-8 text-center">
            <PackageSearch className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No found reports yet</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myFound.map((item) => (
              <Card key={item.id} hover className="p-5" onClick={() => onNavigate('matches', { foundItemId: item.id })}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{item.category} - {item.color}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{item.location}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(item.reported_at)}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {matchedItems.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Pending Claims</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matchedItems.map((item) => (
              <Card key={item.id} hover className="p-5" onClick={() => onNavigate('challenge', { foundItemId: item.id })}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{item.location}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                <div className="flex items-center gap-1 text-sm text-blue-600 font-medium">
                  Start Ownership Challenge
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {recoveredItems.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Recovered Items</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recoveredItems.map((item) => (
              <Card key={item.id} className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{item.location}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                <div className="flex items-center gap-1 text-sm text-emerald-600 font-medium">
                  <PackageCheck className="w-4 h-4" />
                  Successfully recovered
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
