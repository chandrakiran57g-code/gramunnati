import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Building2, Globe, Mail, Phone, Calendar, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';
import { normalizeExternalUrl } from '@/lib/externalUrl';
import RichContent from '@/components/shared/RichContent';

const typeLabels = { ngo: 'NGO', company: 'Company', educational_institution: 'Education', government: 'Government', individual: 'Individual', csr_partner: 'CSR Partner', foundation: 'Foundation' };

export default function PartnerDetail() {
  const { slug } = useParams();
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    base44.entities.Partner.filter({ slug, is_active: true }, undefined, 1)
      .then(r => setPartner(r[0] || null))
      .catch(() => {}).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 animate-pulse space-y-6">
        <div className="h-8 bg-muted rounded w-1/3" />
        <div className="h-48 bg-muted rounded-2xl" />
      </div>
    </div>
  );

  if (!partner) return (
    <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
      <div className="text-center"><h2 className="text-2xl font-bold mb-2">Partner Not Found</h2>
        <Link to="/partners"><Button variant="outline">Back to Partners</Button></Link></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <HeroScrollSection size="page">
        <section className="hero-gradient py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <Link to="/partners" className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Partners
            </Link>
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm overflow-hidden flex-shrink-0 flex items-center justify-center">
                {partner.logo ? <img src={partner.logo} alt={partner.name} className="w-full h-full object-cover" /> : <Building2 className="w-10 h-10 text-white/60" />}
              </div>
              <div>
                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="font-heading text-3xl sm:text-4xl font-bold text-white mb-2">{partner.name}</motion.h1>
                <Badge className="bg-white/20 text-white border-white/20">{typeLabels[partner.partner_type] || partner.partner_type}</Badge>
              </div>
            </div>
          </div>
        </section>
      </HeroScrollSection>

      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl border border-border p-8">
            {partner.description && (
              <div className="mb-8">
                <h2 className="font-heading text-xl font-bold mb-3">About</h2>
                <RichContent content={partner.description} className="text-muted-foreground leading-relaxed" />
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-4">
              {partner.website && (
                <a href={normalizeExternalUrl(partner.website)} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 hover:bg-primary/5 transition-colors">
                  <Globe className="w-5 h-5 text-primary" /> <span className="text-sm font-medium">{partner.website}</span>
                </a>
              )}
              {partner.email && (
                <a href={`mailto:${partner.email}`}
                  className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 hover:bg-primary/5 transition-colors">
                  <Mail className="w-5 h-5 text-primary" /> <span className="text-sm font-medium">{partner.email}</span>
                </a>
              )}
              {partner.mobile && (
                <a href={`tel:${partner.mobile}`}
                  className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 hover:bg-primary/5 transition-colors">
                  <Phone className="w-5 h-5 text-primary" /> <span className="text-sm font-medium">{partner.mobile}</span>
                </a>
              )}
              {partner.partnership_date && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">Partner since {new Date(partner.partnership_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}