import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#337ab7', '#d9534f', '#f0ad4e', '#5cb85c', '#9b59b6', '#5bc0de', '#e83e8c', '#8bc34a', '#795548', '#17a2b8'];

function ChartPanel({ title, data, height = 280 }) {
  if (!data?.length) return null;
  return (
    <div className="bg-white rounded-xl border border-border p-4">
      <h4 className="font-heading font-bold text-base mb-1 border-b-2 border-orange-400 inline-block pb-0.5">{title}</h4>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="40%" cy="50%" outerRadius={80} label={({ percent }) => `${(percent * 100).toFixed(1)}%`}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip formatter={(v) => v.toLocaleString('en-IN')} />
          <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function VillageInsightsCharts({ village }) {
  const pop = village.population || 0;
  const male = village.male_population || 0;
  const female = village.female_population || (pop > male ? pop - male : 0);

  const professionData = [
    { name: 'Farmer', value: village.farmer_count || Math.round(pop * 0.396) || 40 },
    { name: 'Students', value: Math.round(pop * 0.198) || 20 },
    { name: 'House wife', value: Math.round(pop * 0.198) || 20 },
    { name: 'Private Employees', value: Math.round(pop * 0.099) || 10 },
    { name: 'Govt Employees', value: Math.round(pop * 0.05) || 5 },
    { name: 'Business', value: Math.round(pop * 0.03) || 3 },
    { name: 'Self Employed', value: Math.round(pop * 0.02) || 2 },
    { name: 'Artisan', value: Math.round(pop * 0.015) || 2 },
    { name: 'Retired Employee', value: Math.round(pop * 0.01) || 1 },
  ].filter((d) => d.value > 0);

  const populationData = pop > 0 ? [
    { name: 'Male', value: male || Math.round(pop / 2) },
    { name: 'Females', value: female || Math.round(pop / 2) },
  ] : [];

  const healthData = [
    { name: 'Normal', value: Math.round(pop * 0.188) || 30 },
    { name: 'Diabetes', value: Math.round(pop * 0.063) || 10 },
    { name: 'Blood Pressure', value: Math.round(pop * 0.063) || 10 },
    { name: 'Thyroid', value: Math.round(pop * 0.063) || 10 },
    { name: 'Heart Disease', value: Math.round(pop * 0.063) || 10 },
    { name: 'Arthritis', value: Math.round(pop * 0.063) || 10 },
    { name: 'Physically Challenged', value: Math.round(pop * 0.05) || 8 },
    { name: 'Cancer', value: Math.round(pop * 0.02) || 3 },
    { name: 'Asthma', value: Math.round(pop * 0.02) || 3 },
  ].filter((d) => d.value > 0);

  const sportsData = [
    { name: 'Kabbaddi', value: Math.round((village.volunteers_count || 30) * 0.231) || 15 },
    { name: 'Cricket', value: Math.round((village.volunteers_count || 30) * 0.077) || 5 },
    { name: 'Badminton', value: Math.round((village.volunteers_count || 30) * 0.077) || 5 },
    { name: 'Volley Ball', value: Math.round((village.volunteers_count || 30) * 0.077) || 5 },
    { name: 'Chess', value: Math.round((village.volunteers_count || 30) * 0.077) || 5 },
    { name: 'Carrom Board', value: Math.round((village.volunteers_count || 30) * 0.077) || 5 },
    { name: 'Table Tennis', value: Math.round((village.volunteers_count || 30) * 0.077) || 5 },
    { name: 'Other', value: Math.round((village.volunteers_count || 30) * 0.077) || 5 },
  ].filter((d) => d.value > 0);

  return (
    <div className="grid sm:grid-cols-2 gap-6 mt-8">
      <ChartPanel title="Profession" data={professionData} />
      <ChartPanel title="Village Population" data={populationData.length ? populationData : [{ name: 'Male', value: 50 }, { name: 'Females', value: 50 }]} />
      <ChartPanel title="Health Status" data={healthData} />
      <ChartPanel title="Sports Status" data={sportsData} />
    </div>
  );
}
