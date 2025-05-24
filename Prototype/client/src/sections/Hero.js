"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Hero() {

  return (
    <section className="py-24 px-4 flex items-center justify-center overflow-x-clip">
      <div className="container relative">
        <div className="flex justify-center">
          <div className="inline-flex py-1 px-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full text-neutral-950 font-semibold text-center">
            Trusted by AI Researchers, Students, and Educators
          </div>
        </div>

        <h1 className="text-5xl md:text-6xl font-medium text-center mt-6 max-w-6xl mx-auto leading-[1.15]">
          Understand and Visualize How AI Can Be Fooled
        </h1>

        <p className="text-center text-xl text-white/50 mt-8 max-w-6xl mx-auto">
          Our interactive dashboard helps you explore adversarial attacks on
          image classifiers. Upload images, apply attacks like FGSM and PGD, and
          see how even small changes can trick powerful AI models—making it
          easier to learn, teach, and build more secure systems.
        </p>

        <form className="flex border border-white/15 rounded-full p-2 mt-8 md:max-w-lg mx-auto">
          <Input
            type="email"
            placeholder="Enter your email"
            className="border-none px-4 !bg-transparent md:flex-1 w-full"
          />
          <Button
            type="submit"
            variant="signup"
            size="sm"
            className="whitespace-nowrap"
          >
            Sign Up
          </Button>
        </form>
      </div>
    </section>
  );
}
