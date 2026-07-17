import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminService } from '@/api/admin';
import { MessageSquare, Mail, Clock, CheckCircle, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';
import { toast } from 'sonner';

const statusColor = { new: 'bg-blue-100 text-blue-700', read: 'bg-yellow-100 text-yellow-700', resolved: 'bg-green-100 text-green-700' };

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');
  const [replyOpen, setReplyOpen] = useState(false);
  const [replySubject, setReplySubject] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    adminService.listMessages({ limit: 100 })
      .then(({ data }) => setMessages(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (msg) => {
    try {
      await adminService.updateMessageStatus(msg.id, 'read');
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: 'read' } : m));
    } catch (err) {
      toast.error(err.message || 'Failed to update message');
    }
  };

  const markResolved = async (msg) => {
    try {
      await adminService.updateMessageStatus(msg.id, 'resolved');
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: 'resolved' } : m));
    } catch (err) {
      toast.error(err.message || 'Failed to update message');
    }
  };

  const openReply = (msg) => {
    setReplySubject(msg.subject ? `Re: ${msg.subject.replace(/^Re:\s*/i, '')}` : 'Re: Your message to CMSR');
    setReplyBody('');
    setReplyOpen(true);
  };

  const selectMessage = (msg) => {
    setSelected(msg);
    setReplyOpen(false);
  };

  const sendReply = async () => {
    if (!replySubject.trim() || !replyBody.trim()) {
      toast.error('Subject and message are required.');
      return;
    }
    setSending(true);
    try {
      const res = await adminService.replyToMessage(selected.id, { subject: replySubject.trim(), message: replyBody.trim() });
      const updated = res?.data || { ...selected, status: 'resolved', reply_subject: replySubject, reply_message: replyBody, replied_at: new Date().toISOString() };
      setMessages(prev => prev.map(m => m.id === selected.id ? { ...m, ...updated } : m));
      setSelected(prev => ({ ...prev, ...updated }));
      setReplyOpen(false);
      toast.success(`Reply sent to ${selected.email}`);
    } catch (err) {
      toast.error(err.message || 'Failed to send reply');
    } finally {
      setSending(false);
    }
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
            <Link to="/admin"><Button variant="outline" size="sm" className="bg-white/10 border-white/30 text-white hover:bg-white/20">← Dashboard</Button></Link>
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
                onClick={() => selectMessage(msg)}
                className={`bg-white rounded-2xl border p-4 cursor-pointer transition-all hover:shadow-md ${selected?.id === msg.id ? 'border-school ring-1 ring-school/20' : 'border-border'}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="font-semibold text-sm">{msg.name}</div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[msg.status] || ''}`}>{msg.status}</span>
                </div>
                <div className="text-xs font-medium text-foreground line-clamp-1 mb-1">{msg.subject}</div>
                <div className="text-xs text-muted-foreground line-clamp-2">{msg.message}</div>
                <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(msg.created_at || msg.created_date).toLocaleDateString('en-IN')}</div>
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
                  {selected.email && !replyOpen && (
                    <Button size="sm" variant="outline" onClick={() => openReply(selected)}>
                      <Mail className="w-3.5 h-3.5 mr-1.5" />Reply via Email
                    </Button>
                  )}
                </div>

                {selected.replied_at && !replyOpen && (
                  <div className="mt-6 border-t border-border pt-5">
                    <div className="text-xs font-semibold uppercase tracking-wide text-green-700 mb-2 flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Replied on {new Date(selected.replied_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                      <div className="text-sm font-medium mb-1">{selected.reply_subject}</div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selected.reply_message}</p>
                    </div>
                  </div>
                )}

                {replyOpen && (
                  <div className="mt-6 border-t border-border pt-5 space-y-3">
                    <div className="text-sm font-semibold">Reply to {selected.name} ({selected.email})</div>
                    <input
                      type="text"
                      value={replySubject}
                      onChange={e => setReplySubject(e.target.value)}
                      placeholder="Subject"
                      className="w-full rounded-md border border-input px-3 py-2 text-sm bg-white"
                    />
                    <textarea
                      value={replyBody}
                      onChange={e => setReplyBody(e.target.value)}
                      placeholder="Write your reply…"
                      rows={6}
                      className="w-full rounded-md border border-input px-3 py-2 text-sm bg-white resize-y"
                    />
                    <div className="flex gap-3">
                      <Button size="sm" onClick={sendReply} disabled={sending} className="bg-school text-white border-0">
                        <Send className="w-3.5 h-3.5 mr-1.5" />{sending ? 'Sending…' : 'Send Reply'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setReplyOpen(false)} disabled={sending}>Cancel</Button>
                    </div>
                  </div>
                )}
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