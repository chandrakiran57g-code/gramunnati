import { Link } from 'react-router-dom';
import { Heart, MapPin, Phone, Mail } from 'lucide-react';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import BrandTagline from '@/components/brand/BrandTagline';
import CmsrBrandText from '@/components/brand/CmsrBrandText';
import { usePublicSettings } from '@/hooks/usePublicSettings';
import { normalizeExternalUrl, isExternalUrl } from '@/lib/externalUrl';

const DEFAULT_LOGO_URL = "https://media.base44.com/images/public/user_6a19a4df98ac03e9b75a9132/71b2ecb8f_Screenshot2026-06-10200544.png";

export const DEFAULT_FOOTER_LINKS = {
  platform: [
    { label: 'Villages', path: '/villages' },
    { label: 'Schools', path: '/schools' },
    { label: 'Projects', path: '/projects' },
    { label: 'What We Do', path: '/programs' },
    { label: 'Impact Dashboard', path: '/impact' },
    { label: 'Gallery', path: '/gallery' },
    { label: 'Success Stories', path: '/stories' },
    { label: 'News', path: '/news' },
    { label: 'Events', path: '/events' },
  ],
  involved: [
    { label: 'Donate Now', path: '/donate' },
    { label: 'Become a Volunteer', path: '/volunteer' },
    { label: 'Member List', path: '/members' },
    { label: 'Our Teams', path: '/teams' },
    { label: 'Partner Organizations', path: '/partners' },
    { label: 'Contact Us', path: '/contact' },
    { label: 'FAQs', path: '/faqs' },
  ],
};

function parseFooterLinks(raw) {
  if (!raw) return null;
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (parsed && (Array.isArray(parsed.platform) || Array.isArray(parsed.involved))) {
      return {
        platform: Array.isArray(parsed.platform) ? parsed.platform : [],
        involved: Array.isArray(parsed.involved) ? parsed.involved : [],
      };
    }
  } catch { /* fall back to defaults */ }
  return null;
}

function FooterLinkList({ links }) {
  return (
    <ul className="space-y-2.5 text-sm">
      {links.filter((l) => l.label && l.path).map((item) => (
        <li key={`${item.label}-${item.path}`}>
          {isExternalUrl(item.path) ? (
            <a href={normalizeExternalUrl(item.path)} target="_blank" rel="noopener noreferrer" className="hover:text-cream-100 transition-colors">{item.label}</a>
          ) : (
            <Link to={item.path} className="hover:text-cream-100 transition-colors">{item.label}</Link>
          )}
        </li>
      ))}
    </ul>
  );
}

export default function Footer() {
  const { siteName, contactEmail, contactPhone, address, logoUrl, raw } = usePublicSettings();
  const logo = logoUrl || DEFAULT_LOGO_URL;

  const footerLinks = parseFooterLinks(raw.footer_links) || DEFAULT_FOOTER_LINKS;
  const quoteEn = raw.footer_quote || '"Our Village – Our Responsibility – Our Development"';
  const quoteTe = raw.footer_quote_te || '"మన గ్రామం – మన బాధ్యత – మన అభివృద్ధి"';
  const bottomText = raw.footer_bottom_text
    || `© ${new Date().getFullYear()} ${siteName} — Village Development & School Empowerment Platform. All rights reserved.`;

  const socials = [
    { IconComp: Facebook, label: 'Facebook', url: normalizeExternalUrl(raw.footer_social_facebook) },
    { IconComp: Twitter, label: 'Twitter', url: normalizeExternalUrl(raw.footer_social_twitter) },
    { IconComp: Instagram, label: 'Instagram', url: normalizeExternalUrl(raw.footer_social_instagram) },
    { IconComp: Youtube, label: 'YouTube', url: normalizeExternalUrl(raw.footer_social_youtube) },
  ].filter((s) => s.url);

  return (
    <footer className="bg-brown-900 text-cream-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img src={logo} alt={siteName} className="h-12 w-12 object-contain rounded-full bg-white/10 p-1" />
              <div>
                <CmsrBrandText text={siteName} className="font-heading font-bold text-xl text-white" />
                <BrandTagline className="text-xs text-brown-400 [&_span:first-child]:text-brown-400 [&_span:last-child]:text-primary" />
              </div>
            </div>
            {quoteEn && (
              <p className="text-sm text-brown-400 leading-relaxed mb-4">{quoteEn}</p>
            )}
            {quoteTe && (
              <p className="text-xs text-brown-400 italic">{quoteTe}</p>
            )}
            {socials.length > 0 && (
              <div className="flex gap-3 mt-5">
                {socials.map(({ IconComp, label, url }) => (
                  <a key={label} href={url} target="_blank" rel="noopener noreferrer" aria-label={label} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors">
                    <IconComp className="w-4 h-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Site Links */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Platform</h4>
            <FooterLinkList links={footerLinks.platform} />
          </div>

          {/* Get Involved */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Get Involved</h4>
            <FooterLinkList links={footerLinks.involved} />
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-cream-200 mt-0.5 flex-shrink-0" />
                <span className="text-brown-400">{address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-cream-200 flex-shrink-0" />
                <a href={`mailto:${contactEmail}`} className="hover:text-white transition-colors">{contactEmail}</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-cream-200 flex-shrink-0" />
                <a href={`tel:${String(contactPhone || '').replace(/\s+/g, '')}`} className="hover:text-white transition-colors">{contactPhone}</a>
              </li>
            </ul>
            <div className="mt-6">
              <Link to="/donate"
                className="inline-flex items-center gap-2 px-5 py-2.5 donation-gradient text-white font-semibold text-sm rounded-full hover:opacity-90 transition-opacity"
              >
                <Heart className="w-4 h-4" />
                Donate Now
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brown-400">
          <p>{bottomText}</p>
          <div className="flex items-center gap-1">
            <span>Made with</span>
            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
            <span>for Rural India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
