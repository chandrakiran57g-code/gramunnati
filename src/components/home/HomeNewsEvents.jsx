import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Newspaper, ArrowUpRight } from 'lucide-react';
import { format } from 'date-fns';

export default function HomeNewsEvents({ news = [], events = [], loading }) {
  if (loading) {
    return (
      <section className="py-12 border-y border-[#D4B896]/40 bg-[#F5E6C8]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-8 animate-pulse">
            <div className="space-y-4">
              <div className="h-6 bg-[#E8DFD0] rounded w-1/3" />
              {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-[#E8DFD0] rounded-lg" />)}
            </div>
            <div className="space-y-4">
              <div className="h-6 bg-[#E8DFD0] rounded w-1/3" />
              {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-[#E8DFD0] rounded-lg" />)}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!news.length && !events.length) return null;

  return (
    <section className="py-12 sm:py-16 border-y border-[#D4B896]/40 bg-[#F5E6C8]/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-10">
          {news.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-heading font-bold text-[#3D2914] text-xl flex items-center gap-2">
                  <Newspaper className="w-5 h-5 text-[#8B4513]" />
                  Taaza khabrein
                </h3>
                <Link to="/news" className="text-[#8B4513] text-sm font-semibold flex items-center gap-1 hover:underline">
                  All news <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="space-y-3">
                {news.slice(0, 3).map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Link
                      to={`/news/${item.slug}`}
                      className="home-news-item group flex gap-4 items-start"
                    >
                      {item.featured_image && (
                        <img
                          src={item.featured_image}
                          alt=""
                          className="w-16 h-16 rounded-md object-cover shrink-0 border border-[#D4B896]/50"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm text-[#3D2914] group-hover:text-[#8B4513] transition-colors line-clamp-2">
                          {item.title}
                        </p>
                        {item.published_at && (
                          <p className="text-xs text-[#5C4033]/55 mt-1">
                            {format(new Date(item.published_at), 'dd MMM yyyy')}
                          </p>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {events.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-heading font-bold text-[#3D2914] text-xl flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#8B4513]" />
                  Aane wale events
                </h3>
                <Link to="/events" className="text-[#8B4513] text-sm font-semibold flex items-center gap-1 hover:underline">
                  All events <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="space-y-3">
                {events.slice(0, 3).map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Link
                      to={`/events/${item.slug}`}
                      className="home-news-item group flex gap-4 items-center"
                    >
                      <div className="home-event-date shrink-0">
                        <span className="text-lg font-bold text-[#8B4513] leading-none">
                          {format(new Date(item.start_date), 'dd')}
                        </span>
                        <span className="text-[10px] uppercase text-[#5C4033]/60">
                          {format(new Date(item.start_date), 'MMM')}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm text-[#3D2914] group-hover:text-[#8B4513] transition-colors line-clamp-1">
                          {item.title}
                        </p>
                        {item.location && (
                          <p className="text-xs text-[#5C4033]/55 mt-0.5 truncate">{item.location}</p>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
