import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { emptySchoolRequirement } from '@/lib/schoolRequirements';

export default function RequirementsEditor({ value = [], onChange }) {
  const items = Array.isArray(value) ? value : [];

  const updateItem = (index, patch) => {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const addItem = () => onChange([...items, emptySchoolRequirement()]);

  const removeItem = (index) => onChange(items.filter((_, i) => i !== index));

  return (
    <div className="space-y-4">
      {items.length === 0 && (
        <p className="text-sm text-muted-foreground">No requirements yet. Add items needed by this school.</p>
      )}
      {items.map((item, index) => (
        <div key={item.id || `req-${index}`} className="rounded-lg border border-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Requirement {index + 1}</span>
            <Button type="button" size="icon" variant="ghost" onClick={() => removeItem(index)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-3">
              <Label>Item name</Label>
              <Input className="mt-1" value={item.title || ''} onChange={(e) => updateItem(index, { title: e.target.value })} placeholder="Furniture" />
            </div>
            <div>
              <Label>Amount needed (₹)</Label>
              <Input type="number" min={0} className="mt-1" value={item.needed_amount ?? ''} onChange={(e) => updateItem(index, { needed_amount: e.target.value })} />
            </div>
            <div>
              <Label>Amount raised (₹)</Label>
              <Input type="number" min={0} className="mt-1" value={item.raised_amount ?? ''} onChange={(e) => updateItem(index, { raised_amount: e.target.value })} />
            </div>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addItem}>
        <Plus className="mr-1.5 h-4 w-4" /> Add requirement
      </Button>
    </div>
  );
}
