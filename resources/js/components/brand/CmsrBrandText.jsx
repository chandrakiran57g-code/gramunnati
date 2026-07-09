import { BRAND_LETTER_COLORS, BRAND_NAME } from '@/lib/brand';

/**
 * Renders "CMSR" with per-letter logo colors (C/M/S/R only).
 * Pass `text` to override; non-CMSR names render as plain text.
 */
export default function CmsrBrandText({ text = BRAND_NAME, className = '', as: Tag = 'span' }) {
  const value = String(text || '').trim();
  const upper = value.toUpperCase();

  if (upper !== 'CMSR') {
    return <Tag className={className}>{value}</Tag>;
  }

  return (
    <Tag className={className} aria-label={value}>
      {value.split('').map((char, index) => {
        const letter = char.toUpperCase();
        const color = BRAND_LETTER_COLORS[letter];
        return (
          <span
            key={`${letter}-${index}`}
            style={color ? { color } : undefined}
          >
            {char}
          </span>
        );
      })}
    </Tag>
  );
}
