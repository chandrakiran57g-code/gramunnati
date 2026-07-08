export const GALLERY_CATEGORIES = ['All', 'Villages', 'Schools', 'Projects', 'Events'];

export const galleryCollections = [
  {
    id: 'kondapur-village',
    category: 'Villages',
    title: 'Kondapur Village Development',
    location: 'Telangana',
    coverSrc: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
    media: [
      { id: 'k1', type: 'image', src: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80', caption: 'Village landscape overview' },
      { id: 'k2', type: 'image', src: 'https://images.unsplash.com/photo-1519340333755-56e9c1d04579?w=800&q=80', caption: 'Community gathering' },
      { id: 'k3', type: 'image', src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80', caption: 'Water conservation work' },
      { id: 'kv1', type: 'video', embedId: 'dQw4w9WgXcQ', caption: 'CMSR Village Transformation Journey' },
    ],
  },
  {
    id: 'new-school-building',
    category: 'Schools',
    title: 'New School Building',
    location: 'Andhra Pradesh',
    coverSrc: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80',
    media: [
      { id: 's1', type: 'image', src: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80', caption: 'New school building exterior' },
      { id: 's2', type: 'image', src: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80', caption: 'Classroom interior' },
      { id: 'sv1', type: 'video', embedId: 'dQw4w9WgXcQ', caption: 'Digital Classroom Success Story' },
    ],
  },
  {
    id: 'tree-plantation',
    category: 'Projects',
    title: 'Tree Plantation Drive',
    location: 'Karnataka',
    coverSrc: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80',
    media: [
      { id: 'p1', type: 'image', src: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80', caption: 'Volunteers planting saplings' },
      { id: 'p2', type: 'image', src: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=800&q=80', caption: 'Green belt development' },
      { id: 'pv1', type: 'video', embedId: 'dQw4w9WgXcQ', caption: 'Mega Tree Plantation Drive 2026' },
    ],
  },
  {
    id: 'water-conservation',
    category: 'Villages',
    title: 'Water Conservation Project',
    location: 'Maharashtra',
    coverSrc: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
    media: [
      { id: 'w1', type: 'image', src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80', caption: 'Rainwater harvesting structure' },
      { id: 'w2', type: 'image', src: 'https://images.unsplash.com/photo-1509391111720-9e9a4fd3e2cd?w=800&q=80', caption: 'Irrigation channel repair' },
    ],
  },
  {
    id: 'digital-classroom',
    category: 'Schools',
    title: 'Digital Classroom Setup',
    location: 'Tamil Nadu',
    coverSrc: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80',
    media: [
      { id: 'd1', type: 'image', src: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80', caption: 'Smart classroom with tablets' },
      { id: 'd2', type: 'image', src: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80', caption: 'Students using digital tools' },
    ],
  },
  {
    id: 'volunteer-training',
    category: 'Events',
    title: 'Volunteer Training Camp',
    location: 'Delhi',
    coverSrc: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80',
    media: [
      { id: 'e1', type: 'image', src: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80', caption: 'Volunteer orientation session' },
      { id: 'e2', type: 'image', src: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80', caption: 'Team building activities' },
    ],
  },
  {
    id: 'agriculture-development',
    category: 'Projects',
    title: 'Agriculture Development',
    location: 'Punjab',
    coverSrc: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=800&q=80',
    media: [
      { id: 'a1', type: 'image', src: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=800&q=80', caption: 'Farmer training workshop' },
      { id: 'a2', type: 'image', src: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80', caption: 'Organic farming demo plot' },
    ],
  },
  {
    id: 'community-meeting',
    category: 'Villages',
    title: 'Community Meeting',
    location: 'UP',
    coverSrc: 'https://images.unsplash.com/photo-1519340333755-56e9c1d04579?w=800&q=80',
    media: [
      { id: 'c1', type: 'image', src: 'https://images.unsplash.com/photo-1519340333755-56e9c1d04579?w=800&q=80', caption: 'Gram sabha discussion' },
      { id: 'c2', type: 'image', src: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80', caption: 'Women leaders addressing village' },
    ],
  },
  {
    id: 'annual-review',
    category: 'Events',
    title: 'Annual Review Meet',
    location: 'Hyderabad',
    coverSrc: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    media: [
      { id: 'r1', type: 'image', src: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80', caption: 'Annual review presentation' },
      { id: 'r2', type: 'image', src: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80', caption: 'Stakeholder networking' },
    ],
  },
  {
    id: 'library-donation',
    category: 'Schools',
    title: 'Library Books Donation',
    location: 'West Bengal',
    coverSrc: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80',
    media: [
      { id: 'l1', type: 'image', src: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80', caption: 'New library shelves' },
      { id: 'l2', type: 'image', src: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80', caption: 'Students receiving books' },
    ],
  },
  {
    id: 'women-shg',
    category: 'Projects',
    title: 'Women SHG Workshop',
    location: 'Odisha',
    coverSrc: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80',
    media: [
      { id: 'shg1', type: 'image', src: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80', caption: 'SHG skill training session' },
      { id: 'shg2', type: 'image', src: 'https://images.unsplash.com/photo-1519340333755-56e9c1d04579?w=800&q=80', caption: 'Group savings meeting' },
    ],
  },
  {
    id: 'solar-power',
    category: 'Villages',
    title: 'Solar Power Installation',
    location: 'Rajasthan',
    coverSrc: 'https://images.unsplash.com/photo-1509391111720-9e9a4fd3e2cd?w=800&q=80',
    media: [
      { id: 'sol1', type: 'image', src: 'https://images.unsplash.com/photo-1509391111720-9e9a4fd3e2cd?w=800&q=80', caption: 'Solar panels on community hall' },
      { id: 'sol2', type: 'image', src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80', caption: 'Street lighting installation' },
    ],
  },
];

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
