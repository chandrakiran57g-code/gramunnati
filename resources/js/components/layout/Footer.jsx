import { Link } from 'react-router-dom';
import { Heart, MapPin, Phone, Mail } from 'lucide-react';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import BrandTagline from '@/components/brand/BrandTagline';

const LOGO_URL = "https://media.base44.com/images/public/user_6a19a4df98ac03e9b75a9132/71b2ecb8f_Screenshot2026-06-10200544.png";

export default function Footer() {
  return (
    <footer className="bg-brown-900 text-cream-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img src={LOGO_URL} alt="CMSR" className="h-12 w-12 object-contain rounded-full bg-white/10 p-1" />
              <div>
                <div className="font-heading font-bold text-xl text-white">CMSR</div>
                <BrandTagline className="text-xs text-brown-400 [&_span:first-child]:text-brown-400 [&_span:last-child]:text-primary" />
              </div>
            </div>
            <p className="text-sm text-brown-400 leading-relaxed mb-4">
              "Our Village – Our Responsibility – Our Development"
            </p>
            <p className="text-xs text-brown-400 italic">
              "మన గ్రామం – మన బాధ్యత – మన అభివృద్ధి"
            </p>
            <div className="flex gap-3 mt-5">
              {[
              { IconComp: Facebook, label: 'Facebook' },
              { IconComp: Twitter, label: 'Twitter' },
              { IconComp: Instagram, label: 'Instagram' },
              { IconComp: Youtube, label: 'YouTube' },
            ].map(({ IconComp, label }) => (
                <a key={label} href="#" aria-label={label} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors">
                  <IconComp className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Site Links */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: 'Villages', path: '/villages' },
                { label: 'Schools', path: '/schools' },
                { label: 'Projects', path: '/projects' },
                { label: 'Programs', path: '/programs' },
                { label: 'Impact Dashboard', path: '/impact' },
                { label: 'Gallery', path: '/gallery' },
                { label: 'Success Stories', path: '/stories' },
                { label: 'News', path: '/news' },
                { label: 'Events', path: '/events' },
                { label: 'Compare Villages', path: '/compare' },
              ].map(item => (
                <li key={item.path}>
                  <Link to={item.path} className="hover:text-cream-100 transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Get Involved */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Get Involved</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: 'Donate Now', path: '/donate' },
                { label: 'Become a Volunteer', path: '/volunteer' },
                { label: 'Compare Villages', path: '/compare' },
                { label: 'Member Dashboard', path: '/dashboard' },
                { label: 'My Villages', path: '/my-villages' },
                { label: 'My Schools', path: '/my-schools' },
                { label: 'My Donations', path: '/my-donations' },
                { label: 'About Us', path: '/about' },
                { label: 'Vision & Mission', path: '/vision' },
                { label: 'Our Team', path: '/our-team' },
                { label: 'Contact Us', path: '/contact' },
                { label: 'FAQs', path: '/faqs' },
              ].map(item => (
                <li key={item.path}>
                  <Link to={item.path} className="hover:text-cream-100 transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-cream-200 mt-0.5 flex-shrink-0" />
                <span className="text-brown-400">India — Nationwide Coverage</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-cream-200 flex-shrink-0" />
                <a href="mailto:contact@CMSR.in" className="hover:text-white transition-colors">contact@CMSR.in</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-cream-200 flex-shrink-0" />
                <a href="tel:+919999999999" className="hover:text-white transition-colors">+91 99999 99999</a>
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
          <p>© {new Date().getFullYear()} CMSR — Village Development & School Empowerment Platform. All rights reserved.</p>
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