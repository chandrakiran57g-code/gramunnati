import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#337ab7', '#d9534f', '#f0ad4e', '#5cb85c', '#9b59b6', '#5bc0de', '#e83e8c', '#8bc34a', '#795548', '#17a2b8'];

function ChartPanel({ title, data, height = 280 }) {
  if (!data?.length) return (
    <div className="bg-white rounded-xl border border-border p-6 text-center text-muted-foreground text-sm">
      <h4 className="font-heading font-bold text-base mb-2 text-foreground block">{title}</h4>
      No data available in database.
    </div>
  );
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
  const children = village.children_count || 0;
  const seniors = village.senior_citizen_count || 0;
  const generalPop = Math.max(0, pop - children - seniors);

  const farmerCount = village.farmer_count || 0;
  const nonFarmerCount = Math.max(0, pop - farmerCount);

  // 1. Gender Demographics (Real DB columns)
  const populationData = pop > 0 ? [
    { name: 'Male', value: male || Math.round(pop / 2) },
    { name: 'Female', value: female || Math.round(pop / 2) },
  ] : [];

  // 2. Age Demographics (Real DB columns)
  const ageData = pop > 0 ? [
    { name: 'Children', value: children },
    { name: 'Senior Citizens', value: seniors },
    { name: 'General Population', value: generalPop },
  ].filter(d => d.value > 0) : [];

  // 3. Farming Status (Real DB columns)
  const occupationData = pop > 0 ? [
    { name: 'Farmers', value: farmerCount },
    { name: 'Other Occupations', value: nonFarmerCount },
  ].filter(d => d.value > 0) : [];

  // 4. Resource Allocation
  const resourceData = [
    { name: 'Trees Planted', value: village.trees_count || 0 },
    { name: 'Water Bodies', value: village.water_bodies_count || 0 },
  ].filter(d => d.value > 0);

  return (
    <div className="grid sm:grid-cols-2 gap-6 mt-8">
      <ChartPanel title="Gender Distribution" data={populationData} />
      <ChartPanel title="Age Group Distribution" data={ageData} />
      <ChartPanel title="Farmer Ratio" data={occupationData} />
      <ChartPanel title="Environmental Assets" data={resourceData} />
    </div>
  );
}
