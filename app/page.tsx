import Hero from "@/components/sections/Hero";
import Tomos from "@/components/sections/Tomos";
import Quote from "@/components/sections/Quote";
import Cuentos from "@/components/sections/Cuentos";
import Stats from "@/components/sections/Stats";
import Social from "@/components/sections/Social";
import Pricing from "@/components/sections/Pricing";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <Tomos />
      <Quote />
      <Cuentos />
      <Stats />
      <Social />
      <Pricing />
      <Footer />
    </main>
  );
}
