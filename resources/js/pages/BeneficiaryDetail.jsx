import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Heart, MapPin, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';

const typeLabels = { village: 'Village', school: 'School', farmer: 'Farmer', student: 'Student', women_shg: 'Women SHG', youth_group: 'Youth Group', artisan: 'Artisan', other: 'Other' };

export default function BeneficiaryDetail() {
  const { slug } = useParams();
  const [beneficiary, setBeneficiary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    base44.entities.Beneficiary.filter({ slug, is_active: true }, undefined, 1)
      .then(r => setBeneficiary(r[0] || null))
      .catch(() => {}).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 animate-pulse space-y-6">
        <div className="h-8 bg-muted rounded w-1/3" />
        <div className="h-64 bg-muted rounded-2xl" />
      </div>
    </div>
  );

  if (!beneficiary) return (
    <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
      <div className="text-center"><h2 className="text-2xl font-bold mb-2">Beneficiary Not Found</h2>
        <Link to="/beneficiaries"><Button variant="outline">Back to Beneficiaries</Button></Link></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <HeroScrollSection size="page">
        <section className="hero-gradient py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <Link to="/beneficiaries" className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Beneficiaries
            </Link>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="font-heading text-3xl sm:text-4xl font-bold text-white mb-3">{beneficiary.name}</motion.h1>
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="bg-white/20 text-white border-white/20">{typeLabels[beneficiary.beneficiary_type] || beneficiary.beneficiary_type}</Badge>
              {[beneficiary.village_name, beneficiary.district, beneficiary.state].filter(Boolean).length > 0 && (
                <span className="text-white/70 text-sm flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {[beneficiary.village_name, beneficiary.district, beneficiary.state].filter(Boolean).join(', ')}
                </span>
              )}
            </div>
          </div>
        </section>
      </HeroScrollSection>

      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {beneficiary.image && (
            <div className="rounded-2xl overflow-hidden mb-8 h-64 sm:h-96">
              <img src={beneficiary.image} alt={beneficiary.name} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="bg-white rounded-2xl border border-border p-8">
            {beneficiary.description && (
              <div className="mb-8">
                <h2 className="font-heading text-xl font-bold mb-3">About</h2>
                <p className="text-muted-foreground leading-relaxed">{beneficiary.description}</p>
              </div>
            )}
            {beneficiary.impact_details && (
              <div>
                <h2 className="font-heading text-xl font-bold mb-3 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-donation" /> Impact Story
                </h2>
                <p className="text-muted-foreground leading-relaxed">{beneficiary.impact_details}</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}