import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  { q: 'What is GramUnnati?', a: 'GramUnnati is a nationwide digital platform connecting villagers, students, donors, volunteers, and organizations to participate in village and school development across India. Our vision is "Our Village – Our Responsibility – Our Development."' },
  { q: 'How can I donate?', a: 'You can donate to a specific village, school, or project by visiting the Donate page. We accept UPI, credit/debit cards, net banking, and bank transfers. All donations receive a digital receipt.' },
  { q: 'Is my donation tax deductible?', a: 'GramUnnati is working towards 80G certification. Currently, donations may not be tax-deductible. We will notify all donors once certification is obtained.' },
  { q: 'How do I become a volunteer?', a: 'Visit the Volunteer page and fill in the registration form. Share your skills, availability, and interests. Our team will match you with relevant projects and communities.' },
  { q: 'How are villages and schools verified?', a: 'Each village and school is verified by our field team before being listed on the platform. Village and school representatives are appointed to manage their profiles and updates.' },
  { q: 'Can I follow a specific village?', a: 'Yes! After creating an account, you can follow specific villages and schools to receive updates about their development, new projects, and achievements.' },
  { q: 'What is a Village Representative?', a: 'A Village Representative is a trusted member from or associated with a village who is given special access to update the village profile, manage needs, upload photos, and post development updates.' },
  { q: 'How is the donated money used?', a: 'Donations are used directly for the specified purpose (village, school, or project). GramUnnati maintains transparency by publishing fund utilization reports on each village and project page.' },
  { q: 'Can NRVs (Non-Resident Villagers) participate?', a: 'Absolutely! NRVs play a crucial role. You can adopt your home village, donate, volunteer remotely, or become a village ambassador. We have special NRV category membership.' },
  { q: 'Is the platform available in Telugu?', a: 'We are working on bilingual support (English + Telugu). Some content is available in Telugu. Full bilingual support is planned for a future release.' },
  { q: 'How do I register my village?', a: 'Contact us through the Contact page or email us at contact@GramUnnati.in. Our team will guide you through the village registration process and appoint a representative.' },
  { q: 'Can schools apply for support?', a: 'Yes. Schools can be registered by their principal or a designated School Representative. Once registered, the school becomes eligible for donations, volunteer support, and project assistance.' },
];

export default function FAQs() {
  const [open, setOpen] = useState(null);

  return (
    <div className="min-h-screen bg-background">
      <div className="village-gradient py-16 px-4">
        <div className="max-w-4xl mx-auto text-center text-white">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-70" />
            <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-white/80 max-w-xl mx-auto">Everything you need to know about the GramUnnati platform</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
              className="bg-white rounded-2xl border border-border overflow-hidden">
              <button onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-village/3 transition-colors">
                <span className="font-semibold text-sm pr-4">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <div className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border/50 pt-4">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center bg-village/5 rounded-2xl p-8 border border-village/10">
          <h3 className="font-heading text-xl font-bold mb-2">Still have questions?</h3>
          <p className="text-muted-foreground text-sm mb-4">Our team is happy to help. Reach out to us directly.</p>
          <a href="/contact" className="inline-block bg-village text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-village-light transition-colors">Contact Us</a>
        </div>
      </div>
    </div>
  );
}