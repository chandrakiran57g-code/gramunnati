import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import AdminImageUpload from '@/components/admin/AdminMediaUpload';
import { CROP_AVAILABILITY_OPTIONS, emptyVillageCrop } from '@/lib/villageCrops';

export default function CropsEditor({ value = [], onChange }) {
  const crops = Array.isArray(value) ? value : [];

  const updateCrop = (index, patch) => {
    onChange(crops.map((crop, i) => (i === index ? { ...crop, ...patch } : crop)));
  };

  const addCrop = () => onChange([...crops, emptyVillageCrop()]);

  const removeCrop = (index) => onChange(crops.filter((_, i) => i !== index));

  return (
    <div className="space-y-4">
      {crops.length === 0 && (
        <p className="text-sm text-muted-foreground">No crops added yet. Add crop entries to show on the public Crops tab.</p>
      )}
      {crops.map((crop, index) => (
        <div key={crop.id || `crop-${index}`} className="rounded-lg border border-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Crop {index + 1}</span>
            <Button type="button" size="icon" variant="ghost" onClick={() => removeCrop(index)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Crop name</Label>
              <Input className="mt-1" value={crop.name || ''} onChange={(e) => updateCrop(index, { name: e.target.value })} placeholder="Paddy" />
            </div>
            <div className="sm:col-span-2">
              <AdminImageUpload
                label="Crop image"
                value={crop.image || ''}
                onChange={(url) => updateCrop(index, { image: url })}
                subPath="villages/crops"
              />
            </div>
            <div>
              <Label>Crop price / kg (₹)</Label>
              <Input type="number" min={0} step="0.01" className="mt-1" value={crop.price_per_kg ?? ''} onChange={(e) => updateCrop(index, { price_per_kg: e.target.value })} />
            </div>
            <div>
              <Label>Availability</Label>
              <select
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                value={crop.availability || 'in_season'}
                onChange={(e) => updateCrop(index, { availability: e.target.value })}
              >
                {CROP_AVAILABILITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Sowing period</Label>
              <Input className="mt-1" value={crop.sowing_period || ''} onChange={(e) => updateCrop(index, { sowing_period: e.target.value })} placeholder="June – July" />
            </div>
            <div>
              <Label>Harvest period</Label>
              <Input className="mt-1" value={crop.harvest_period || ''} onChange={(e) => updateCrop(index, { harvest_period: e.target.value })} placeholder="October – November" />
            </div>
            <div>
              <Label>Estimated yield</Label>
              <Input className="mt-1" value={crop.estimated_yield || ''} onChange={(e) => updateCrop(index, { estimated_yield: e.target.value })} placeholder="25 Quintals/Acre" />
            </div>
            <div>
              <Label>Total cultivation area</Label>
              <Input className="mt-1" value={crop.cultivation_area || ''} onChange={(e) => updateCrop(index, { cultivation_area: e.target.value })} placeholder="250 Acres" />
            </div>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addCrop}>
        <Plus className="mr-1.5 h-4 w-4" /> Add crop
      </Button>
    </div>
  );
}
