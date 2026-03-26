import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Become an ETUK Agent | Soreti International Trading',
  description: 'Join Ethiopia\'s leading electric 3-wheeler network. Apply to become an ETUK agent and be part of the sustainable transportation revolution across Ethiopia.',
  keywords: ['ETUK Agent', 'Electric Vehicle Dealer', 'Ethiopia', 'Soreti', 'Business Opportunity', 'Electric 3-Wheeler'],
  authors: [{ name: 'Soreti International Trading' }],
  openGraph: {
    title: 'Become an ETUK Agent | Ethiopia\'s #1 Electric 3-Wheeler',
    description: 'Join our network of agents across Ethiopia. Exclusive territories, competitive commissions, full training support. Apply now!',
    url: 'https://etuk.et/become-agent',
    siteName: 'ETUK Electric',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-agent.png',
        width: 1200,
        height: 630,
        alt: 'Become an ETUK Agent - Electric 3-Wheeler Business Opportunity',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Become an ETUK Agent | Ethiopia\'s Electric Revolution',
    description: 'Join our network of agents across Ethiopia. Exclusive territories, competitive commissions. Apply now!',
    images: ['/og-agent.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function BecomeAgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
