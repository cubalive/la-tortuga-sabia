"use client";

import dynamic from "next/dynamic";
import LenisProvider from "@/components/effects/LenisProvider";
import Navbar from "@/components/Navbar";
import ScrollProgress from "@/components/ScrollProgress";
import SectionDivider from "@/components/ui/SectionDivider";
import Hero from "@/components/sections/Hero";
import Tomos from "@/components/sections/Tomos";
import Quote from "@/components/sections/Quote";
import Cuentos from "@/components/sections/Cuentos";
import Stats from "@/components/sections/Stats";
import Social from "@/components/sections/Social";
import Pricing from "@/components/sections/Pricing";
import Footer from "@/components/sections/Footer";

const LoadingScreen = dynamic(() => import("@/components/LoadingScreen"), { ssr: false });
const CustomCursor = dynamic(() => import("@/components/CustomCursor"), { ssr: false });
const RippleEffect = dynamic(() => import("@/components/effects/RippleEffect"), { ssr: false });

export default function Home() {
  return (
    <LenisProvider>
      <LoadingScreen />
      <CustomCursor />
      <RippleEffect />
      <Navbar />
      <ScrollProgress />
      <main>
        <Hero />
        <SectionDivider variant="wave" colorFrom="#050d12" colorTo="#050d12" />
        <Tomos />
        <SectionDivider variant="fade" colorFrom="#050d12" colorTo="#050d12" />
        <Quote />
        <SectionDivider variant="wave" colorFrom="#050d12" colorTo="#050d12" flip />
        <Cuentos />
        <SectionDivider variant="fade" colorFrom="#050d12" colorTo="#0a2a1a" />
        <Stats />
        <SectionDivider variant="wave" colorFrom="#0a2a1a" colorTo="#050d12" />
        <Social />
        <SectionDivider variant="fade" colorFrom="#050d12" colorTo="#050d12" />
        <Pricing />
        <SectionDivider variant="wave" colorFrom="#050d12" colorTo="#050d12" flip />
        <Footer />
      </main>
    </LenisProvider>
  );
}
