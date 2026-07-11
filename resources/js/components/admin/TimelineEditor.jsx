import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';

const EMPTY_EVENT = { date: '', title: '', desc: '', type: 'milestone', icon: '📌' };

export default function TimelineEditor({ value = [], onChange }) {
  const events = Array.isArray(value) ? value : [];

  const updateEvent = (index, patch) => {
    onChange(events.map((ev, i) => (i === index ? { ...ev, ...patch } : ev)));
  };

  const addEvent = () => onChange([...events, { ...EMPTY_EVENT }]);

  const removeEvent = (index) => onChange(events.filter((_, i) => i !== index));

  return (
    <div className="space-y-4">
      {events.length === 0 && (
        <p className="text-sm text-muted-foreground">No timeline entries yet. Add events to show on the Timeline tab.</p>
      )}
      {events.map((ev, index) => (
        <div key={ev.id || `event-${index}`} className="rounded-lg border border-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Event {index + 1}</span>
            <Button type="button" size="icon" variant="ghost" onClick={() => removeEvent(index)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Date</Label>
              <Input type="date" className="mt-1" value={ev.date || ''} onChange={(e) => updateEvent(index, { date: e.target.value })} />
            </div>
            <div>
              <Label>Icon (emoji)</Label>
              <Input className="mt-1" value={ev.icon || ''} onChange={(e) => updateEvent(index, { icon: e.target.value })} placeholder="🌳" />
            </div>
            <div className="sm:col-span-2">
              <Label>Title</Label>
              <Input className="mt-1" value={ev.title || ''} onChange={(e) => updateEvent(index, { title: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label>Description</Label>
              <Textarea className="mt-1" rows={2} value={ev.desc || ''} onChange={(e) => updateEvent(index, { desc: e.target.value })} />
            </div>
            <div>
              <Label>Type</Label>
              <Input className="mt-1" value={ev.type || ''} onChange={(e) => updateEvent(index, { type: e.target.value })} placeholder="infrastructure" />
            </div>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addEvent}>
        <Plus className="mr-1.5 h-4 w-4" /> Add timeline event
      </Button>
    </div>
  );
}
