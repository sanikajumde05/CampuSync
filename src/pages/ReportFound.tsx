import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase, CATEGORIES, COLORS, type Item } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { HandHelping, Camera, CheckCircle2, Loader2, Sparkles, Wand2, AlertCircle } from 'lucide-react';

interface ReportFoundProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

interface AIResult {
  category: string;
  color: string;
  features: string[];
  source: string;
}

export function ReportFound({ onNavigate }: ReportFoundProps) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: '',
    category: '',
    color: '',
    description: '',
    distinguishing_features: '',
    location: '',
    reported_at: new Date().toISOString().slice(0, 16),
  });
  const [photoUrl, setPhotoUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiResult, setAIResult] = useState<AIResult | null>(null);
  const [aiLoading, setAILoading] = useState(false);
  const [aiError, setAIError] = useState<string | null>(null);

  const extractAttributes = async () => {
    if (!form.description || form.description.trim().length < 5) {
      setAIError('Please enter a description first');
      return;
    }
    setAILoading(true);
    setAIError(null);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const response = await fetch(`${supabaseUrl}/functions/v1/extract-attributes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${anonKey}`,
          apikey: anonKey,
        },
        body: JSON.stringify({ description: form.description }),
      });

      if (!response.ok) throw new Error('AI extraction failed');
      const data = await response.json() as AIResult;

      setAIResult(data);
      if (data.category) setForm((f) => ({ ...f, category: data.category }));
      if (data.color) setForm((f) => ({ ...f, color: data.color }));
      if (data.features && data.features.length > 0) {
        setForm((f) => ({ ...f, distinguishing_features: data.features.join('; ') }));
      }
    } catch (err) {
      setAIError('AI extraction unavailable — you can fill attributes manually');
    } finally {
      setAILoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const { data, error } = await supabase
      .from('items')
      .insert({
        user_id: user?.id,
        type: 'found',
        title: form.title,
        category: form.category,
        color: form.color,
        description: form.description,
        distinguishing_features: form.distinguishing_features,
        location: form.location,
        reported_at: new Date(form.reported_at).toISOString(),
        photo_url: photoUrl || null,
        status: 'active',
        ai_category: aiResult?.category || null,
        ai_color: aiResult?.color || null,
        ai_features: aiResult?.features || [],
      })
      .select()
      .single();

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    setSuccess(true);
    setSaving(false);
    setTimeout(() => {
      onNavigate('matches', { foundItemId: (data as Item).id });
    }, 1500);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Found Item Reported</h2>
        <p className="text-sm text-slate-500 mt-1">Redirecting to possible matches...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Report Found Item</h1>
        <p className="text-sm text-slate-500 mt-1">Found something? Let's find its owner</p>
      </div>

      <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-900">AI-Powered Attribute Extraction</p>
            <p className="text-xs text-slate-600 mt-0.5">Write a description and let AI extract category, color, and features automatically</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Item Title"
            placeholder="e.g. Black Backpack Found Near Library"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />

          <Textarea
            label="Description"
            placeholder="Describe the item in detail — what it looks like, brand, distinguishing marks, contents..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            required
          />

          <div className="flex items-center gap-3">
            <Button type="button" variant="secondary" size="sm" onClick={extractAttributes} disabled={aiLoading || !form.description}>
              {aiLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Extracting...</> : <><Wand2 className="w-4 h-4" /> Extract with AI</>}
            </Button>
            {aiResult && (
              <Badge variant={aiResult.source === 'claude' ? 'success' : 'warning'}>
                {aiResult.source === 'claude' ? 'AI Extracted' : 'Fallback Extraction'}
              </Badge>
            )}
          </div>

          {aiError && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <p className="text-xs text-amber-700">{aiError}</p>
            </div>
          )}

          {aiResult && (
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
              <p className="text-xs font-medium text-slate-500">AI Extracted Attributes:</p>
              <div className="flex flex-wrap gap-2">
                {aiResult.category && <Badge variant="info">Category: {aiResult.category}</Badge>}
                {aiResult.color && <Badge variant="info">Color: {aiResult.color}</Badge>}
                {aiResult.features.map((f, i) => (
                  <Badge key={i} variant="neutral">{f}</Badge>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
            >
              <option value="">Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
            <Select
              label="Color"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              required
            >
              <option value="">Select color</option>
              {COLORS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </div>

          <Textarea
            label="Distinguishing Features"
            placeholder="e.g. Red panda keychain; scratch on left strap; MIT logo patch"
            value={form.distinguishing_features}
            onChange={(e) => setForm({ ...form, distinguishing_features: e.target.value })}
            rows={2}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Found Location"
              placeholder="e.g. Library Entrance"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              required
            />
            <Input
              label="When did you find it?"
              type="datetime-local"
              value={form.reported_at}
              onChange={(e) => setForm({ ...form, reported_at: e.target.value })}
              required
            />
          </div>

          <Input
            label="Photo URL (optional)"
            placeholder="https://..."
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            icon={<Camera className="w-4 h-4" />}
          />

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit" size="lg" disabled={saving} className="flex-1">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <><HandHelping className="w-4 h-4" /> Submit Report</>}
            </Button>
            <Button variant="outline" size="lg" onClick={() => onNavigate('dashboard')}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
