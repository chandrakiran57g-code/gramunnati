import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PROGRAMS } from '@/lib/programs';

export default function Programs() {
  return (
    <div className="min-h-screen bg-background">
      <div className="brand-gradient py-16 px-4">
        <div className="max-w-7xl mx-auto text-center text-cream-50">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-4">Our Programs</h1>
            <p className="text-cream-100/90 max-w-2xl mx-auto">Eight pillars of rural development creating lasting change across India</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {PROGRAMS.map((prog, i) => (
            <motion.div
              key={prog.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="group bg-white rounded-2xl border border-brown-300 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <Link to={`/programs/${prog.slug}`}>
                <div className={`w-14 h-14 ${prog.lightColor} rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform overflow-hidden`}>
                  {prog.icon}
                </div>
                <h3 className={`font-heading font-bold text-lg mb-2 ${prog.textColor}`}>{prog.title}</h3>
              </Link>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{prog.description}</p>

              <div className="space-y-1 mb-4">
                {prog.impact.map((item) => (
                  <div key={item} className={`flex items-center gap-1.5 text-xs font-medium ${prog.textColor}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>

              <div className="border-t border-brown-200 pt-3 mt-3">
                <div className="text-xs text-brown-400 mb-1 font-medium uppercase tracking-wide">Key Activities</div>
                {prog.activities.slice(0, 3).map((a) => (
                  <div key={a} className="text-xs text-muted-foreground py-0.5">• {a}</div>
                ))}
              </div>

              <div className="mt-4 flex flex-col gap-2">
                <Link to={`/programs/${prog.slug}`}>
                  <Button size="sm" variant="outline" className="w-full text-xs border-brown-300 text-foreground">
                    Learn More <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
                <Link to={`/donate?program=${prog.slug}`}>
                  <Button size="sm" className={`w-full ${prog.color} text-white border-0 text-xs hover:opacity-90`}>
                    Support This Program
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center bg-cream-200/80 border border-brown-300 rounded-2xl p-10"
        >
          <h2 className="font-heading text-2xl font-bold text-foreground mb-3">Want to Start a Program in Your Village?</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">Register your village, identify needs, and let our community help you create lasting change.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/donate">
              <Button className="bg-service-agriculture hover:bg-service-agriculture/90 text-white border-0 rounded-full px-8">
                Donate to a Program
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" className="border-brown-600 text-brown-600 hover:bg-brown-600 hover:text-white rounded-full px-8">
                Contact Us <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
