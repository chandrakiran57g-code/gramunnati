import fs from 'fs';
import path from 'path';

const root = 'resources/js';

/** Symbols that must be imported when used (not auto-global). */
const symbols = [
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
  'useNavigate',
  'useParams',
];

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
  ];
  return patterns.some((re) => re.test(src));
}

const issues = [];

for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');

  for (const sym of symbols) {
    if (definesSymbol(src, sym)) continue;

    const useRe = sym.startsWith('use')
      ? new RegExp(`\\b${sym}\\s*\\(`)
      : new RegExp(`<\\s*${sym}\\b|\\b${sym}\\s*\\(`);

    if (!useRe.test(src)) continue;

    const importRe = new RegExp(`import\\s+[^;]*\\b${sym}\\b`);
    if (!importRe.test(src)) {
      issues.push({ file: file.replace(/\\/g, '/'), sym });
    }
  }
}

if (issues.length) {
  console.error('Missing imports detected (fix before build):\n');
  for (const i of issues) {
    console.error(`  ${i.file}: ${i.sym}`);
  }
  console.error(`\n${issues.length} issue(s). Run: node scripts/audit-imports.mjs`);
  process.exit(1);
}

console.log('Import audit passed.');
