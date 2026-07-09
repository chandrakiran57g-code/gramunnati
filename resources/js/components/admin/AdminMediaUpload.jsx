import { useRef, useState, useEffect } from 'react';
import { Loader2, Upload, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { galleryService } from '@/api/admin';
import { parseYoutubeEmbedId } from '@/api/gallery';
import { toast } from 'sonner';

function isYoutubeUrl(url) {
  return Boolean(parseYoutubeEmbedId(url));
}

function youtubeThumb(id) {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

/**
 * Admin image/video upload via Laravel /api/upload.
 * Supports pasted URLs and YouTube links for videos.
 */
export default function AdminMediaUpload({
  label,
  value = '',
  onChange,
  accept = 'image/*',
  bucket = 'gallery',
  subPath = 'admin',
  previewType = 'image',
  className = '',
  required = false,
  allowUrl = true,
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [urlDraft, setUrlDraft] = useState('');
  const [localPreview, setLocalPreview] = useState('');
  const [showUrlField, setShowUrlField] = useState(false);

  useEffect(() => {
    return () => {
      if (localPreview.startsWith('blob:')) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  const isVideo = previewType === 'video' || accept.includes('video');
  const ytId = isVideo ? parseYoutubeEmbedId(value) : null;
  const previewSrc = localPreview || (ytId ? youtubeThumb(ytId) : value);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (localPreview.startsWith('blob:')) URL.revokeObjectURL(localPreview);
    setLocalPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const { url } = await galleryService.uploadFile(bucket, file, subPath);
      onChange(url);
      setUrlDraft('');
      setLocalPreview('');
      toast.success('File uploaded');
    } catch (err) {
      toast.error(err.message || 'Upload failed. Paste a URL below instead.');
      if (allowUrl) setShowUrlField(true);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const applyUrl = () => {
    const url = urlDraft.trim();
    if (!url) return;
    if (isVideo && isYoutubeUrl(url)) {
      onChange(url);
      setUrlDraft('');
      toast.success('YouTube link applied');
      return;
    }
    if (!/^https?:\/\//i.test(url)) {
      toast.error('Enter a valid http(s) URL or YouTube link');
      return;
    }
    onChange(url);
    setUrlDraft('');
    toast.success(isVideo ? 'Video URL applied' : 'Image URL applied');
  };

  return (
    <div className={className}>
      {label && (
        <Label>
          {label}
          {required && ' *'}
        </Label>
      )}
      {previewSrc && (
        <div className="relative mt-2 mb-2 inline-block">
          {isVideo && !ytId ? (
            <video key={previewSrc} src={previewSrc} controls preload="metadata" className="max-h-40 max-w-xs rounded-lg border" />
          ) : (
            <img src={previewSrc} alt="" className="h-24 w-36 rounded-lg border object-cover" />
          )}
          {ytId && (
            <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white">
              YouTube
            </span>
          )}
          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="absolute -right-2 -top-2 h-6 w-6"
            onClick={() => {
              onChange('');
              setUrlDraft('');
              setLocalPreview('');
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleFile} />
        <Button type="button" size="sm" disabled={uploading} onClick={() => inputRef.current?.click()}>
          {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
          {uploading ? 'Uploading…' : isVideo ? 'Upload video' : 'Upload image'}
        </Button>
        {allowUrl && !showUrlField && (
          <button
            type="button"
            onClick={() => setShowUrlField(true)}
            className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            {isVideo ? 'or use video/YouTube URL' : 'or use image URL'}
          </button>
        )}
      </div>
      {allowUrl && showUrlField && (
        <div className="mt-2 flex gap-2">
          <Input
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            placeholder={isVideo ? 'Paste video URL or YouTube link…' : 'Paste image URL (https://…)'}
            className="text-sm"
          />
          <Button type="button" variant="secondary" size="sm" onClick={applyUrl} disabled={!urlDraft.trim()}>
            Use URL
          </Button>
        </div>
      )}
      {required && !value && (
        <p className="mt-1 text-xs text-muted-foreground">Upload a file or paste a URL before saving.</p>
      )}
    </div>
  );
}

export function AdminImageUpload(props) {
  return <AdminMediaUpload accept="image/*" previewType="image" {...props} />;
}

export function AdminVideoUpload(props) {
  return (
    <AdminMediaUpload
      accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
      previewType="video"
      subPath="videos"
      allowUrl
      {...props}
    />
  );
}
