import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry',
];

import { useLanguage } from '@/i18n/LanguageContext';

export default function SearchSection() {
  const { t } = useLanguage();
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
    <section className="relative px-4 sm:px-6 pt-8 sm:pt-10 pb-8 bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-4xl mx-auto home-search-panel p-6 sm:p-8"
      >
        <div className="text-center mb-6">
          <h2
            className="font-heading font-bold text-[#3D2914] mb-2"
            style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', letterSpacing: '-0.02em' }}
          >
            {t('home.searchTitle')}
          </h2>
          <p className="text-[#5C4033]/70 text-sm sm:text-base font-body">
            {t('home.searchSubtitle')}
          </p>
        </div>

        <form onSubmit={handleSearch}>
          <div className="flex gap-1.5 mb-3 p-1 bg-muted/60 rounded-xl">
            {['village', 'school', 'project', 'district'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSearchType(type)}
                className={`flex-1 py-2.5 px-3 text-sm font-medium rounded-lg transition-all capitalize ${
                  searchType === type
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/60'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="flex-1 flex items-center gap-2.5 bg-white border border-border rounded-xl px-4 py-3.5 focus-within:ring-2 focus-within:ring-primary/25 focus-within:border-primary/40 transition-all">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder={`${t('home.searchPlaceholder')} ${searchType}...`}
                className="flex-1 outline-none text-sm bg-transparent placeholder:text-muted-foreground"
              />
            </div>

            <div className="relative">
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="appearance-none border border-border rounded-xl px-4 py-3.5 pr-9 text-sm outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40 text-foreground bg-white w-full sm:w-44 h-full"
              >
                <option value="">{t('home.allStates')}</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>

            <Button
              type="submit"
              className="brand-gradient text-white border-0 px-8 rounded-xl font-semibold hover:opacity-90 h-auto py-3.5"
            >
              <Search className="w-4 h-4 mr-2" />
              {t('home.searchBtn')}
            </Button>
          </div>
        </form>
      </motion.div>
    </section>
  );
}
