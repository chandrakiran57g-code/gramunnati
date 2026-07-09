import { cmsService } from '@/api/cms';
import { adminDbMutation, ensureAdminDbAccess } from '@/lib/adminDb';
import { galleryService } from '@/api/admin';
import { supabase } from '@/api/supabaseClient';
import { GALLERY_CATEGORIES } from '@/lib/galleryData';
import { notifyPlatformDataChanged } from '@/lib/platformRefresh';

const SETTINGS_KEY = 'gallery_collections';

export { GALLERY_CATEGORIES };

const VIDEO_MIME = /^video\//;
const IMAGE_MIME = /^image\//;
const VIDEO_EXT = new Set(['mp4', 'webm', 'mov', 'm4v', 'ogv', 'avi', 'mkv']);
const IMAGE_EXT = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp']);

function fileExtension(file) {
  const name = String(file?.name || '');
  const idx = name.lastIndexOf('.');
  return idx >= 0 ? name.slice(idx + 1).toLowerCase() : '';
}

function isVideoFile(file) {
  if (!file) return false;
  if (VIDEO_MIME.test(file.type || '')) return true;
  return VIDEO_EXT.has(fileExtension(file));
}

function isImageFile(file) {
  if (!file) return false;
  if (IMAGE_MIME.test(file.type || '')) return true;
  return IMAGE_EXT.has(fileExtension(file));
}

function parseGalleryValue(raw) {
  if (raw == null || raw === '') return null;
  try {
    let parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (typeof parsed === 'string') parsed = JSON.parse(parsed);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function getGalleryCollections() {
  const raw = await cmsService.getSetting(SETTINGS_KEY);
  return parseGalleryValue(raw) || [];
}

async function persistGalleryCollections(collections) {
  await ensureAdminDbAccess();
  const { error } = await supabase.from('settings').upsert(
    { key: SETTINGS_KEY, value: JSON.stringify(collections) },
    { onConflict: 'key' }
  );
  if (error) throw new Error(`Failed to save gallery: ${error.message}`);
  notifyPlatformDataChanged({ type: 'gallery_collections' });
}

export async function saveGalleryCollections(collections) {
  await adminDbMutation(async () => {
    await persistGalleryCollections(collections);
  });
  return collections;
}

/** Map UI category label → galleries.galleryable_type */
export const CATEGORY_TO_TYPE = {
  Villages: 'village',
  Schools: 'school',
  Projects: 'project',
  Programs: 'program',
  Events: 'event',
};

export function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || `item-${Date.now()}`;
}

export function parseYoutubeEmbedId(url) {
  if (!url) return null;
  const match = String(url).match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match?.[1] ?? null;
}

/** Flat rows from `galleries` table (legacy / entity-linked) */
export async function listGalleryRows({ type, limit = 200 } = {}) {
  return cmsService.listGallery({ type, limit });
}

async function uploadGalleryFile(file, category) {
  const isVideo = isVideoFile(file);
  const isImage = isImageFile(file);
  if (!isVideo && !isImage) {
    throw new Error(
      'Unsupported file type. Use MP4, WebM, or MOV for videos, or JPEG/PNG/WebP for images.'
    );
  }

  const folder = isVideo ? 'videos' : 'images';
  const subPath = `${CATEGORY_TO_TYPE[category] || 'general'}/${folder}`;
  const { url } = await galleryService.uploadFile('gallery', file, subPath);
  return url;
}

/**
 * Add image or video to a gallery collection.
 * Supports: file upload, direct URL, YouTube link (videos).
 */
export async function addGalleryMedia({
  title,
  category,
  mediaType = 'image',
  file,
  mediaUrl,
  youtubeUrl,
  caption,
  collectionId,
}) {
  return adminDbMutation(async () => {
    let url = mediaUrl?.trim() || null;
    let embedId = null;

    if (mediaType === 'video' && youtubeUrl?.trim()) {
      embedId = parseYoutubeEmbedId(youtubeUrl.trim());
      if (!embedId) throw new Error('Invalid YouTube URL — use a link like https://youtube.com/watch?v=...');
    }

    if (file) {
      url = await uploadGalleryFile(file, category);
    }

    if (mediaType === 'image' && !url) {
      throw new Error('Choose an image file or paste an image URL');
    }
    if (mediaType === 'video' && !url && !embedId) {
      throw new Error('Choose a video file, paste a video URL, or paste a YouTube link');
    }

    const collections = await getGalleryCollections();
    const type = CATEGORY_TO_TYPE[category] || 'village';
    const collectionTitle = title || (mediaType === 'video' ? 'Gallery Video' : 'Gallery Photo');
    const resolvedCollectionId = collectionId || slugify(collectionTitle);

    let collection = collections.find((c) => c.id === resolvedCollectionId);
    if (!collection) {
      const coverSrc =
        mediaType === 'image' && url
          ? url
          : 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&q=80';
      collection = {
        id: resolvedCollectionId,
        category: category || 'Villages',
        title: collectionTitle,
        location: '',
        coverSrc,
        media: [],
      };
      collections.push(collection);
    }

    collection.media = collection.media || [];
    const mediaItem = {
      id: `m-${Date.now()}`,
      type: mediaType,
      caption: caption || collectionTitle,
    };

    if (mediaType === 'image') {
      mediaItem.src = url;
      if (!collection.coverSrc || collection.coverSrc.includes('unsplash.com/photo-1492691527719')) {
        collection.coverSrc = url;
      }
    } else if (embedId) {
      mediaItem.embedId = embedId;
    } else {
      mediaItem.src = url;
    }

    collection.media.push(mediaItem);
    await persistGalleryCollections(collections);

    try {
      const row = {
        title: collectionTitle,
        galleryable_type: type,
        galleryable_id: 0,
        sort_order: collections.length,
      };
      if (mediaType === 'video') {
        if (embedId) {
          row.video_url = `youtube:${embedId}`;
        } else if (url) {
          row.video_url = url;
        }
      } else if (url) {
        row.image_path = url;
      }
      const { error: galleryError } = await supabase.from('galleries').insert(row);
      if (galleryError) {
        /* galleries row is optional — settings hold the live gallery data */
      }
    } catch {
      /* ignore */
    }

    return { collections, mediaItem };
  });
}

/** @deprecated use addGalleryMedia */
export async function addGalleryPhoto(opts) {
  return addGalleryMedia({ ...opts, mediaType: 'image', mediaUrl: opts.imageUrl });
}

export async function deleteGalleryCollection(collectionId) {
  const collections = await getGalleryCollections();
  const next = collections.filter((c) => c.id !== collectionId);
  await saveGalleryCollections(next);
  return next;
}

export async function deleteGalleryMedia(collectionId, mediaId) {
  const collections = await getGalleryCollections();
  const next = collections.map((c) => {
    if (c.id !== collectionId) return c;
    const media = (c.media || []).filter((m) => m.id !== mediaId);
    const photos = media.filter((m) => m.type === 'image');
    return {
      ...c,
      media,
      coverSrc: photos[0]?.src || c.coverSrc,
    };
  });
  await saveGalleryCollections(next);
  return next;
}

export async function upsertGalleryCollection(collection) {
  const collections = await getGalleryCollections();
  const idx = collections.findIndex((c) => c.id === collection.id);
  if (idx >= 0) collections[idx] = collection;
  else collections.push(collection);
  await saveGalleryCollections(collections);
  return collections;
}
