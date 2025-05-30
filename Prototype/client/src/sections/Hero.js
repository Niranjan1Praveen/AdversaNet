"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import heroDesign from "@/assets/images/logo.png";
import Image from "next/image";

export default function Hero() {

  return (
    <section className="py-24 px-4 overflow-x-clip">
      <div className="container mx-auto flex flex-col-reverse md:flex-row items-center gap-12">
        <div className="w-full md:w-3/4">
          <div className="flex justify-center md:justify-start">
            <div className="inline-flex py-1 px-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full text-neutral-950 font-semibold">
              Trusted by AI Researchers, Students, and Educators
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-medium mt-6 leading-relaxed">
            Understand and Visualize How AI Can Be Fooled
          </h1>

          <p className="text-lg md:text-xl text-white/50 mt-8 leading-relaxed">
            Our interactive dashboard helps you explore adversarial attacks on
            image classifiers. Upload images, apply attacks like FGSM and PGD, and
            see how even small changes can trick powerful AI models—making it
            easier to learn, teach, and build more secure systems.
          </p>

          <div className="mt-8 flex justify-center md:justify-between">
            <Button
              variant="signup"
              size="sm"
              className="whitespace-nowrap rounded-full"
            >
              <a href="#signUpOptions">Sign Up</a>
            </Button>
          </div>
        </div>

        <div className="w-full md:w-1/2 flex justify-center md:justify-end">
          <Image
            src={heroDesign}
            alt="Hero"
            width={400}
            height={400}
            priority
          />
        </div>
      </div>
    </section>
  );
}
