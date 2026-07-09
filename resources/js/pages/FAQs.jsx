import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, Loader2 } from 'lucide-react';
import { cmsService } from '@/api/cms';
import { useLanguage } from '@/i18n/LanguageContext';
import { localize } from '@/lib/localizedContent';
import RichContent from '@/components/shared/RichContent';

export default function FAQs() {
  const [open, setOpen] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { lang, t } = useLanguage();

  useEffect(() => {
    cmsService.listFaqs()
      .then((rows) => setFaqs((rows || []).filter((f) => f.is_active !== false)))
      .catch(() => setFaqs([]))
      .finally(() => setLoading(false));
  }, []);

  const items = faqs;

  return (
    <div className="min-h-screen bg-background">
      <div className="brand-gradient py-16 px-4">
        <div className="max-w-4xl mx-auto text-center text-white">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-70" />
            <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-4">{t('nav.faqs')}</h1>
            <p className="text-white/80 max-w-xl mx-auto">Everything you need to know about the CMSR platform</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : items.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">FAQs will appear here once added in the admin panel.</p>
        ) : (
          <div className="space-y-3">
            {items.map((faq, i) => {
              const q = localize(faq, 'question', lang);
              const a = localize(faq, 'answer', lang);
              return (
                <motion.div key={faq.id || i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                  className="bg-white rounded-2xl border border-border overflow-hidden">
                  <button type="button" onClick={() => setOpen(open === i ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-primary/3 transition-colors">
                    <span className="font-semibold text-sm pr-4">{q}</span>
                    <ChevronDown className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {open === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                        <div className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border/50 pt-4">
                          <RichContent content={a} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="mt-12 text-center bg-primary/5 rounded-2xl p-8 border border-primary/10">
          <h3 className="font-heading text-xl font-bold mb-2">Still have questions?</h3>
          <p className="text-muted-foreground text-sm mb-4">Our team is happy to help. Reach out to us directly.</p>
          <a href="/contact" className="inline-block bg-primary text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-brown-800 transition-colors">Contact Us</a>
        </div>
      </div>
    </div>
  );
}
