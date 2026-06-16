import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity } from 'lucide-react';

const activities = [
  { id: 1, text: '₹5,000 donated to Kondapur School', time: '2 min ago', icon: '💛', color: 'text-donation' },
  { id: 2, text: 'New volunteer joined from Hyderabad', time: '8 min ago', icon: '🌱', color: 'text-volunteer' },
  { id: 3, text: '20 trees planted in Nalgonda', time: '15 min ago', icon: '🌳', color: 'text-green-600' },
  { id: 4, text: 'School Library completed in Warangal', time: '31 min ago', icon: '✅', color: 'text-village' },
  { id: 5, text: '₹15,000 donated to Water Conservation Project', time: '1 hr ago', icon: '💧', color: 'text-cyan-600' },
  { id: 6, text: 'New village registered: Rampur, Nalgonda', time: '2 hr ago', icon: '🏘️', color: 'text-village' },
  { id: 7, text: 'Volunteer from Mumbai joined Agriculture team', time: '3 hr ago', icon: '🌾', color: 'text-yellow-600' },
  { id: 8, text: '₹2,500 donated to Women SHG Project', time: '4 hr ago', icon: '👩', color: 'text-pink-600' },
];

export default function LiveActivityFeed() {
  const [visible, setVisible] = useState(activities.slice(0, 4));
  const [idx, setIdx] = useState(4);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(prev => {
        const next = [...prev.slice(1), activities[idx % activities.length]];
        setIdx(i => i + 1);
        return next;
      });
    }, 3000);
    return () => clearInterval(timer);
  }, [idx]);

  return (
    <div className="bg-white rounded-2xl border border-border p-5">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-village" />
        <h3 className="font-semibold text-sm">Live Activity</h3>
        <span className="ml-auto w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      </div>
      <div className="space-y-3 overflow-hidden">
        <AnimatePresence mode="popLayout">
          {visible.map(item => (
            <motion.div key={item.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-3">
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{item.text}</p>
                <p className="text-xs text-muted-foreground">{item.time}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}