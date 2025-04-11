'use client';

import Script from 'next/script';
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { pageview } from '@/lib/gtag';

interface AnalyticsProps {
  gaId: string | undefined;
}

export default function Analytics({ gaId }: AnalyticsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (gaId && typeof pageview === 'function') {
      const url = pathname + (searchParams ? searchParams.toString() : '');
      pageview(url);
      console.log(`GA Pageview tracked for: ${url}`);
    } else {
      if (!gaId)
        console.warn('GA Measurement ID not provided to Analytics component.');
    }
  }, [pathname, searchParams, gaId]);

  if (!gaId) {
    return null;
  }

  return (
    <>
      <Script
        strategy='afterInteractive'
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />

      <Script
        id='gtag-init'
        strategy='afterInteractive'
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              page_path: window.location.pathname, // Initial page path
            });
          `,
        }}
      />
    </>
  );
}
