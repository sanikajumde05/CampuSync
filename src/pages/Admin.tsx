import { useEffect, useState } from 'react';
import { supabase, type Item, type Recovery } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { PackageX, PackageSearch, AlertCircle, Trophy, MapPin, BarChart3, TrendingUp, Building2, Shield, Clock } from 'lucide-react';
import { timeAgo } from '@/lib/matching';

interface AdminProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export function AdminDashboard({ onNavigate }: AdminProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [recoveries, setRecoveries] = useState<Recovery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: itemsData } = await supabase.from('items').select('*').order('created_at', { ascending: false });
      const { data: recData } = await supabase.from('recoveries').select('*').order('created_at', { ascending: false });
      setItems((itemsData as Item[]) || []);
      setRecoveries((recData as Recovery[]) || []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const lostItems = items.filter((i) => i.type === 'lost');
  const foundItems = items.filter((i) => i.type === 'found');
  const pendingClaims = items.filter((i) => i.status === 'matched' || i.status === 'verified' || i.status === 'handover');
  const recoveredItems = items.filter((i) => i.status === 'recovered');

  // Location insights
  const locationCounts: Record<string, number> = {};
  items.forEach((item) => {
    const loc = item.location;
    locationCounts[loc] = (locationCounts[loc] || 0) + 1;
  });
  const topLocations = Object.entries(locationCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);
  const maxCount = topLocations.length > 0 ? topLocations[0][1] : 1;

  // Category insights
  const categoryCounts: Record<string, number> = {};
  items.forEach((item) => {
    const cat = item.category || 'Other';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });
  const topCategories = Object.entries(categoryCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);
  const maxCatCount = topCategories.length > 0 ? topCategories[0][1] : 1;

  // Active handover points
  const activeHandovers = recoveries.filter((r) => r.status === 'handover' || r.status === 'verified');

  const stats = [
    { label: 'Total Lost', value: lostItems.length, icon: PackageX, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Total Found', value: foundItems.length, icon: PackageSearch, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pending Claims', value: pendingClaims.length, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Recovered', value: recoveredItems.length, icon: Trophy, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <Shield className="w-6 h-6 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Campus recovery overview and insights</p>
        </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-semibold text-slate-900">Common Report Locations</h2>
          </div>
          <div className="space-y-3">
            {topLocations.map(([location, count]) => (
              <div key={location}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {location}
                  </span>
                  <span className="text-xs font-medium text-slate-500">{count} reports</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-semibold text-slate-900">Common Categories</h2>
          </div>
          <div className="space-y-3">
            {topCategories.map(([category, count]) => (
              <div key={category}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-700">{category}</span>
                  <span className="text-xs font-medium text-slate-500">{count} items</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-500"
                    style={{ width: `${(count / maxCatCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-slate-900">Active Handover Points</h2>
        </div>
        {activeHandovers.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-sm text-slate-500">No active handovers</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeHandovers.map((rec) => {
              const item = items.find((i) => i.id === rec.found_item_id);
              return (
                <Card key={rec.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-slate-900">{item?.title || 'Unknown item'}</p>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />{rec.handover_point}
                      </p>
                    </div>
                    <StatusBadge status={rec.status} />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="info">{rec.token}</Badge>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />{timeAgo(rec.created_at)}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">All Reports</h2>
        <div className="space-y-2">
          {items.slice(0, 10).map((item) => (
            <Card key={item.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${item.type === 'lost' ? 'bg-red-50' : 'bg-blue-50'}`}>
                    {item.type === 'lost' ? <PackageX className="w-4 h-4 text-red-500" /> : <PackageSearch className="w-4 h-4 text-blue-500" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{item.title}</p>
                    <p className="text-xs text-slate-500">{item.category} - {item.color} - {item.location}</p>
                  </div>
                </div>
                <StatusBadge status={item.status} />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
