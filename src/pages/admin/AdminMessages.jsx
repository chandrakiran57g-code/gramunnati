import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { MessageSquare, Mail, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';

const statusColor = { new: 'bg-blue-100 text-blue-700', read: 'bg-yellow-100 text-yellow-700', resolved: 'bg-green-100 text-green-700' };

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    base44.entities.ContactMessage.list('-created_date', 100)
      .then(setMessages).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const markRead = async (msg) => {
    await base44.entities.ContactMessage.update(msg.id, { status: 'read' });
    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: 'read' } : m));
  };

  const markResolved = async (msg) => {
    await base44.entities.ContactMessage.update(msg.id, { status: 'resolved' });
    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: 'resolved' } : m));
  };

  const filtered = messages.filter(m => filter === 'all' || m.status === filter);

  return (
    <div className="min-h-screen bg-background">
      <HeroScrollSection size="compact">
        <div className="school-gradient py-8 px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="font-heading text-3xl font-bold text-white">Contact Messages</h1>
              <p className="text-white/70 text-sm mt-1">{messages.filter(m => m.status === 'new').length} new messages</p>
            </div>
            <Link to="/administrator"><Button variant="outline" size="sm" className="bg-white/10 border-white/30 text-white hover:bg-white/20">← Dashboard</Button></Link>
          </div>
        </div>
      </HeroScrollSection>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-2 mb-6">
          {['all', 'new', 'read', 'resolved'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all capitalize ${filter === f ? 'bg-school text-white' : 'bg-white border border-border text-muted-foreground hover:border-school'}`}>
              {f}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* List */}
          <div className="lg:col-span-1 space-y-3">
            {loading ? [...Array(5)].map((_, i) => <div key={i} className="bg-white rounded-2xl border border-border h-24 animate-pulse" />)
            : filtered.map((msg, i) => (
              <motion.div key={msg.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                onClick={() => setSelected(msg)}
                className={`bg-white rounded-2xl border p-4 cursor-pointer transition-all hover:shadow-md ${selected?.id === msg.id ? 'border-school ring-1 ring-school/20' : 'border-border'}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="font-semibold text-sm">{msg.name}</div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[msg.status] || ''}`}>{msg.status}</span>
                </div>
                <div className="text-xs font-medium text-foreground line-clamp-1 mb-1">{msg.subject}</div>
                <div className="text-xs text-muted-foreground line-clamp-2">{msg.message}</div>
                <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(msg.created_date).toLocaleDateString('en-IN')}</div>
              </motion.div>
            ))}
            {!loading && filtered.length === 0 && <div className="text-center py-10 text-muted-foreground">No messages found</div>}
          </div>

          {/* Detail */}
          <div className="lg:col-span-2">
            {selected ? (
              <div className="bg-white rounded-2xl border border-border p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="font-heading font-bold text-xl">{selected.subject}</h3>
                    <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{selected.email}</span>
                      {selected.mobile && <span>📱 {selected.mobile}</span>}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">From: <span className="font-medium text-foreground">{selected.name}</span></div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor[selected.status] || ''}`}>{selected.status}</span>
                </div>
                <div className="bg-muted/30 rounded-xl p-5 mb-6">
                  <p className="text-sm leading-relaxed">{selected.message}</p>
                </div>
                <div className="flex gap-3">
                  {selected.status === 'new' && (
                    <Button size="sm" variant="outline" onClick={() => markRead(selected)} className="border-school text-school hover:bg-school hover:text-white">
                      Mark as Read
                    </Button>
                  )}
                  {selected.status !== 'resolved' && (
                    <Button size="sm" onClick={() => markResolved(selected)} className="bg-green-600 text-white border-0">
                      <CheckCircle className="w-3.5 h-3.5 mr-1.5" />Mark Resolved
                    </Button>
                  )}
                  <a href={`mailto:${selected.email}`}>
                    <Button size="sm" variant="outline"><Mail className="w-3.5 h-3.5 mr-1.5" />Reply via Email</Button>
                  </a>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-border p-16 text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">Select a message to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}