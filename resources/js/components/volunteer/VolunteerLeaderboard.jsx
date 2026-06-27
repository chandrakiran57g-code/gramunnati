import { motion } from 'framer-motion';
import { Trophy, Star, Medal } from 'lucide-react';

const mockLeaders = [
  { rank: 1, name: 'Rajesh Reddy', hours: 320, projects: 12, badge: 'gold' },
  { rank: 2, name: 'Priya Sharma', hours: 245, projects: 9, badge: 'silver' },
  { rank: 3, name: 'Anil Kumar', hours: 198, projects: 7, badge: 'silver' },
  { rank: 4, name: 'Lakshmi Devi', hours: 156, projects: 5, badge: 'bronze' },
  { rank: 5, name: 'Suresh Patil', hours: 134, projects: 6, badge: 'bronze' },
];

const rankIcons = { 1: <Trophy className="w-5 h-5 text-yellow-500" />, 2: <Medal className="w-5 h-5 text-brown-400" />, 3: <Medal className="w-5 h-5 text-amber-700" /> };

export default function VolunteerLeaderboard() {
  return (
    <div className="bg-white rounded-2xl border border-border p-5">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-donation" />
        <h3 className="font-heading font-bold text-lg">Volunteer Leaderboard</h3>
        <span className="ml-auto text-xs text-muted-foreground">This Month</span>
      </div>
      <div className="space-y-3">
        {mockLeaders.map((v, i) => (
          <motion.div key={v.rank} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
            className="flex items-center gap-3">
            <div className="w-7 text-center font-bold text-sm text-muted-foreground">
              {rankIcons[v.rank] || <span>{v.rank}</span>}
            </div>
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xs">
              {v.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{v.name}</div>
              <div className="text-xs text-muted-foreground">{v.hours}h · {v.projects} projects</div>
            </div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              v.badge === 'gold' ? 'bg-yellow-100 text-yellow-700' : v.badge === 'silver' ? 'bg-gray-100 text-gray-600' : 'bg-amber-100 text-amber-700'
            }`}>
              <Star className="w-3 h-3 inline mr-0.5" />{v.hours}h
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}