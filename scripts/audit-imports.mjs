import fs from 'fs';
import path from 'path';

const root = 'resources/js';

/** Always check these high-risk symbols (used across many pages). */
const manualSymbols = [
  'HeroScrollSection',
  'useLocalizedRecord',
  'localize',
  'localizeNested',
  'CmsrBrandText',
  'usePublicSettings',
  'useLanguage',
  'RichContent',
  'BeforeAfterGallery',
  'StructuredContent',
  'safeText',
  'useGeoPickers',
  'useHomeData',
  'AdminPageHeader',
  'AdminMediaUpload',
  'useAuth',
  'normalizeExternalUrl',
  'isExternalUrl',
  'groupGalleryRows',
  'resolveCardCover',
  'slugifyTitle',
];

const exportScanDirs = ['lib', 'hooks', 'components', 'i18n'];

const files = [];

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (/\.(jsx|js|tsx|ts)$/.test(ent.name)) files.push(p);
  }
}

walk(root);

function definesSymbol(src, sym) {
  const patterns = [
    new RegExp(`export\\s+function\\s+${sym}\\b`),
    new RegExp(`export\\s+const\\s+${sym}\\b`),
    new RegExp(`export\\s+default\\s+function\\s+${sym}\\b`),
    new RegExp(`export\\s*\\{[^}]*\\b${sym}\\b`),
    new RegExp(`function\\s+${sym}\\s*\\(`),
    new RegExp(`const\\s+${sym}\\s*=`),
  ];
  return patterns.some((re) => re.test(src));
}

function collectExportedSymbols(file, src) {
  const rel = file.replace(/\\/g, '/');
  const inScanDir = exportScanDirs.some((d) => rel.includes(`/${d}/`) || rel.startsWith(`${d}/`));
  if (!inScanDir) return [];

  const found = new Set();
  for (const match of src.matchAll(/export\s+function\s+(\w+)/g)) found.add(match[1]);
  for (const match of src.matchAll(/export\s+const\s+(\w+)/g)) {
    const name = match[1];
    if (/^[A-Z]/.test(name) || name.startsWith('use')) found.add(name);
  }
  return [...found];
}

const autoSymbols = new Set();
for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  for (const sym of collectExportedSymbols(file, src)) autoSymbols.add(sym);
}

const symbols = [...new Set([...manualSymbols, ...autoSymbols])];

const issues = [];

for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  const rel = file.replace(/\\/g, '/');

  for (const sym of symbols) {
    if (definesSymbol(src, sym)) continue;

    const isHook = sym.startsWith('use') && sym[3] === sym[3]?.toUpperCase();
    const isComponent = /^[A-Z]/.test(sym);
    const useRe = isHook
      ? new RegExp(`\\b${sym}\\s*\\(`)
      : isComponent
        ? new RegExp(`<\\s*${sym}\\b|\\b${sym}\\s*\\(`)
        : new RegExp(`\\b${sym}\\s*\\(`);

    if (!useRe.test(src)) continue;

    const importRe = new RegExp(`import\\s+[^;]*\\b${sym}\\b`);
    if (!importRe.test(src)) {
      issues.push({ file: rel, sym });
    }
  }
}

if (issues.length) {
  console.error('Missing imports detected (fix before build):\n');
  for (const i of issues) {
    console.error(`  ${i.file}: ${i.sym}`);
  }
  console.error(`\n${issues.length} issue(s).`);
  process.exit(1);
}

console.log(`Import audit passed (${symbols.length} symbols checked).`);
