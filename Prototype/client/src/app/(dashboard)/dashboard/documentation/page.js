"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, Brain, Layers3, ExternalLink } from "lucide-react";

const docs = [
  {
    title: "Getting Started",
    description: "Step-by-step guide to running your first adversarial attack experiment.",
    href: "/docs/getting-started",
    icon: BookOpen,
  },
  {
    title: "System Architecture",
    description: "Explore how the backend, model inference engine, and dashboard interact.",
    href: "/docs/architecture",
    icon: Layers3,
  },
  {
    title: "Types of Attacks Supported",
    description: "Overview of supported adversarial methods like FGSM, PGD, DeepFool, and more.",
    href: "/docs/attacks",
    icon: Brain,
  },
  {
    title: "Research Paper: Adversarial Examples in ML",
    description: "Read the foundational work by Goodfellow et al. (2015) on adversarial attacks.",
    href: "https://arxiv.org/abs/1412.6572",
    icon: ExternalLink,
    external: true,
  },
  {
    title: "Further Reading",
    description: "Links to additional papers and open-source libraries used in this project.",
    href: "/docs/resources",
    icon: BookOpen,
  },
];

function DocumentationPage() {
  return (
    <div className="max-w-4xl p-6">
      <h1 className="text-4xl font-bold mb-6">📚 Documentation</h1>
      <p className="text-muted-foreground mb-12">
        Learn how this platform works, how to run experiments, and explore the theory behind adversarial attacks on image classifiers.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {docs.map(({ title, description, href, icon: Icon, external }) => (
          <Link
            key={title}
            href={href}
            target={external ? "_blank" : "_self"}
            rel={external ? "noopener noreferrer" : undefined}
            className="border border-white/10 p-6 rounded-xl hover:bg-neutral-900 transition-colors duration-300"
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
  );
}

export default DocumentationPage;
