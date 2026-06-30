import { PlusIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LogoCloud({ logos = [], className, ...props }) {
  if (!logos.length) {
    return (
      <p className="py-12 text-center text-muted-foreground">Partner organisations will appear here.</p>
    );
  }

  return (
    <div
      className={cn('relative grid grid-cols-2 border-x md:grid-cols-4', className)}
      {...props}
    >
      <div className="pointer-events-none absolute -top-px left-1/2 w-screen -translate-x-1/2 border-t" />
      {logos.map((logo, index) => (
        <LogoCard
          key={logo.id || logo.name || index}
          className={cn(
            'relative border-b bg-background',
            index % 4 !== 3 && 'md:border-r',
            index % 2 === 0 && 'border-r',
            index >= logos.length - (logos.length % 4 || 4) && 'md:border-b-0',
            index % 2 === 0 && index % 4 === 0 && 'md:bg-secondary/30',
          )}
          logo={logo}
        >
          {index % 3 === 0 && (
            <PlusIcon className="absolute -bottom-[12.5px] -right-[12.5px] z-10 size-6 text-border" strokeWidth={1} />
          )}
        </LogoCard>
      ))}
      <div className="pointer-events-none absolute -bottom-px left-1/2 w-screen -translate-x-1/2 border-b" />
    </div>
  );
}

function LogoCard({ logo, className, children, ...props }) {
  const href = logo.website || logo.url;
  const inner = logo.src ? (
    <img
      alt={logo.alt || logo.name}
      className="pointer-events-none h-4 select-none md:h-5 dark:brightness-0 dark:invert"
      src={logo.src}
    />
  ) : (
    <span className="pointer-events-none text-center text-sm font-semibold text-foreground">{logo.name}</span>
  );

  const content = (
    <>
      {inner}
      {children}
    </>
  );

  if (href) {
    return (
      <a
        href={href.startsWith('http') ? href : `https://${href}`}
        target="_blank"
        rel="noopener noreferrer"
        className={cn('flex items-center justify-center px-4 py-8 transition-colors hover:bg-muted/40 md:p-8', className)}
        {...props}
      >
        {content}
      </a>
    );
  }

  return (
    <div className={cn('flex items-center justify-center px-4 py-8 md:p-8', className)} {...props}>
      {content}
    </div>
  );
}
