import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';

export default function AdminCMS() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.SuccessStory.list('-created_date', 50)
      .then(setStories).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const deleteStory = async (id) => {
    await base44.entities.SuccessStory.delete(id);
    setStories(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      <HeroScrollSection size="compact">
        <div className="py-8 px-6" style={{ background: 'linear-gradient(135deg, #7C3AED, #4f46e5)' }}>
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="font-heading text-3xl font-bold text-white">CMS & Content</h1>
              <p className="text-white/70 text-sm mt-1">Manage stories, programs, and content</p>
            </div>
            <Link to="/administrator"><Button variant="outline" size="sm" className="bg-white/10 border-white/30 text-white hover:bg-white/20">← Dashboard</Button></Link>
          </div>
        </div>
      </HeroScrollSection>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Tabs defaultValue="stories">
          <TabsList className="mb-6 bg-muted rounded-xl p-1">
            <TabsTrigger value="stories" className="rounded-lg">Success Stories</TabsTrigger>
            <TabsTrigger value="programs" className="rounded-lg">Programs</TabsTrigger>
            <TabsTrigger value="faqs" className="rounded-lg">FAQs</TabsTrigger>
          </TabsList>

          <TabsContent value="stories">
            <div className="flex justify-between mb-4">
              <h3 className="font-heading font-bold text-lg">Success Stories</h3>
              <Button size="sm" className="bg-projects text-white border-0"><Plus className="w-4 h-4 mr-1" />Add Story</Button>
            </div>
            {loading ? (
              <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-2xl border border-border h-16 animate-pulse" />)}</div>
            ) : (
              <div className="space-y-3">
                {stories.map((s, i) => (
                  <motion.div key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="bg-white rounded-2xl border border-border p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {s.featured_image && <img src={s.featured_image} alt="" className="w-12 h-12 rounded-xl object-cover" />}
                      <div>
                        <div className="font-semibold text-sm">{s.title}</div>
                        <div className="text-xs text-muted-foreground">{s.village_name || 'General'} • {s.is_featured ? '⭐ Featured' : 'Regular'}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link to="/stories"><button className="p-1.5 rounded-lg hover:bg-school/10 text-muted-foreground hover:text-school transition-colors"><Eye className="w-4 h-4" /></button></Link>
                      <button className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => deleteStory(s.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </motion.div>
                ))}
                {stories.length === 0 && <div className="text-center py-12 text-muted-foreground bg-white rounded-2xl border border-border">No stories yet. Add your first success story!</div>}
              </div>
            )}
          </TabsContent>

          <TabsContent value="programs">
            <div className="bg-white rounded-2xl border border-border p-6">
              <div className="flex justify-between mb-4">
                <h3 className="font-heading font-bold">Programs</h3>
                <Button size="sm" className="bg-projects text-white border-0"><Plus className="w-4 h-4 mr-1" />Add Program</Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {['Village Development','School Development','Tree Plantation','Water Conservation','Agriculture','Women SHGs','Skill Development','Healthcare'].map(prog => (
                  <div key={prog} className="border border-border rounded-xl p-3 text-center text-sm font-medium flex items-center justify-between gap-2">
                    <span className="truncate">{prog}</span>
                    <button className="flex-shrink-0 p-1 hover:bg-muted rounded-lg"><Edit className="w-3 h-3 text-muted-foreground" /></button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="faqs">
            <div className="bg-white rounded-2xl border border-border p-6">
              <div className="flex justify-between mb-4">
                <h3 className="font-heading font-bold">FAQ Management</h3>
                <Button size="sm" className="bg-projects text-white border-0"><Plus className="w-4 h-4 mr-1" />Add FAQ</Button>
              </div>
              <p className="text-sm text-muted-foreground">Manage frequently asked questions. Drag to reorder.</p>
              <div className="mt-4 space-y-2">
                {['What is GramUnnati?','How can I donate?','Is my donation tax deductible?','How do I become a volunteer?'].map((q, i) => (
                  <div key={i} className="flex items-center justify-between bg-muted/30 rounded-xl px-4 py-3">
                    <span className="text-sm">{q}</span>
                    <div className="flex gap-1">
                      <button className="p-1 hover:bg-white rounded-lg transition-colors"><Edit className="w-3.5 h-3.5 text-muted-foreground" /></button>
                      <button className="p-1 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5 text-muted-foreground" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}