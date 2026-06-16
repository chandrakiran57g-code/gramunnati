import { useState } from 'react';
import { motion } from 'framer-motion';
import { Image, Upload, Grid3X3, List, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const GALLERY_CATS = ['Village Gallery','School Gallery','Project Gallery','Program Gallery','Event Gallery'];

export default function AdminGallery() {
  const [selectedCat, setSelectedCat] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-8 px-6"><div className="max-w-7xl mx-auto flex items-center justify-between">
        <div><h1 className="font-heading text-3xl font-bold flex items-center gap-3"><Image className="w-8 h-8"/>Gallery Manager</h1><p className="text-white/70 text-sm mt-1">Manage media across all modules</p></div>
        <Button className="bg-white text-purple-600 hover:bg-white/90"><Upload className="w-4 h-4 mr-2"/>Upload Media</Button>
      </div></div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-4 mb-6 items-center">
          <div className="flex gap-1 bg-muted rounded-xl p-1 flex-1 min-w-[300px]">
            <button onClick={()=>setSelectedCat('all')} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${selectedCat==='all'?'bg-purple-600 text-white':'text-muted-foreground'}`}>All</button>
            {GALLERY_CATS.map(c=><button key={c} onClick={()=>setSelectedCat(c)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${selectedCat===c?'bg-purple-600 text-white':'text-muted-foreground'}`}>{c.replace(' Gallery','')}</button>)}
          </div>
          <div className="flex gap-1 border border-border rounded-lg p-0.5">
            <button onClick={()=>setViewMode('grid')} className={`p-1.5 rounded ${viewMode==='grid'?'bg-muted':''}`}><Grid3X3 className="w-4 h-4"/></button>
            <button onClick={()=>setViewMode('list')} className={`p-1.5 rounded ${viewMode==='list'?'bg-muted':''}`}><List className="w-4 h-4"/></button>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl border border-border p-12 text-center">
          <div className="w-20 h-20 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Image className="w-10 h-10 text-purple-300"/>
          </div>
          <h3 className="font-heading text-xl font-bold mb-2">Gallery Coming Soon</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
            The gallery module will support drag-and-drop uploads, automatic categorization by village/school/project, 
            thumbnail generation, and bulk operations.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto">
            {GALLERY_CATS.slice(0,4).map(c=>(
              <div key={c} className="bg-muted/50 rounded-xl p-3 text-center">
                <div className="text-2xl mb-1">📷</div>
                <div className="text-xs text-muted-foreground">{c.replace(' Gallery','')}</div>
                <div className="text-lg font-bold text-foreground mt-1">0</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
