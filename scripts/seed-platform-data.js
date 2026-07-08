/**
 * Seed platform data into Supabase (run once after admin-policies.sql).
 * Usage: node scripts/seed-platform-data.js
 *
 * Skips payment keys (Razorpay/UPI). Idempotent — safe to re-run.
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

function loadEnv() {
  const raw = fs.readFileSync(path.join(root, '.env.local'), 'utf8');
  const url = raw.match(/VITE_SUPABASE_URL=(.+)/)?.[1]?.trim();
  const key = raw.match(/VITE_SUPABASE_ANON_KEY=(.+)/)?.[1]?.trim();
  if (!url || !key) throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local');
  return { url, key };
}

const IMG = {
  village: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
  school: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80',
  project: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
  tree: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80',
  event: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80',
  partner: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&q=80',
};

async function upsertBySlug(sb, table, row, slugField = 'slug') {
  const { data: existing } = await sb.from(table).select('id').eq(slugField, row[slugField]).maybeSingle();
  if (existing?.id) return existing.id;
  const { data, error } = await sb.from(table).insert(row).select('id').single();
  if (error) throw new Error(`${table} insert (${row[slugField]}): ${error.message}`);
  return data.id;
}

async function main() {
  const { url, key } = loadEnv();
  const sb = createClient(url, key);

  const { error: authErr } = await sb.auth.signInWithPassword({
    email: 'test@gmail.com',
    password: 'testadmin123',
  });
  if (authErr) throw new Error(`Admin login failed: ${authErr.message}`);

  console.log('Admin authenticated.\n');

  const stateId = 24; // Telangana
  const { data: mandal } = await sb.from('mandals').select('id, district_id').limit(1).single();
  if (!mandal) throw new Error('No mandals in database — add geo data first');

  const geo = { state_id: stateId, district_id: mandal.district_id, mandal_id: mandal.id };

  // ─── Villages ─────────────────────────────────────────
  const villageDefs = [
    { slug: 'kondapur', village_name: 'Kondapur', short_description: 'Digital classroom and water supply — village on the rise.', cover_image: IMG.village, is_featured: true },
    { slug: 'rajapet', village_name: 'Rajapet', short_description: 'Women SHG and tree plantation bringing greenery back.', cover_image: IMG.tree, is_featured: true },
    { slug: 'rampur', village_name: 'Rampur', short_description: 'First computer lab — children connecting to the digital world.', cover_image: IMG.school, is_featured: true },
  ];

  const villageIds = {};
  for (const v of villageDefs) {
    villageIds[v.slug] = await upsertBySlug(sb, 'villages', { ...v, ...geo, is_active: true });
    console.log('village', v.slug, '→ id', villageIds[v.slug]);
  }

  // ─── Schools ──────────────────────────────────────────
  const schoolDefs = [
    { slug: 'zphs-kondapur', school_name: 'ZPHS Kondapur', village_id: villageIds.kondapur, school_type: 'government', student_count: 320, teacher_count: 12, cover_image: IMG.school, is_featured: true },
    { slug: 'govt-high-rajapet', school_name: 'Govt. High School Rajapet', village_id: villageIds.rajapet, school_type: 'government', student_count: 280, teacher_count: 10, cover_image: IMG.school, is_featured: true },
    { slug: 'model-primary-rampur', school_name: 'Model Primary School Rampur', village_id: villageIds.rampur, school_type: 'model', student_count: 200, teacher_count: 8, cover_image: IMG.school, is_featured: true },
  ];

  const schoolIds = {};
  for (const s of schoolDefs) {
    schoolIds[s.slug] = await upsertBySlug(sb, 'schools', { ...s, is_active: true });
    console.log('school', s.slug, '→ id', schoolIds[s.slug]);
  }

  // ─── Projects ───────────────────────────────────────────
  const projectDefs = [
    { slug: 'water-harvest-kondapur', project_name: 'Water Harvest — Kondapur', project_category_id: 4, village_id: villageIds.kondapur, short_description: 'Rainwater harvesting for farming families.', cover_image: IMG.project, status: 'active', budget_amount: 250000, raised_amount: 180000 },
    { slug: 'tree-plantation-rajapet', project_name: 'Tree Plantation — Rajapet', project_category_id: 3, village_id: villageIds.rajapet, short_description: '10,000 saplings across community land.', cover_image: IMG.tree, status: 'active', budget_amount: 150000, raised_amount: 95000 },
    { slug: 'digital-classroom-rampur', project_name: 'Digital Classroom — Rampur', project_category_id: 2, village_id: villageIds.rampur, school_id: schoolIds['model-primary-rampur'], short_description: 'Smart classroom with tablets and internet.', cover_image: IMG.school, status: 'active', budget_amount: 400000, raised_amount: 320000 },
    { slug: 'agri-support-kondapur', project_name: 'Agriculture Support — Kondapur', project_category_id: 5, village_id: villageIds.kondapur, short_description: 'Seeds, tools, and training for small farmers.', cover_image: IMG.village, status: 'active', budget_amount: 200000, raised_amount: 75000 },
  ];

  const projectIds = {};
  for (const p of projectDefs) {
    projectIds[p.slug] = await upsertBySlug(sb, 'projects', p);
    console.log('project', p.slug, '→ id', projectIds[p.slug]);
  }

  // ─── Team members ─────────────────────────────────────
  const memberDefs = [
    { full_name: 'Rajesh Kumar', team_group_id: 1, designation: 'Founder & Director', email: 'rajesh@cmsr.in', display_order: 1 },
    { full_name: 'Dr. Anitha Rao', team_group_id: 2, designation: 'Advisory Chair', email: 'anitha@cmsr.in', display_order: 1 },
    { full_name: 'Arjun Mehta', team_group_id: 3, designation: 'Technical Lead', email: 'arjun@cmsr.in', display_order: 1 },
    { full_name: 'Suresh Reddy', team_group_id: 4, designation: 'Village Coordinator — Kondapur', mobile: '+91 98765 43210', display_order: 1 },
    { full_name: 'Lakshmi Devi', team_group_id: 5, designation: 'School Coordinator — Rampur', mobile: '+91 98765 43211', display_order: 1 },
  ];

  for (const m of memberDefs) {
    const { data: exists } = await sb.from('team_members').select('id').eq('full_name', m.full_name).eq('team_group_id', m.team_group_id).maybeSingle();
    if (exists?.id) {
      console.log('team member skip', m.full_name);
      continue;
    }
    const { error } = await sb.from('team_members').insert({ ...m, is_active: true });
    if (error) console.warn('team member', m.full_name, error.message);
    else console.log('team member', m.full_name);
  }

  // ─── Partners ─────────────────────────────────────────
  const partnerDefs = [
    { slug: 'green-earth-foundation', name: 'Green Earth Foundation', logo: IMG.partner, partner_type: 'ngo', description: 'Environmental and tree plantation partner.' },
    { slug: 'rural-edu-trust', name: 'Rural Education Trust', logo: IMG.partner, partner_type: 'ngo', description: 'School infrastructure and digital learning.' },
    { slug: 'water-for-all', name: 'Water For All Initiative', logo: IMG.partner, partner_type: 'company', description: 'Water conservation and harvesting projects.' },
  ];

  for (const p of partnerDefs) {
    await upsertBySlug(sb, 'partners', { ...p, is_active: true });
    console.log('partner', p.slug);
  }

  // ─── Beneficiaries ────────────────────────────────────
  const beneficiaryDefs = [
    { slug: 'kondapur-farmers', name: 'Kondapur Farmer Cooperative', beneficiary_type: 'village', village_id: villageIds.kondapur, description: '120 farming families benefiting from water projects.' },
    { slug: 'rampur-students', name: 'Rampur School Children', beneficiary_type: 'school', school_id: schoolIds['model-primary-rampur'], description: '200 students with new digital classroom access.' },
    { slug: 'rajapet-women-shg', name: 'Rajapet Women SHG', beneficiary_type: 'village', village_id: villageIds.rajapet, description: '45 women entrepreneurs in self-help groups.' },
  ];

  for (const b of beneficiaryDefs) {
    await upsertBySlug(sb, 'beneficiaries', { ...b, is_active: true });
    console.log('beneficiary', b.slug);
  }

  // ─── News & Events ────────────────────────────────────
  const newsDefs = [
    { slug: 'cmsr-launch-2026', title: 'CMSR Platform Launch 2026', content: 'CMSR officially launches to connect villages, schools, and donors across rural India.', featured_image: IMG.village, is_published: true, published_at: new Date().toISOString() },
    { slug: '1000-saplings-planted', title: '1,000 Saplings Planted in Rajapet', content: 'Volunteers and villagers planted 1,000 native trees as part of the green belt initiative.', featured_image: IMG.tree, is_published: true, published_at: new Date().toISOString() },
  ];

  for (const n of newsDefs) {
    await upsertBySlug(sb, 'news', n);
    console.log('news', n.slug);
  }

  const eventDefs = [
    { slug: 'volunteer-training-march-2026', title: 'Volunteer Training Camp — March 2026', description: 'Orientation for new village and school coordinators.', location: 'Hyderabad', start_date: '2026-03-15T09:00:00Z', end_date: '2026-03-16T17:00:00Z', featured_image: IMG.event, is_published: true },
    { slug: 'digital-literacy-drive', title: 'Digital Literacy Drive', description: 'Free computer training for rural school teachers.', location: 'Rampur', start_date: '2026-04-01T10:00:00Z', end_date: '2026-04-01T16:00:00Z', featured_image: IMG.school, is_published: true },
  ];

  for (const e of eventDefs) {
    await upsertBySlug(sb, 'events', e);
    console.log('event', e.slug);
  }

  // ─── Success stories ────────────────────────────────────
  const storyDefs = [
    { slug: 'kondapur-water-success', title: 'Kondapur Water Transformation', summary: 'How rainwater harvesting changed farming outcomes.', content: 'After installing harvesting structures, 120 families now have reliable irrigation through dry seasons.', village_id: villageIds.kondapur, featured_image: IMG.project, is_featured: true, published_at: new Date().toISOString() },
    { slug: 'rampur-digital-classroom', title: 'Rampur Digital Classroom Success', summary: 'Students learning coding for the first time.', content: 'The new smart classroom serves 200 students with tablets, projectors, and internet connectivity.', school_id: schoolIds['model-primary-rampur'], featured_image: IMG.school, is_featured: true, published_at: new Date().toISOString() },
  ];

  for (const s of storyDefs) {
    await upsertBySlug(sb, 'success_stories', s);
    console.log('story', s.slug);
  }

  // ─── Testimonials (settings fallback if testimonials RLS blocks) ──
  const testimonialDefs = [
    { id: 't1', name: 'Priya Sharma', message: 'CMSR helped our village get clean water and a digital school. Truly life-changing work.', designation: 'Village Representative', is_featured: true, sort_order: 1 },
    { id: 't2', name: 'Ramesh Goud', message: 'I donated to the tree plantation project and saw the impact within months.', designation: 'Donor', is_featured: true, sort_order: 2 },
    { id: 't3', name: 'Sunita Reddy', message: 'As a teacher, the digital classroom training opened new possibilities for my students.', designation: 'School Teacher', is_featured: true, sort_order: 3 },
  ];

  await sb.from('settings').upsert(
    { key: 'featured_testimonials', value: JSON.stringify(testimonialDefs) },
    { onConflict: 'key' }
  );
  console.log('featured_testimonials saved to settings');

  for (const t of testimonialDefs) {
    const { name, message, designation, is_featured, sort_order } = t;
    const { data: exists } = await sb.from('testimonials').select('id').eq('name', name).maybeSingle();
    if (exists?.id) continue;
    const { error } = await sb.from('testimonials').insert({ name, message, designation, is_featured, sort_order });
    if (error) console.warn('testimonials table (optional — using settings):', name);
    else console.log('testimonial', name);
  }

  // ─── Impact metrics ─────────────────────────────────────
  const { count: vCount } = await sb.from('villages').select('*', { count: 'exact', head: true }).is('deleted_at', null);
  const { count: sCount } = await sb.from('schools').select('*', { count: 'exact', head: true }).is('deleted_at', null);
  const { count: pCount } = await sb.from('projects').select('*', { count: 'exact', head: true }).is('deleted_at', null);

  const metrics = [
    { metricable_type: 'site', metricable_id: 0, metric_name: 'villages', metric_value: vCount || 3 },
    { metricable_type: 'site', metricable_id: 0, metric_name: 'schools', metric_value: sCount || 3 },
    { metricable_type: 'site', metricable_id: 0, metric_name: 'projects', metric_value: pCount || 4 },
    { metricable_type: 'site', metricable_id: 0, metric_name: 'beneficiaries', metric_value: 365 },
    { metricable_type: 'site', metricable_id: 0, metric_name: 'volunteers', metric_value: 77 },
  ];

  for (const m of metrics) {
    const { data: exists } = await sb.from('impact_metrics').select('id').eq('metric_name', m.metric_name).eq('metricable_type', 'site').maybeSingle();
    if (exists?.id) {
      await sb.from('impact_metrics').update({ metric_value: m.metric_value }).eq('id', exists.id);
    } else {
      await sb.from('impact_metrics').insert(m);
    }
    console.log('metric', m.metric_name, '=', m.metric_value);
  }

  // ─── Sample donations (no payment gateway) ─────────────
  const donationDefs = [
    { donor_name: 'Anonymous Donor', amount: 5000, payment_status: 'success', target_type: 'general', message: 'For village development', is_anonymous: true },
    { donor_name: 'Ramesh Goud', amount: 2500, payment_status: 'success', target_type: 'general', email: 'ramesh@example.com' },
    { donor_name: 'Corporate CSR Fund', amount: 50000, payment_status: 'success', target_type: 'general', message: 'Tree plantation support' },
  ];

  for (const d of donationDefs) {
    const { data: exists } = await sb.from('donations').select('id').eq('donor_name', d.donor_name).eq('amount', d.amount).maybeSingle();
    if (exists?.id) continue;
    const { error } = await sb.from('donations').insert({ ...d, currency: 'INR', donated_at: new Date().toISOString() });
    if (error) console.warn('donation', d.donor_name, error.message);
    else console.log('donation', d.donor_name);
  }

  // ─── Activity logs ────────────────────────────────────
  const activityDefs = [
    { loggable_type: 'village', loggable_id: villageIds.kondapur, title: 'Water harvesting structure completed', activity_type: 'update', activity_date: new Date().toISOString() },
    { loggable_type: 'school', loggable_id: schoolIds['model-primary-rampur'], title: 'Digital classroom inaugurated', activity_type: 'milestone', activity_date: new Date().toISOString() },
    { loggable_type: 'site', loggable_id: 0, title: '1,000 trees planted in Rajapet', activity_type: 'event', activity_date: new Date().toISOString() },
  ];

  for (const a of activityDefs) {
    const { data: exists } = await sb.from('activity_logs').select('id').eq('title', a.title).maybeSingle();
    if (exists?.id) continue;
    const { error } = await sb.from('activity_logs').insert(a);
    if (error) console.warn('activity', a.title, error.message);
    else console.log('activity', a.title);
  }

  // ─── Site settings (non-payment) ──────────────────────
  const settingsUpdates = {
    contact_phone: '+91 98765 43210',
    contact_address: 'Hyderabad, Telangana, India',
  };
  for (const [key, value] of Object.entries(settingsUpdates)) {
    await sb.from('settings').upsert({ key, value }, { onConflict: 'key' });
    console.log('setting', key);
  }

  // ─── Gallery collections (ensure in DB) ───────────────
  const { data: gc } = await sb.from('settings').select('value').eq('key', 'gallery_collections').maybeSingle();
  if (!gc?.value) {
    console.log('gallery_collections missing — import via /admin/gallery Sync to database');
  } else {
    console.log('gallery_collections already in DB');
  }

  console.log('\nDone. Payment keys (Razorpay/UPI) were intentionally skipped.');
  console.log('If testimonials failed, run supabase/setup-remaining.sql in Supabase SQL Editor.');
}

main().catch((err) => {
  console.error('\nSeed failed:', err.message);
  process.exit(1);
});
