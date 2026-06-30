import { useRef, useState } from 'react';
import { Loader2, Upload, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { galleryService } from '@/api/admin';
import { toast } from 'sonner';

/**
 * Local image or video upload for admin forms (Supabase Storage).
 * Also accepts a pasted image/video URL when storage upload is unavailable.
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

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await galleryService.uploadFile(bucket, file, subPath);
      onChange(url);
      setUrlDraft('');
      toast.success('File uploaded');
    } catch (err) {
      toast.error(err.message || 'Upload failed. Paste an image URL below instead.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const applyUrl = () => {
    const url = urlDraft.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) {
      toast.error('Enter a valid http(s) URL');
      return;
    }
    onChange(url);
    toast.success('Image URL applied');
  };

  const isVideo = previewType === 'video' || accept.includes('video');

  return (
    <div className={className}>
      {label && (
        <Label>
          {label}
          {required && ' *'}
        </Label>
      )}
      {value && (
        <div className="relative mt-2 mb-2 inline-block">
          {isVideo ? (
            <video src={value} controls className="max-h-32 rounded-lg border" />
          ) : (
            <img src={value} alt="" className="h-24 w-36 rounded-lg border object-cover" />
          )}
          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="absolute -right-2 -top-2 h-6 w-6"
            onClick={() => {
              onChange('');
              setUrlDraft('');
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleFile}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
          {uploading ? 'Uploading…' : isVideo ? 'Upload video' : 'Upload image'}
        </Button>
      </div>
      {allowUrl && (
        <div className="mt-2 flex gap-2">
          <Input
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            placeholder="Or paste image URL (https://…)"
            className="text-sm"
          />
          <Button type="button" variant="secondary" size="sm" onClick={applyUrl} disabled={!urlDraft.trim()}>
            Use URL
          </Button>
        </div>
      )}
      {required && !value && (
        <p className="mt-1 text-xs text-muted-foreground">
          Upload a file or paste an image URL before saving.
        </p>
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
