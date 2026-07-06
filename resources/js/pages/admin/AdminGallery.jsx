import { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Image, Video, Upload, Grid3X3, List, Trash2, Loader2, RefreshCw, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';
import { toast } from 'sonner';
import {
  getGalleryCollections,
  addGalleryMedia,
  deleteGalleryCollection,
  GALLERY_CATEGORIES,
} from '@/api/gallery';
import { getCollectionPhotos, getCollectionVideos } from '@/lib/galleryData';

const CATEGORY_OPTIONS = GALLERY_CATEGORIES.filter((c) => c !== 'All');
const NEW_COLLECTION = '__new__';

const emptyForm = {
  mediaType: 'image',
  title: '',
  category: 'Villages',
  collectionId: NEW_COLLECTION,
  mediaUrl: '',
  youtubeUrl: '',
  caption: '',
  file: null,
};

export default function AdminGallery() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState(emptyForm);
  const [filePreview, setFilePreview] = useState('');
  const [showUrlFields, setShowUrlFields] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (filePreview.startsWith('blob:')) URL.revokeObjectURL(filePreview);
    };
  }, [filePreview]);

  const pickFile = (file) => {
    if (filePreview.startsWith('blob:')) URL.revokeObjectURL(filePreview);
    setFilePreview(file ? URL.createObjectURL(file) : '');
    setUploadForm((f) => ({ ...f, file: file || null }));
  };

  const loadGallery = async () => {
    setLoading(true);
    try {
      const data = await getGalleryCollections();
      setCollections(data);
    } catch (err) {
      toast.error(err.message || 'Failed to load gallery');
      setCollections([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGallery();
  }, []);

  const filtered = useMemo(() => {
    if (selectedCat === 'All') return collections;
    return collections.filter((c) => c.category === selectedCat);
  }, [collections, selectedCat]);

  const countsByType = useMemo(() => {
    const counts = { All: collections.length };
    CATEGORY_OPTIONS.forEach((cat) => {
      counts[cat] = collections.filter((c) => c.category === cat).length;
    });
    return counts;
  }, [collections]);

  const totalPhotos = useMemo(
    () => collections.reduce((sum, c) => sum + getCollectionPhotos(c).length, 0),
    [collections]
  );

  const totalVideos = useMemo(
    () => collections.reduce((sum, c) => sum + getCollectionVideos(c).length, 0),
    [collections]
  );

  const collectionOptions = useMemo(
    () => collections.map((c) => ({ id: c.id, label: `${c.title} (${c.category})` })),
    [collections]
  );

  const handleUpload = async (e) => {
    e.preventDefault();
    const isVideo = uploadForm.mediaType === 'video';
    const hasFile = Boolean(uploadForm.file);
    const hasUrl = Boolean(uploadForm.mediaUrl.trim());
    const hasYoutube = Boolean(uploadForm.youtubeUrl.trim());

    if (isVideo) {
      if (!hasFile && !hasUrl && !hasYoutube) {
        toast.error('Choose a video file, paste a video URL, or paste a YouTube link');
        return;
      }
    } else if (!hasFile && !hasUrl) {
      toast.error('Choose an image file or paste an image URL');
      return;
    }

    if (uploadForm.collectionId === NEW_COLLECTION && !uploadForm.title.trim()) {
      toast.error('Enter a title for the new collection');
      return;
    }

    setUploading(true);
    try {
      await addGalleryMedia({
        title: uploadForm.title.trim() || undefined,
        category: uploadForm.category,
        mediaType: uploadForm.mediaType,
        mediaUrl: uploadForm.mediaUrl.trim() || undefined,
        youtubeUrl: uploadForm.youtubeUrl.trim() || undefined,
        file: uploadForm.file || undefined,
        caption: uploadForm.caption || uploadForm.title,
        collectionId: uploadForm.collectionId === NEW_COLLECTION ? undefined : uploadForm.collectionId,
      });
      toast.success(`${isVideo ? 'Video' : 'Photo'} added — visible on public /gallery now`);
      setUploadForm(emptyForm);
      if (filePreview.startsWith('blob:')) URL.revokeObjectURL(filePreview);
      setFilePreview('');
      setShowUrlFields(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await loadGallery();
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteCollection = async (id) => {
    if (!window.confirm('Delete this gallery collection and all its media?')) return;
    try {
      const next = await deleteGalleryCollection(id);
      setCollections(next);
      toast.success('Collection deleted');
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <HeroScrollSection size="compact">
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-8 px-6">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-heading text-3xl font-bold flex items-center gap-3">
                <Image className="w-8 h-8" />
                Gallery Manager
              </h1>
              <p className="text-white/70 text-sm mt-1">
                {collections.length} collections · {totalPhotos} photos · {totalVideos} videos · synced with public /gallery
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20" onClick={loadGallery}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </HeroScrollSection>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {['All', ...CATEGORY_OPTIONS].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCat(cat)}
              className={`rounded-xl border p-3 text-left transition-all ${selectedCat === cat ? 'border-purple-500 bg-purple-50' : 'border-border bg-white hover:border-purple-200'}`}
            >
              <div className="text-xs text-muted-foreground">{cat}</div>
              <div className="text-xl font-bold">{countsByType[cat] ?? 0}</div>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-border p-6 mb-6">
          <h3 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-purple-600" />
            Add photo or video
          </h3>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'image', label: 'Photo', icon: Image },
                { value: 'video', label: 'Video', icon: Video },
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    pickFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                    setUploadForm((f) => ({ ...f, mediaType: value, file: null }));
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                    uploadForm.mediaType === value
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-border hover:border-purple-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label>Add to collection</Label>
                <select
                  value={uploadForm.collectionId}
                  onChange={(e) => setUploadForm((f) => ({ ...f, collectionId: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value={NEW_COLLECTION}>+ New collection</option>
                  {collectionOptions.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>{uploadForm.collectionId === NEW_COLLECTION ? 'Collection title' : 'Title (optional)'}</Label>
                <Input
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm((f) => ({ ...f, title: e.target.value }))}
                  className="mt-1 rounded-xl"
                  placeholder={uploadForm.mediaType === 'video' ? 'Video title' : 'Photo title'}
                />
              </div>
              <div>
                <Label>Category</Label>
                <select
                  value={uploadForm.category}
                  onChange={(e) => setUploadForm((f) => ({ ...f, category: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                >
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Caption (optional)</Label>
                <Input
                  value={uploadForm.caption}
                  onChange={(e) => setUploadForm((f) => ({ ...f, caption: e.target.value }))}
                  className="mt-1 rounded-xl"
                  placeholder="Caption shown in gallery"
                />
              </div>
            </div>

            <div>
              <Label>{uploadForm.mediaType === 'video' ? 'Video file (MP4, WebM, MOV)' : 'Image file'}</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept={uploadForm.mediaType === 'video' ? 'video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov' : 'image/*'}
                className="hidden"
                onChange={(e) => pickFile(e.target.files?.[0])}
              />
              {filePreview ? (
                <div className="relative mt-2 inline-block">
                  {uploadForm.mediaType === 'video' ? (
                    <video src={filePreview} controls className="max-h-48 max-w-sm rounded-xl border" />
                  ) : (
                    <img src={filePreview} alt="Preview" className="max-h-48 rounded-xl border object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      pickFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <div className="mt-1 text-xs text-muted-foreground truncate max-w-sm">{uploadForm.file?.name}</div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 flex w-full max-w-md flex-col items-center gap-2 rounded-xl border-2 border-dashed border-purple-300 bg-purple-50/50 px-6 py-8 text-sm text-purple-700 transition-colors hover:border-purple-500 hover:bg-purple-50"
                >
                  <Upload className="h-6 w-6" />
                  Click to choose {uploadForm.mediaType === 'video' ? 'a video' : 'an image'} from your computer
                </button>
              )}
              {!showUrlFields && (
                <button
                  type="button"
                  onClick={() => setShowUrlFields(true)}
                  className="mt-2 block text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                >
                  {uploadForm.mediaType === 'video' ? 'or paste a video / YouTube URL instead' : 'or paste an image URL instead'}
                </button>
              )}
            </div>

            {showUrlFields && (
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>{uploadForm.mediaType === 'video' ? 'Video URL (optional)' : 'Image URL (optional)'}</Label>
                  <Input
                    value={uploadForm.mediaUrl}
                    onChange={(e) => setUploadForm((f) => ({ ...f, mediaUrl: e.target.value }))}
                    className="mt-1 rounded-xl"
                    placeholder="https://..."
                  />
                </div>
                {uploadForm.mediaType === 'video' && (
                  <div>
                    <Label>YouTube link (optional)</Label>
                    <Input
                      value={uploadForm.youtubeUrl}
                      onChange={(e) => setUploadForm((f) => ({ ...f, youtubeUrl: e.target.value }))}
                      className="mt-1 rounded-xl"
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                )}
              </div>
            )}

            <div>
              <Button type="submit" disabled={uploading} className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl">
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Add {uploadForm.mediaType === 'video' ? 'video' : 'photo'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        <div className="flex justify-end mb-4">
          <div className="flex gap-1 border border-border rounded-lg p-0.5">
            <button type="button" onClick={() => setViewMode('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-muted' : ''}`}><Grid3X3 className="w-4 h-4" /></button>
            <button type="button" onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-muted' : ''}`}><List className="w-4 h-4" /></button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border p-12 text-center text-muted-foreground">
            No gallery collections{selectedCat !== 'All' ? ` in ${selectedCat}` : ''}. Use the form above to add photos or videos.
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((collection, i) => (
              <motion.div key={collection.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }} className="bg-white rounded-2xl border border-border overflow-hidden group">
                <div className="aspect-square bg-muted relative">
                  <img src={collection.coverSrc} alt={collection.title} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleDeleteCollection(collection.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <span className="absolute bottom-2 left-2 text-[10px] font-bold uppercase tracking-wide bg-black/60 text-white px-2 py-0.5 rounded">
                    {collection.category}
                  </span>
                </div>
                <div className="p-3">
                  <div className="font-medium text-sm truncate">{collection.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {getCollectionPhotos(collection).length} photos · {getCollectionVideos(collection).length} videos
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-4 py-3">Cover</th>
                  <th className="text-left px-4 py-3">Title</th>
                  <th className="text-left px-4 py-3">Category</th>
                  <th className="text-left px-4 py-3">Media</th>
                  <th className="text-left px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((collection) => (
                  <tr key={collection.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <img src={collection.coverSrc} alt="" className="w-12 h-12 rounded-lg object-cover" />
                    </td>
                    <td className="px-4 py-3 font-medium">{collection.title}</td>
                    <td className="px-4 py-3">{collection.category}</td>
                    <td className="px-4 py-3">
                      {getCollectionPhotos(collection).length} photos · {getCollectionVideos(collection).length} videos
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="outline" size="sm" className="rounded-lg text-red-600" onClick={() => handleDeleteCollection(collection.id)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
