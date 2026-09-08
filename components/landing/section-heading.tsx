import { Reveal } from '@/components/motion/reveal';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  /** Small uppercase label above the title. */
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'center' | 'left';
  /** Renders light-on-dark, for sections with a dark background. */
  invert?: boolean;
  className?: string;
}

/** Shared section header so every band on the page has identical rhythm and type scale. */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  invert = false,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        align === 'center' ? 'mx-auto max-w-2xl items-center text-center' : 'max-w-2xl items-start text-left',
        className
      )}
    >
      {eyebrow && (
        <Reveal variant="fade">
          <span
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-4 py-1.5 font-mono text-[0.65rem] tracking-[0.25em] uppercase',
              invert
                ? 'border-white/20 bg-white/5 text-white/70'
                : 'border-primary/20 bg-primary/5 text-primary'
            )}
          >
            <span className="h-1 w-1 rounded-full bg-current" />
            {eyebrow}
          </span>
        </Reveal>
      )}

      <Reveal delay={80}>
        <h2
          className={cn(
            'text-3xl font-bold tracking-tight text-balance md:text-4xl lg:text-5xl',
            invert && 'text-white'
          )}
        >
          {title}
        </h2>
      </Reveal>

      {subtitle && (
        <Reveal delay={160}>
          <p
            className={cn(
              'text-base leading-relaxed text-balance md:text-lg',
              invert ? 'text-white/65' : 'text-muted-foreground'
            )}
          >
            {subtitle}
          </p>
        </Reveal>
      )}
    </div>
  );
}
