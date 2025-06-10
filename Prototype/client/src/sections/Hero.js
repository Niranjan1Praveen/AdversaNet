"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import heroDesign from "@/assets/images/heroDesign.png";
import Image from "next/image";
import { RegisterLink } from "@kinde-oss/kinde-auth-nextjs";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="py-24 px-4 overflow-x-clip">
      <div className="container mx-auto flex flex-col-reverse md:flex-row items-center gap-12">
        <div className="w-full md:w-3/4">
          <div className="flex">
            <div className="inline-flex py-1 px-3 text-center bg-gradient-to-r from-[#3EDFA3] via-[#30F6F0] to-[#5EF7BA] rounded-full text-neutral-900 font-semibold">
              Trusted by AI Researchers, Students, and Educators
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-medium mt-6 leading-tight">
            Understand and Visualize How AI Can Be Fooled
          </h1>

          <p className="text-lg md:text-xl text-white/50 mt-8 leading-relaxed">
            Our interactive dashboard helps you explore adversarial attacks on
            image classifiers. Upload images, apply attacks like FGSM and PGD,
            and see how even small changes can trick powerful AI models—making
            it easier to learn, teach, and build more secure systems.
          </p>

          <RegisterLink>
            <Button
              type="submit"
              variant="signup"
              size="sm"
              className="whitespace-nowrap mt-4 rounded-md bg-gradient-to-r from-[#3EDFA3] via-[#30F6F0] to-[#5EF7BA]"
            >
              Get Started
            </Button>
          </RegisterLink>
        </div>
        <div className="w-full md:w-1/2 justify-center hidden md:flex md:justify-end">
          <motion.div className="relative">
            <div className="absolute -inset-2 z-0 rounded-full blur-xl opacity-80 bg-gradient-to-r from-[#3EDFA3] via-[#30F6F0] to-[#5EF7BA]"></div>

            <Image
              // src={heroDesign}
              alt="Hero Design"
              className="relative z-10 rounded-full"
              width={500}
              height={500}
              priority
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
