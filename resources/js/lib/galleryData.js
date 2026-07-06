export const GALLERY_CATEGORIES = ['All', 'Villages', 'Schools', 'Projects', 'Events'];

export function filterCollections(collections, category) {
  if (category === 'All') return collections;
  return collections.filter((c) => c.category === category);
}

export function getCollectionPhotos(collection) {
  if (!collection?.media) return [];
  return collection.media.filter((m) => m.type === 'image');
}

export function getCollectionVideos(collection) {
  if (!collection?.media) return [];
  return collection.media.filter((m) => m.type === 'video');
}

export function hasVideos(collection) {
  if (!collection?.media) return false;
  return collection.media.some((m) => m.type === 'video');
}
