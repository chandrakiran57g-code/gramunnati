import { useLanguage } from '@/i18n/LanguageContext';

/** CMSR subtitle under the logo — two lines; "Responsibility" highlighted on line 2. */
export default function BrandTagline({ className = '', stacked = true }) {
  const { t } = useLanguage();

  if (stacked) {
    return (
      <div className={`leading-tight ${className}`}>
        <div className="text-muted-foreground whitespace-normal">{t('brand.taglinePrefix')}</div>
        <div className="text-primary font-semibold whitespace-normal">{t('brand.taglineHighlight')}</div>
      </div>
    );
  }

  return (
    <div className={`leading-tight whitespace-normal ${className}`}>
      <span className="text-muted-foreground">{t('brand.taglinePrefix')}</span>{' '}
      <span className="text-primary font-semibold">{t('brand.taglineHighlight')}</span>
    </div>
  );
}
