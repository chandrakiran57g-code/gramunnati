import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity } from 'lucide-react';

const FALLBACK = [
  { id: 'f1', text: 'Platform ready — activity feed will update live', time: 'Now', icon: '✨' },
];

export default function LiveActivityFeed({ activities = [], loading }) {
  const items = activities.length > 0 ? activities : FALLBACK;
  const [visible, setVisible] = useState(() => items.slice(0, 4));
  const idxRef = useRef(4);

  useEffect(() => {
    setVisible(items.slice(0, 4));
    idxRef.current = Math.min(4, items.length);
  }, [activities]);

  useEffect(() => {
    if (items.length <= 4) return;

    const timer = setInterval(() => {
      idxRef.current = (idxRef.current + 1) % items.length;
      setVisible((prev) => [...prev.slice(1), items[idxRef.current]]);
    }, 3500);

    return () => clearInterval(timer);
  }, [items]);

  return (
    <div className="home-activity-feed">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-[#8B6914]" />
        <h3 className="font-semibold text-sm text-[#3D2914]">Live Activity</h3>
        <span className="ml-auto flex items-center gap-1.5 text-[10px] text-[#6B8E23] font-medium">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          {loading ? 'Syncing…' : 'Live'}
        </span>
      </div>
      <div className="space-y-3 overflow-hidden min-h-[180px]">
        <AnimatePresence mode="popLayout">
          {visible.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-3"
            >
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-[#3D2914] line-clamp-2">{item.text}</p>
                <p className="text-xs text-[#5C4033]/55">{item.time}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
