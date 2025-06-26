import { BookOpen, Brain, Layers3, ExternalLink } from "lucide-react";

export const docs = [
  {
    title: "Getting Started",
    description: "Step-by-step guide to running your first adversarial attack experiment.",
    href: "/dashboard",
    icon: BookOpen,
  },
  {
    title: "System Architecture",
    description: "Explore how the backend, model inference engine, and dashboard interact.",
    href: "/dashboard",
    icon: Layers3,
  },
  {
    title: "Types of Attacks Supported",
    description: "Overview of supported adversarial methods like FGSM, PGD, DeepFool, and more.",
    href: "/dashboard",
    icon: Brain,
  },
  {
    title: "Research Paper: Adversarial Examples in ML",
    description: "Read the foundational work by Goodfellow et al. (2015) on adversarial attacks.",
    href: "/dashboard",
    icon: ExternalLink,
    external: true,
  },
  {
    title: "Further Reading",
    description: "Links to additional papers and open-source libraries used in this project.",
    href: "/dashboard",
    icon: BookOpen,
  },
];