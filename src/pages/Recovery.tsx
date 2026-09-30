import { useEffect, useState } from 'react';
import { supabase, type Item, type Recovery, HANDOVER_POINTS } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { generateToken } from '@/lib/matching';
import { CheckCircle2, ArrowRight, Loader2, MapPin, PackageCheck, Trophy, Copy, Check, ShieldCheck, HandHelping, Package } from 'lucide-react';

interface RecoveryProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  params: Record<string, string>;
}

const STEPS = [
  { key: 'reported', label: 'Reported', icon: Package },
  { key: 'matched', label: 'Matched', icon: HandHelping },
  { key: 'verified', label: 'Verified', icon: ShieldCheck },
  { key: 'handover', label: 'Handover', icon: MapPin },
  { key: 'recovered', label: 'Recovered', icon: Trophy },
];

export function RecoveryPage({ onNavigate, params }: RecoveryProps) {
  const { user } = useAuth();
  const [foundItem, setFoundItem] = useState<Item | null>(null);
  const [lostItem, setLostItem] = useState<Item | null>(null);
  const [recovery, setRecovery] = useState<Recovery | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    async function load() {
      const foundId = params.foundItemId;
      if (!foundId) {
        setLoading(false);
        return;
      }

      const { data: found } = await supabase.from('items').select('*').eq('id', foundId).maybeSingle();
      setFoundItem(found as Item);

      if (params.lostItemId) {
        const { data: lost } = await supabase.from('items').select('*').eq('id', params.lostItemId).maybeSingle();
        setLostItem(lost as Item);
      }

      // Check for existing recovery
      const { data: rec } = await supabase
        .from('recoveries')
        .select('*')
        .eq('found_item_id', foundId)
        .maybeSingle();
      setRecovery(rec as Recovery);
      if (rec) {
        setSelectedPoint((rec as Recovery).handover_point || '');
      }

      setLoading(false);
    }
    load();
  }, [params.foundItemId, params.lostItemId]);

  const createRecovery = async () => {
    if (!foundItem || !selectedPoint || !user) return;
    setCreating(true);

    const token = generateToken();

    // Find the challenge for this found item
    const { data: challenge } = await supabase
      .from('ownership_challenges')
      .select('id')
      .eq('found_item_id', foundItem.id)
      .maybeSingle();

    const { data: rec } = await supabase
      .from('recoveries')
      .insert({
        found_item_id: foundItem.id,
        lost_item_id: params.lostItemId || null,
        claimant_id: user.id,
        challenge_id: (challenge as any)?.id || null,
        token,
        handover_point: selectedPoint,
        status: 'verified',
      })
      .select()
      .single();

    // Update item status to verified
    await supabase.from('items').update({ status: 'verified' }).eq('id', foundItem.id);
    if (lostItem) {
      await supabase.from('items').update({ status: 'verified' }).eq('id', lostItem.id);
    }

    setRecovery(rec as Recovery);
    setCreating(false);
  };

  const updateHandover = async () => {
    if (!recovery || !foundItem) return;
    setUpdatingStatus(true);

    await supabase
      .from('recoveries')
      .update({ status: 'handover', updated_at: new Date().toISOString() })
      .eq('id', recovery.id);

    await supabase.from('items').update({ status: 'handover' }).eq('id', foundItem.id);
    if (lostItem) {
      await supabase.from('items').update({ status: 'handover' }).eq('id', lostItem.id);
    }

    setRecovery({ ...recovery, status: 'handover' });
    setUpdatingStatus(false);
  };

  const markRecovered = async () => {
    if (!recovery || !foundItem) return;
    setUpdatingStatus(true);

    await supabase
      .from('recoveries')
      .update({ status: 'recovered', updated_at: new Date().toISOString() })
      .eq('id', recovery.id);

    await supabase.from('items').update({ status: 'recovered' }).eq('id', foundItem.id);
    if (lostItem) {
      await supabase.from('items').update({ status: 'recovered' }).eq('id', lostItem.id);
    }

    setRecovery({ ...recovery, status: 'recovered' });
    setUpdatingStatus(false);
  };

  const copyToken = () => {
    if (recovery?.token) {
      navigator.clipboard.writeText(recovery.token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!foundItem) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-slate-500">No item selected for recovery</p>
        <Button className="mt-4" onClick={() => onNavigate('dashboard')}>Back to Dashboard</Button>
      </Card>
    );
  }

  const currentStepIndex = recovery
    ? recovery.status === 'recovered'
      ? 4
      : recovery.status === 'handover'
        ? 3
        : 2
    : 1;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Recovery & Handover</h1>
        <p className="text-sm text-slate-500 mt-1">Claim approved — generate your recovery token and select a handover point</p>
      </div>

      {/* Progress tracker */}
      <Card className="p-6">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200" />
          <div
            className="absolute top-5 left-0 h-0.5 bg-blue-600 transition-all duration-500"
            style={{ width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%` }}
          />
          {STEPS.map((step, idx) => {
            const isComplete = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <div key={step.key} className="relative flex flex-col items-center gap-2 z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isComplete
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border-2 border-slate-200 text-slate-400'
                  } ${isCurrent ? 'ring-4 ring-blue-100' : ''}`}
                >
                  {isComplete && idx < currentStepIndex ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <span className={`text-xs font-medium ${isComplete ? 'text-slate-900' : 'text-slate-400'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Item info */}
      <Card className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">{foundItem.title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{foundItem.category} - {foundItem.color} - {foundItem.location}</p>
          </div>
          <Badge variant="success">Claim Approved</Badge>
        </div>
      </Card>

      {/* Recovery token or creation */}
      {recovery ? (
        <>
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <PackageCheck className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-slate-900">Recovery Token</h3>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
              <code className="text-2xl font-bold text-blue-700 tracking-wider">{recovery.token}</code>
              <Button variant="ghost" size="sm" onClick={copyToken}>
                {copied ? <><Check className="w-4 h-4 text-emerald-600" /> Copied</> : <><Copy className="w-4 h-4" /> Copy</>}
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-3">
              Present this token at the handover point to collect your item.
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-slate-900">Handover Point</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {HANDOVER_POINTS.map((point) => (
                <button
                  key={point}
                  onClick={() => setSelectedPoint(point)}
                  disabled={recovery.status !== 'verified'}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    selectedPoint === point
                      ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-100'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  } ${recovery.status !== 'verified' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <MapPin className="w-4 h-4 text-slate-400 mb-1" />
                  <p className="text-sm font-medium text-slate-900">{point}</p>
                </button>
              ))}
            </div>
            {recovery.handover_point && (
              <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200">
                <p className="text-xs text-slate-500">Selected handover point:</p>
                <p className="text-sm font-medium text-slate-900 mt-0.5">{recovery.handover_point}</p>
              </div>
            )}
          </Card>

          {/* Action buttons */}
          <div className="flex gap-3">
            {recovery.status === 'verified' && (
              <Button size="lg" className="flex-1" onClick={updateHandover} disabled={updatingStatus || !recovery.handover_point}>
                {updatingStatus ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : <>Mark as Handover Ready <ArrowRight className="w-4 h-4" /></>}
              </Button>
            )}
            {recovery.status === 'handover' && (
              <Button size="lg" className="flex-1" onClick={markRecovered} disabled={updatingStatus}>
                {updatingStatus ? <><Loader2 className="w-4 h-4 animate-spin" /> Completing...</> : <><Trophy className="w-4 h-4" /> Mark as Recovered</>}
              </Button>
            )}
            {recovery.status === 'recovered' && (
              <Card className="flex-1 p-6 text-center bg-emerald-50 border-emerald-200">
                <Trophy className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-emerald-700">Item Successfully Recovered</p>
                <p className="text-xs text-emerald-600 mt-1">Thank you for using RECLAIM</p>
              </Card>
            )}
          </div>

          {recovery.status === 'recovered' && (
            <Button variant="outline" className="w-full" onClick={() => onNavigate('dashboard')}>
              Back to Dashboard
            </Button>
          )}
        </>
      ) : (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-slate-900">Select Handover Point</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {HANDOVER_POINTS.map((point) => (
              <button
                key={point}
                onClick={() => setSelectedPoint(point)}
                className={`p-4 rounded-lg border text-left transition-all ${
                  selectedPoint === point
                    ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-100'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <MapPin className="w-4 h-4 text-slate-400 mb-1" />
                <p className="text-sm font-medium text-slate-900">{point}</p>
              </button>
            ))}
          </div>
          <Button size="lg" className="w-full" onClick={createRecovery} disabled={creating || !selectedPoint}>
            {creating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><PackageCheck className="w-4 h-4" /> Generate Recovery Token</>}
          </Button>
        </Card>
      )}
    </div>
  );
}
