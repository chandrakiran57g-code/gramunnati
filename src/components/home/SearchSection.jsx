import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry'
];

export default function SearchSection() {
  const [searchText, setSearchText] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [searchType, setSearchType] = useState('village');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchText) params.set('q', searchText);
    if (selectedState) params.set('state', selectedState);
    params.set('type', searchType);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <section className="py-24 sm:py-28 bg-gradient-to-r from-village via-village-light to-school relative overflow-hidden">
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            National Search
          </h2>
          <p className="text-white/70 text-base sm:text-lg mb-8 max-w-2xl mx-auto">
            "Our Village – Our Responsibility – Our Development"
          </p>

          <form onSubmit={handleSearch} className="bg-white rounded-2xl p-2 shadow-2xl">
            {/* Type selector */}
            <div className="flex gap-1 mb-2 px-1">
              {['village', 'school', 'project', 'district'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSearchType(type)}
                  className={`flex-1 py-2 px-3 text-sm font-medium rounded-xl transition-all capitalize ${
                    searchType === type
                      ? 'bg-village text-white shadow-sm'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex items-center gap-2 border border-border rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-village/30 focus-within:border-village transition-all">
                <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder={`Search for a ${searchType}...`}
                  className="flex-1 outline-none text-sm bg-transparent placeholder-muted-foreground"
                />
              </div>

              <div className="relative">
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="appearance-none border border-border rounded-xl px-4 py-3 pr-8 text-sm outline-none focus:ring-2 focus:ring-village/30 focus:border-village text-foreground bg-white w-full sm:w-44"
                >
                  <option value="">All States</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>

              <Button type="submit" className="village-gradient text-white border-0 px-8 rounded-xl font-semibold hover:opacity-90">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </form>

          <p className="text-white/50 text-sm mt-4">
            Search across 600,000+ villages, 1.5 million+ schools, and thousands of active projects
          </p>
        </motion.div>
      </div>
    </section>
  );
}