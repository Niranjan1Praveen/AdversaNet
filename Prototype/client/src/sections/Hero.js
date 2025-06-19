"use client";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { AuroraText } from "@/components/magicui/aurora-text";
import { RainbowButton } from "@/components/magicui/rainbow-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { RegisterLink } from "@kinde-oss/kinde-auth-nextjs";
import { ChevronRight, SparkleIcon } from "lucide-react";

export default function Hero() {
  return (
    <section className="py-20 px-4 overflow-x-clip">
      <div className="container relative mx-auto flex flex-col-reverse md:flex-row items-center justify-center gap-12">
        <div className="w-full md:w-3/4">
          <div className="flex items-center justify-center">
            <div className="group relative mx-auto flex items-center justify-center rounded-full px-4 py-1.5 shadow-[inset_0_-8px_10px_#8fdfff1f] transition-shadow duration-500 ease-out hover:shadow-[inset_0_-5px_10px_#8fdfff3f] ">
              🎉 <hr className="mx-2 h-4 w-px shrink-0 bg-neutral-500" />
              <AnimatedGradientText
                className="text-sm font-medium"
                speed={1}
                colorFrom="#4ade80"
                colorTo="#06b6d4"
              >
                Introducing AdversaNet
              </AnimatedGradientText>
              <ChevronRight
                className="ml-1 size-4 stroke-neutral-500 transition-transform
 duration-300 ease-in-out group-hover:translate-x-0.5"
              />
            </div>
          </div>

          <h1 className="text-4xl md:text-7xl font-medium mt-6 leading-tight text-center">
            Understand and Visualize <br /> How AI Can Be{" "}
            <AuroraText colors={["#4ade80", "#30f6d5", "#5EF7BA", "#06b6d4"]}>
              Fooled?
            </AuroraText>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mt-8 leading-relaxed text-center">
            Our interactive dashboard helps you explore adversarial attacks on
            image classifiers. Upload images, apply attacks like FGSM and PGD,
            and see how even small changes can trick powerful AI models—making
            it easier to learn, teach, and build more secure systems.
          </p>
          <div className="flex mt-8 md:max-w-lg mx-auto items-center justify-center gap-5">
            <RainbowButton variant={"outline"} className="rounded-full text-black p-6">Read Docs</RainbowButton>
            <RainbowButton className="text-white rounded-full p-6"><a href="#pricing">Get Started Now</a></RainbowButton>
          </div>
        </div>
      </div>
    </section>
  );
}
