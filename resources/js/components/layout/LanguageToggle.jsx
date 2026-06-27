import { useLanguage } from '@/i18n/LanguageContext';

export default function LanguageToggle({ className = '' }) {
  const { lang, setLang, t } = useLanguage();

  return (
    <div
      className={`inline-flex items-center rounded-lg border border-border bg-muted/40 p-0.5 ${className}`}
      role="group"
      aria-label={t('lang.switchTo')}
    >
      <button
        type="button"
        onClick={() => setLang('en')}
        className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
          lang === 'en'
            ? 'bg-primary text-white shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        aria-pressed={lang === 'en'}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang('te')}
        className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
          lang === 'te'
            ? 'bg-primary text-white shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        aria-pressed={lang === 'te'}
      >
        TE
      </button>
    </div>
  );
}
