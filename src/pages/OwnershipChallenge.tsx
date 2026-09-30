import { useEffect, useState } from 'react';
import { supabase, type Item, type OwnershipChallenge, type ChallengeQuestion } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import {
  ShieldCheck, Lock, CheckCircle2, AlertCircle,
  ArrowRight, Loader2, HelpCircle, Fingerprint,
} from 'lucide-react';

interface ChallengeProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  params: Record<string, string>;
}

function buildQuestions(item: Item): ChallengeQuestion[] {
  const featureText = item.distinguishing_features || '';
  const featureList = featureText
    .split(/[;,]/)
    .map((f) => f.trim())
    .filter((f) => f.length > 0);

  const qs: ChallengeQuestion[] = [];

  const hints: [string, string][] = [
    ['What was the first distinguishing feature of this item?', featureList[0] ?? item.color ?? ''],
    ['What was the second distinguishing feature?', featureList[1] ?? item.category ?? ''],
    ['What was the third distinguishing feature?', featureList[2] ?? item.location ?? ''],
  ];

  // Only use questions where we have a non-empty answer
  for (const [question, answer] of hints) {
    if (answer) {
      qs.push({ question, answer: answer.toLowerCase() });
    }
    if (qs.length === 3) break;
  }

  // Fallback: location question if still short
  if (qs.length < 2 && item.location) {
    qs.push({ question: 'Where was this item found?', answer: item.location.toLowerCase() });
  }

  return qs.slice(0, 3);
}

function answerMatches(userAnswer: string, correct: string): boolean {
  const ua = userAnswer.toLowerCase().trim();
  const ca = correct.toLowerCase().trim();
  if (ua === ca) return true;
  if (ua.includes(ca) || ca.includes(ua)) return true;
  const setA = new Set(ua.split(' ').filter((w) => w.length > 2));
  const setB = new Set(ca.split(' ').filter((w) => w.length > 2));
  let overlap = 0;
  for (const w of setA) if (setB.has(w)) overlap++;
  return overlap >= 1 && setB.size >= 1;
}

