import { motion } from 'framer-motion';

export default function HomeTrustMarquee({ activities = [], loading }) {
  const items = activities.length > 0
    ? activities
    : [
        { id: '1', icon: '🏘️', text: '600,000+ villages across India' },
        { id: '2', icon: '💛', text: 'Transparent donations — every rupee tracked' },
        { id: '3', icon: '🌱', text: 'Volunteers building rural India' },
        { id: '4', icon: '🏫', text: 'Schools getting digital classrooms' },
        { id: '5', icon: '🌾', text: 'Farmers, families, future — together' },
      ];

  const doubled = [...items, ...items];

  return (
    <div className="home-trust-marquee flex border-y border-[#D4B896]/50 bg-[#3D2914] overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 shrink-0 border-r border-[#D4B896]/30 bg-[#2a1c0f] z-10">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
        <span className="text-[11px] font-semibold text-amber-100/90 uppercase tracking-wider whitespace-nowrap">
          {loading ? 'Live' : 'Live now'}
        </span>
      </div>
      <div className="home-marquee-track flex-1 overflow-hidden py-3">
        <div className="home-marquee-inner flex gap-10 whitespace-nowrap w-max">
          {doubled.map((item, i) => (
            <span key={`${item.id}-${i}`} className="inline-flex items-center gap-2 text-sm text-amber-100/75 font-body">
              <span>{item.icon}</span>
              <span>{item.text}</span>
              <span className="text-amber-100/25">·</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
