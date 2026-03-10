'use client';

export function BrandBanner({ compact = false }: { compact?: boolean }) {
  return (
    <div>
      <p className={`font-bold tracking-[0.28em] text-amber-200/80 ${compact ? 'text-[10px]' : 'text-xs'}`}>ONLYMATT'slut</p>
      <h1 className={`font-black uppercase tracking-wide text-amber-100 ${compact ? 'text-2xl md:text-3xl' : 'text-4xl md:text-5xl'}`}>
        ONLYPOINTS MACHINE
      </h1>
      <p className={`text-zinc-300 ${compact ? 'mt-1 text-xs md:text-sm' : 'mt-2 text-sm md:text-base'}`}>are you slutty enought?</p>
    </div>
  );
}