export function OwnershipChallenge({ onNavigate, params }: ChallengeProps) {
  const { user } = useAuth();
  const [foundItem, setFoundItem] = useState<Item | null>(null);
  const [existingChallenge, setExistingChallenge] = useState<OwnershipChallenge | null>(null);
  const [questions, setQuestions] = useState<ChallengeQuestion[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ verified: boolean; correct: number; total: number } | null>(null);

  useEffect(() => {
    async function load() {
      const foundId = params.foundItemId;
      if (!foundId) { setLoading(false); return; }

      const { data: found } = await supabase
        .from('items').select('*').eq('id', foundId).maybeSingle();
      const item = found as Item | null;
      setFoundItem(item);

      // Load existing challenge for this found item
      const { data: challenge } = await supabase
        .from('ownership_challenges')
        .select('*')
        .eq('found_item_id', foundId)
        .maybeSingle();

      if (challenge) {
        const ch = challenge as OwnershipChallenge;
        setExistingChallenge(ch);
        setQuestions(ch.questions || []);
        setAnswers(Array(ch.questions?.length ?? 0).fill(''));
      } else if (item) {
        const qs = buildQuestions(item);
        setQuestions(qs);
        setAnswers(Array(qs.length).fill(''));
      }

      setLoading(false);
    }
    load();
  }, [params.foundItemId]);

  const handleAnswerChange = (idx: number, val: string) => {
    const next = [...answers];
    next[idx] = val;
    setAnswers(next);
  };

  const handleSubmit = async () => {
    if (!foundItem || !user) return;
    setSubmitting(true);

    let correct = 0;
    for (let i = 0; i < questions.length; i++) {
      if (answerMatches(answers[i] ?? '', questions[i].answer)) correct++;
    }
    const verified = correct === questions.length;

    if (existingChallenge) {
      await supabase
        .from('ownership_challenges')
        .update({ answers, correct_count: correct, total_questions: questions.length, verified })
        .eq('id', existingChallenge.id);
    } else {
      const { data } = await supabase
        .from('ownership_challenges')
        .insert({
          found_item_id: foundItem.id,
          lost_item_id: params.lostItemId || null,
          claimant_id: user.id,
          questions,
          answers,
          correct_count: correct,
          total_questions: questions.length,
          verified,
        })
        .select()
        .single();
      setExistingChallenge(data as OwnershipChallenge);
    }

    if (verified) {
      await supabase.from('items').update({ status: 'verified' }).eq('id', foundItem.id);
      if (params.lostItemId) {
        await supabase.from('items').update({ status: 'verified' }).eq('id', params.lostItemId);
      }
    }

    setResult({ verified, correct, total: questions.length });
    setSubmitting(false);
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
        <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-sm text-slate-500">No item selected for challenge</p>
        <Button className="mt-4" onClick={() => onNavigate('matches')}>Back to Matches</Button>
      </Card>
    );
  }

  if (result) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 text-center">
          {result.verified ? (
            <>
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Ownership Verified</h2>
              <p className="text-sm text-slate-500 mt-1">
                {result.correct} / {result.total} answers correct
              </p>
              <p className="text-sm text-emerald-600 mt-2 font-medium">
                Your claim has been approved. Proceed to recovery.
              </p>
              <Button
                className="mt-6"
                size="lg"
                onClick={() =>
                  onNavigate('recovery', {
                    foundItemId: foundItem.id,
                    lostItemId: params.lostItemId || '',
                  })
                }
              >
                Proceed to Recovery
                <ArrowRight className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Additional Verification Required</h2>
              <p className="text-sm text-slate-500 mt-1">
                {result.correct} / {result.total} answers correct
              </p>
              <p className="text-sm text-amber-600 mt-2 font-medium">
                Please contact the finder or campus security for further assistance.
              </p>
              <div className="flex gap-3 justify-center mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setResult(null);
                    setAnswers(Array(questions.length).fill(''));
                  }}
                >
                  Try Again
                </Button>
                <Button onClick={() => onNavigate('dashboard')}>Dashboard</Button>
              </div>
            </>
          )}
        </Card>
      </div>
    );
  }

  const allAnswered = answers.length === questions.length && answers.every((a) => a.trim() !== '');

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Fingerprint className="w-6 h-6 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ownership Challenge</h1>
          <p className="text-sm text-slate-500">
            Answer questions about private distinguishing features to verify ownership
          </p>
        </div>
      </div>

      <Card className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">{foundItem.title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {foundItem.category} &middot; {foundItem.color} &middot; {foundItem.location}
            </p>
          </div>
          <Badge variant="info">Found Item</Badge>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-5">
          <Lock className="w-4 h-4 text-slate-400" />
          <p className="text-sm font-medium text-slate-700">
            Answer all {questions.length} questions correctly to verify ownership
          </p>
        </div>

        <div className="space-y-5">
          {questions.map((q, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-700">{idx + 1}</span>
                </div>
                <p className="text-sm font-medium text-slate-900 flex items-center gap-1.5 pt-0.5">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  {q.question}
                </p>
              </div>
              <div className="ml-8">
                <Input
                  placeholder="Type your answer..."
                  value={answers[idx] ?? ''}
                  onChange={(e) => handleAnswerChange(idx, e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            size="lg"
            className="flex-1"
            onClick={handleSubmit}
            disabled={submitting || !allAnswered}
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
            ) : (
              <><ShieldCheck className="w-4 h-4" /> Submit Answers</>
            )}
          </Button>
          <Button variant="outline" size="lg" onClick={() => onNavigate('matches')}>
            Cancel
          </Button>
        </div>
      </Card>

      <Card className="p-4 bg-amber-50 border-amber-200">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">
            Incorrect answers never label you as fraudulent — they simply mean additional
            verification is needed.
          </p>
        </div>
      </Card>
    </div>
  );
}
