import { siteConfig } from '@/config/site';

export function ConstructionTape() {
  return (
    <div
      role="presentation"
      aria-hidden="true"
      className="h-10 w-full border-y-2 border-accent"
      style={{
        backgroundImage: `repeating-linear-gradient(135deg, ${siteConfig.theme.accent} 0 12px, ${siteConfig.theme.bg} 12px 24px)`,
      }}
    />
  );
}
