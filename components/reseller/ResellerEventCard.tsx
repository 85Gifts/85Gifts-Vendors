'use client';

import { useState } from 'react';
import { Copy, Check, ExternalLink, Ticket } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CardSpotlight } from '@/components/ui/card-spotlight';
import { useToast } from '@/components/ui/use-toast';
import type { ResellerEvent } from '@/app/types/reseller';

export function getEventStatusStyle(status: string) {
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
    case 'completed':
      return 'bg-muted text-muted-foreground';
    case 'paused':
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

export default function ResellerEventCard({ event }: { event: ResellerEvent }) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async (text: string, type: 'code' | 'link') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'code') {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      } else {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
      toast({ title: 'Copied!', variant: 'success' });
    } catch {
      toast({ title: 'Copy failed', variant: 'destructive' });
    }
  };

  return (
    <CardSpotlight
      className="p-6 flex flex-col gap-4"
      spotColor="rgba(85, 110, 230, 0.18)"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center rounded-lg bg-primary/10 p-2">
            <Ticket className="w-5 h-5 text-primary" />
          </span>
          <div>
            <h3 className="font-semibold text-foreground">{event.eventName}</h3>
            {event.name && (
              <p className="text-xs text-muted-foreground">{event.name}</p>
            )}
          </div>
        </div>
        <Badge variant="secondary" className={`text-xs capitalize ${getEventStatusStyle(event.status)}`}>
          {event.status}
        </Badge>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Referral Code</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm font-mono text-foreground">
              {event.referralCode}
            </code>
            <button
              onClick={() => copyToClipboard(event.referralCode, 'code')}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted transition-colors"
              title="Copy referral code"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Referral Link</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm font-mono text-foreground truncate">
              {event.resellerLink}
            </code>
            <button
              onClick={() => copyToClipboard(event.resellerLink, 'link')}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted transition-colors"
              title="Copy referral link"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
            <a
              href={event.resellerLink}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted transition-colors"
              title="Open referral link"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </CardSpotlight>
  );
}
