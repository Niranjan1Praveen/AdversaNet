"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, FlaskConical, BarChart3 } from "lucide-react";
import Link from "next/link";
import AppInfoSlider from "@/components/dashboard/AppInfoSlider";
import { docs } from "@/assets/data/docs";
const Homepage = () => {
  return (
    <div className="p-6 space-y-10 grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="flex flex-col gap-4">
        {/* Welcome Section */}
        <section className="space-y-3">
          <h1 className="text-3xl font-semibold">
            Welcome to the{" "}
            <span className="text-indigo-600 font-bold">
              Adversarial Attack Dashboard
            </span>
          </h1>
          <p className="text-muted-foreground max-w-3xl">
            This interactive dashboard helps you visualize, simulate, and
            understand adversarial attacks on deep learning image classifiers.
            Whether you're a researcher, student, or security engineer, you're
            in the right place to explore model robustness in action.
          </p>
          <Link href="/dashboard/playground">
            <Button
              className="mt-2"
              icon={<FlaskConical className="mr-2 h-4 w-4" />}
              variant={"outline"}
            >
              Launch Playground
            </Button>
          </Link>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {docs.map(({ title, description, href, icon: Icon, external }) => (
            <Link
              key={title}
              href={href}
              target={external ? "_blank" : "_self"}
              rel={external ? "noopener noreferrer" : undefined}
              className="border border-indigo-600/10 p-6 rounded-xl transition-colors duration-300"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="bg-indigo-600/20 p-2 rounded-lg">
                  <Icon className="text-indigo-500 size-6" />
                </div>
                <h2 className="text-xl font-semibold">{title}</h2>
              </div>
              <p className="text-muted-foreground">{description}</p>
            </Link>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-2xl font-bold mb-4">
          Learn About Models and Attacks
        </h3>
        <AppInfoSlider />
      </div>
    </div>
  );
};

export default Homepage;
