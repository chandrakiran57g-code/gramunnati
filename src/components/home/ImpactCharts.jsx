import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const stateData = [
  { state: 'Telangana', villages: 42, schools: 67, projects: 28 },
  { state: 'AP', villages: 38, schools: 52, projects: 21 },
  { state: 'Karnataka', villages: 18, schools: 24, projects: 12 },
  { state: 'Tamil Nadu', villages: 14, schools: 19, projects: 8 },
  { state: 'Maharashtra', villages: 11, schools: 15, projects: 6 },
];

const donationDist = [
  { name: 'Village', value: 38, color: '#2D6A4F' },
  { name: 'School', value: 28, color: '#2563EB' },
  { name: 'Project', value: 24, color: '#7C3AED' },
  { name: 'General', value: 10, color: '#F59E0B' },
];

const trendData = [
  { month: 'Jan', amount: 42 },
  { month: 'Feb', amount: 68 },
  { month: 'Mar', amount: 55 },
  { month: 'Apr', amount: 89 },
  { month: 'May', amount: 73 },
  { month: 'Jun', amount: 112 },
];

export default function ImpactCharts() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-blue-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <span className="text-xs font-semibold tracking-widest text-school uppercase mb-2 block">📊 Analytics</span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-3">Impact at a Glance</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Real-time visualization of GramUnnati's nationwide development impact</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* State-wise Bar Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-border p-6">
            <h3 className="font-heading font-bold text-lg mb-4">State-wise Development</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={stateData} barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="state" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="villages" fill="#2D6A4F" name="Villages" radius={[3,3,0,0]} />
                <Bar dataKey="schools" fill="#2563EB" name="Schools" radius={[3,3,0,0]} />
                <Bar dataKey="projects" fill="#7C3AED" name="Projects" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-4 justify-center mt-2">
              {[{ color: '#2D6A4F', label: 'Villages' },{ color: '#2563EB', label: 'Schools' },{ color: '#7C3AED', label: 'Projects' }].map(l => (
                <div key={l.label} className="flex items-center gap-1.5 text-xs"><div className="w-3 h-3 rounded-sm" style={{ background: l.color }} />{l.label}</div>
              ))}
            </div>
          </div>

          {/* Donation Pie */}
          <div className="bg-white rounded-2xl border border-border p-6">
            <h3 className="font-heading font-bold text-lg mb-2">Donation Distribution</h3>
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie data={donationDist} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                  {donationDist.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip formatter={(v) => [v + '%']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {donationDist.map(d => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />{d.name}</div>
                  <span className="font-semibold">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Trend */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-border p-6">
            <h3 className="font-heading font-bold text-lg mb-4">Monthly Donation Trend (₹ thousands)</h3>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={v => [`₹${v}k`, 'Donations']} />
                <Line type="monotone" dataKey="amount" stroke="#F59E0B" strokeWidth={2.5} dot={{ fill: '#F59E0B', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}