import { useEffect, useState } from 'react';
import { supabase, type Item } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { findMatchesForLost, findMatchesForFound, type MatchResult } from '@/lib/matching';
import { Search, MapPin, Clock, ArrowRight, CheckCircle2, PackageX, PackageSearch, ChevronRight } from 'lucide-react';
import { timeAgo } from '@/lib/matching';

interface MatchesProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  params: Record<string, string>;
}

export function Matches({ onNavigate, params }: MatchesProps) {
  const [lostItems, setLostItems] = useState<Item[]>([]);
  const [foundItems, setFoundItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLostId, setSelectedLostId] = useState<string | null>(params.lostItemId || null);
  const [selectedFoundId, setSelectedFoundId] = useState<string | null>(params.foundItemId || null);
  const [matches, setMatches] = useState<MatchResult[]>([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('items').select('*').order('created_at', { ascending: false });
      const all = (data as Item[]) || [];
      setLostItems(all.filter((i) => i.type === 'lost'));
      setFoundItems(all.filter((i) => i.type === 'found'));
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    if (selectedLostId) {
      const lost = lostItems.find((i) => i.id === selectedLostId);
      if (lost) {
        setMatches(findMatchesForLost(lost, foundItems));
      }
    } else if (selectedFoundId) {
      const found = foundItems.find((i) => i.id === selectedFoundId);
      if (found) {
        setMatches(findMatchesForFound(found, lostItems));
      }
    } else {
      setMatches([]);
    }
  }, [selectedLostId, selectedFoundId, lostItems, foundItems]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const selectedLost = lostItems.find((i) => i.id === selectedLostId);
  const selectedFound = foundItems.find((i) => i.id === selectedFoundId);
  const selectedItem = selectedLost || selectedFound;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Possible Matches</h1>
        <p className="text-sm text-slate-500 mt-1">Select an item to see its best possible matches</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
              <PackageX className="w-4 h-4 text-red-500" />
              Lost Items
            </h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {lostItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setSelectedLostId(item.id); setSelectedFoundId(null); }}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedLostId === item.id
                      ? 'bg-blue-50 border-blue-300'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className="text-sm font-medium text-slate-900 truncate">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.category} - {item.color}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
              <PackageSearch className="w-4 h-4 text-blue-500" />
              Found Items
            </h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {foundItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setSelectedFoundId(item.id); setSelectedLostId(null); }}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedFoundId === item.id
                      ? 'bg-blue-50 border-blue-300'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className="text-sm font-medium text-slate-900 truncate">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.category} - {item.color}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {selectedItem ? (
            <>
              <Card className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">{selectedItem.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{selectedItem.category} - {selectedItem.color}</p>
                  </div>
                  <StatusBadge status={selectedItem.status} />
                </div>
                <p className="text-sm text-slate-600 mb-3">{selectedItem.description}</p>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{selectedItem.location}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(selectedItem.reported_at)}</span>
                </div>
              </Card>

              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">
                  {matches.length} Possible Match{matches.length !== 1 ? 'es' : ''}
                </h3>
                {matches.length === 0 ? (
                  <Card className="p-8 text-center">
                    <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No matches found yet</p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {matches.map((match, idx) => {
                      const matchItem = match.foundItem;
                      const scoreColor = match.score >= 80 ? 'text-emerald-600' : match.score >= 50 ? 'text-amber-600' : 'text-slate-600';
                      const scoreBg = match.score >= 80 ? 'bg-emerald-50 border-emerald-200' : match.score >= 50 ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200';
                      return (
                        <Card key={idx} className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-slate-900">{matchItem.title}</h4>
                                <Badge variant={match.score >= 80 ? 'success' : match.score >= 50 ? 'warning' : 'neutral'}>
                                  {match.score}% Match
                                </Badge>
                              </div>
                              <p className="text-xs text-slate-500">{matchItem.category} - {matchItem.color}</p>
                            </div>
                          </div>

                          <div className={`p-3 rounded-lg border ${scoreBg} mb-3`}>
                            <p className="text-xs font-medium text-slate-700 mb-1.5">Match Reasons:</p>
                            <ul className="space-y-1">
                              {match.reasons.length > 0 ? (
                                match.reasons.map((reason, i) => (
                                  <li key={i} className="text-xs text-slate-600 flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                    {reason}
                                  </li>
                                ))
                              ) : (
                                <li className="text-xs text-slate-500">Partial match based on attributes</li>
                              )}
                            </ul>
                          </div>

                          <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{matchItem.location}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(matchItem.reported_at)}</span>
                          </div>

                          {match.score >= 50 && (
                            <Button
                              size="sm"
                              onClick={() => onNavigate('challenge', { foundItemId: matchItem.id, lostItemId: selectedLostId || '' })}
                            >
                              Start Ownership Challenge
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <Card className="p-12 text-center">
              <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">Select a lost or found item to see possible matches</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
