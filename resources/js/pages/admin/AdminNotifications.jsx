import { useState } from 'react';
import { adminService } from '@/api/admin';
import { Bell, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';

const AUDIENCE_OPTIONS = [
  { id: 'all_members', label: 'All members', fetch: () => adminService.listUsers({ limit: 1000 }) },
  { id: 'volunteers', label: 'All volunteers', fetch: () => adminService.listAllVolunteers({ limit: 1000 }) },
];

export default function AdminNotifications() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState('all_members');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setSending(true);
    setError(null);
    setResult(null);

    try {
      const option = AUDIENCE_OPTIONS.find((o) => o.id === audience);
      const { data } = await option.fetch();
      const userIds = (data || [])
        .map((row) => row.user_id || row.id)
        .filter(Boolean);

      if (!userIds.length) {
        setError('No recipients found for this audience.');
        return;
      }

      await adminService.sendBulkNotification({ userIds, title, message });
      setResult(`Sent to ${userIds.length} user(s). Stored in \`notifications\` table.`);
      setTitle('');
      setMessage('');
    } catch (err) {
      setError(err.message || 'Failed to send notifications');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <HeroScrollSection size="compact">
        <div className="bg-indigo-600 text-white py-8 px-6">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-heading text-3xl font-bold flex items-center gap-3">
              <Bell className="w-8 h-8" />
              Notifications
            </h1>
            <p className="text-white/70 text-sm mt-1">Send announcements to members and volunteers</p>
          </div>
        </div>
      </HeroScrollSection>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <form onSubmit={handleSend} className="bg-white rounded-2xl border border-border p-6 space-y-5">
          <div>
            <Label>Audience</Label>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
            >
              {AUDIENCE_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="notif-title">Title</Label>
            <Input id="notif-title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 rounded-xl" placeholder="Announcement title" required />
          </div>

          <div>
            <Label htmlFor="notif-message">Message</Label>
            <RichTextEditor label="Message" value={message} onChange={setMessage} required hint="Use headings and lists for readable announcements." />
          </div>

          {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}
          {result && <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{result}</div>}

          <Button type="submit" disabled={sending} className="brand-gradient text-white border-0 rounded-xl">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4 mr-2" />Send notification</>}
          </Button>
        </form>
      </div>
    </div>
  );
}
