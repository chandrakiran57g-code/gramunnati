import { Award, Star, Shield } from 'lucide-react';

const badges = {
  bronze: { label: 'Bronze Volunteer', icon: Award, color: 'bg-amber-100 text-amber-700 border-amber-300', requirement: '10 hours' },
  silver: { label: 'Silver Volunteer', icon: Shield, color: 'bg-gray-100 text-gray-600 border-gray-300', requirement: '50 hours' },
  gold: { label: 'Gold Volunteer', icon: Star, color: 'bg-yellow-100 text-yellow-700 border-yellow-400', requirement: '100 hours' },
};

export default function VolunteerBadge({ level = 'bronze', size = 'md' }) {
  const b = badges[level] || badges.bronze;
  const Icon = b.icon;
  const sizeClass = size === 'sm' ? 'px-2 py-1 text-xs gap-1' : 'px-4 py-2 text-sm gap-2';

  return (
    <div className={`inline-flex items-center ${sizeClass} rounded-full border font-semibold ${b.color}`}>
      <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      {b.label}
    </div>
  );
}

export { badges };