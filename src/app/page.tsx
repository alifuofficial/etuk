'use client';

import dynamic from 'next/dynamic';

const Header = dynamic(() => import('@/components/public/Header'), { ssr: false });
const Hero = dynamic(() => import('@/components/public/Hero'), { ssr: false });
const Partners = dynamic(() => import('@/components/public/Partners'), { ssr: false });
const StorySection = dynamic(() => import('@/components/public/StorySection'), { ssr: false });
const Features = dynamic(() => import('@/components/public/Features'), { ssr: false });
const HowItWorks = dynamic(() => import('@/components/public/HowItWorks'), { ssr: false });
const ProductSpecs = dynamic(() => import('@/components/public/ProductSpecs'), { ssr: false });
const Locations = dynamic(() => import('@/components/public/Locations'), { ssr: false });
const AgentCTA = dynamic(() => import('@/components/public/AgentCTA'), { ssr: false });
const Footer = dynamic(() => import('@/components/public/Footer'), { ssr: false });

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Hero />
      <Partners />
      <StorySection />
      <Features />
      <HowItWorks />
      <ProductSpecs />
      <Locations />
      <AgentCTA />
      <Footer />
    </main>
  );
}
