'use client';

import { useRouter } from 'next/navigation';
import { Badge, Button, Card } from '@/components/ui';

const SLOT_VIDEO_URL = '/media/velvet-big-in-out.mp4';

export function CTAButtons() {
  const router = useRouter();

  return (
    <div className="grid w-full gap-6 md:grid-cols-1">
      <Card className="relative min-h-[280px] overflow-hidden border-accent/60 p-0">
        <video
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          aria-hidden="true"
        >
          <source src={SLOT_VIDEO_URL} type="video/mp4" />
        </video>
        <div className="pointer-events-none absolute inset-0 bg-black/45" aria-hidden="true" />

        <div className="relative z-10 flex h-full min-h-[280px] flex-col items-center justify-center px-6 py-10 text-center">
          <Badge tone="accent">Slots</Badge>
          <h3 className="mt-4 font-display text-3xl font-black uppercase tracking-tight text-text-primary">OnlyPoints Machine</h3>
          <p className="mt-3 max-w-xl text-text-secondary">Spin, win points, and use your balance to keep playing.</p>
          <Button data-testid="cta-get-onlypoints" onClick={() => router.push('/slots')} tone="accent" size="lg" className="mt-8 min-w-[220px]">
            Open Slots
          </Button>
        </div>
      </Card>
    </div>
  );
}
