import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase, CATEGORIES, COLORS, type Item } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { PackageX, Camera, CheckCircle2, Loader2 } from 'lucide-react';

interface ReportLostProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export function ReportLost({ onNavigate }: ReportLostProps) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const { data, error } = await supabase
      .from('items')
      .insert({
        user_id: user?.id,
        type: 'lost',
        title: form.title,
        category: form.category,
        color: form.color,
        description: form.description,
        distinguishing_features: form.distinguishing_features,
        location: form.location,
        reported_at: new Date(form.reported_at).toISOString(),
        photo_url: photoUrl || null,
        status: 'active',
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
      onNavigate('matches', { lostItemId: (data as Item).id });
    }, 1500);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Report Submitted</h2>
        <p className="text-sm text-slate-500 mt-1">Redirecting to possible matches...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Report Lost Item</h1>
        <p className="text-sm text-slate-500 mt-1">Tell us what you lost and we'll find matches for you</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Item Title"
            placeholder="e.g. Black North Face Backpack"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />

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
            label="Description"
            placeholder="Describe the item in detail — brand, model, contents, condition..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            required
          />

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
              label="Last Seen Location"
              placeholder="e.g. Library Entrance"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              required
            />
            <Input
              label="When did you lose it?"
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
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <><PackageX className="w-4 h-4" /> Submit Report</>}
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


