import { DotPattern } from "@/components/magicui/dot-pattern";
import { FlickeringGrid } from "@/components/magicui/flickering-grid";
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
        <HeroVideo />
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
      {/* <div className="relative h-[300px] w-full flex items-center justify-center overflow-hidden">
        <h3 className="z-0 md:text-6xl text-transparent">AdversaNet</h3>
        <FlickeringGrid
          className="absolute inset-0 z-10 size-full"
          squareSize={4}
          gridGap={6}
          color="#6B7280"
          maxOpacity={0.5}
          flickerChance={0.1}
          />
      </div> */}
    </main>
  );
};

export default Home;
