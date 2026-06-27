import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const FALLBACK_STATE = [
  { state: 'Telangana', villages: 42, schools: 67, projects: 28 },
  { state: 'AP', villages: 38, schools: 52, projects: 21 },
];

const FALLBACK_DONATION = [
  { name: 'Village', value: 38, color: '#8B6914' },
  { name: 'School', value: 28, color: '#6B5344' },
  { name: 'Project', value: 24, color: '#5C4033' },
  { name: 'General', value: 10, color: '#D4A017' },
];

export default function ImpactCharts({ stateStats = [], donationBreakdown = [], loading }) {
  const stateData = stateStats.length > 0 ? stateStats : FALLBACK_STATE;
  const donationDist = donationBreakdown.length > 0 ? donationBreakdown : FALLBACK_DONATION;

  return (
    <section className="py-20 sm:py-24 bg-[#FFF8E7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2
            className="font-heading font-bold text-[#3D2914] mb-3"
            style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', letterSpacing: '-0.025em' }}
          >
            Impact dekhein — data se
          </h2>
          <p className="text-[#5C4033]/70 max-w-xl mx-auto font-body">
            {loading
              ? 'Charts load ho rahe hain…'
              : stateStats.length > 0
                ? 'State-wise breakdown seedhe database se'
                : 'Sample data — database mein entries add karte hi update hoga'}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 home-chart-card p-6">
            <h3 className="font-heading font-bold text-[#3D2914] text-lg mb-4">State-wise development</h3>
            {loading ? (
              <div className="h-[240px] bg-[#E8DFD0]/50 rounded-lg animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={stateData} barSize={14}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#D4B896" opacity={0.4} />
                  <XAxis dataKey="state" tick={{ fontSize: 11, fill: '#5C4033' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#5C4033' }} />
                  <Tooltip />
                  <Bar dataKey="villages" fill="#8B6914" name="Villages" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="schools" fill="#6B5344" name="Schools" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="projects" fill="#5C4033" name="Projects" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="home-chart-card p-6">
            <h3 className="font-heading font-bold text-[#3D2914] text-lg mb-2">Donation split</h3>
            {loading ? (
              <div className="h-[170px] bg-[#E8DFD0]/50 rounded-lg animate-pulse" />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={170}>
                  <PieChart>
                    <Pie data={donationDist} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                      {donationDist.map((d) => (
                        <Cell key={d.name} fill={d.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [`${v}%`]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {donationDist.map((d) => (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                        {d.name}
                      </div>
                      <span className="font-semibold text-[#3D2914]">{d.value}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
