import { DotPattern } from "@/components/magicui/dot-pattern";
import { Particles } from "@/components/magicui/particles";
import { cn } from "@/lib/utils";
import Faqs from "@/sections/Faqs";
import Features from "@/sections/Features";
import Footer from "@/sections/Footer";
import Hero from "@/sections/Hero";
import HeroVideo from "@/sections/HeroVideo";
import Introduction from "@/sections/Introduction";
import Navbar from "@/sections/Navbar";
import Pricing from "@/sections/Pricing";

const Home = () => {
  return (
    <main>
      <div className="relative w-full">
        <Navbar />
        <Particles
          className="absolute inset-0 z-0"
          quantity={40}
          ease={90}
          refresh
        />
        <Hero />
        <HeroVideo/>
      </div>
      <Introduction />
      <div className="relative flex size-full w-full flex-col items-center justify-center overflow-hidden">
        <Features />
        <Pricing />
        <Faqs />
        <Particles
          className="absolute inset-0 z-0"
          quantity={40}
          ease={90}
          refresh
        />
      </div>
      <Footer />
    </main>
  );
};

export default Home;
