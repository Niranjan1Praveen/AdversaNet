import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  FlaskConical,
  BarChart3,
  PlusIcon,
  FileIcon,
  FlaskConicalIcon,
} from "lucide-react";
import Link from "next/link";

const latestExperiments = [
  {
    name: "FGSM vs ResNet-50",
    date: "May 23, 2025",
    status: "Completed",
  },
  {
    name: "PGD Attack on CIFAR-10",
    date: "May 22, 2025",
    status: "Running",
  },
  {
    name: "DeepFool - MNIST Classifier",
    date: "May 20, 2025",
    status: "Completed",
  },
];

const Homepage = () => {
  return (
    <div className="p-6 space-y-10">
      {/* Welcome Section */}
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold">
          Welcome to the Adversarial Attack Dashboard
        </h1>
        <p className="text-muted-foreground max-w-3xl">
          This interactive dashboard helps you visualize, simulate, and
          understand adversarial attacks on deep learning image classifiers.
          Whether you're a researcher, student, or security engineer, you're in
          the right place to explore model robustness in action.
        </p>
        <Link href="/dashboard/playground">
          <Button
            className="mt-2"
            icon={<FlaskConical className="mr-2 h-4 w-4" />}
          >
            Launch Playground
          </Button>
        </Link>
      </section>
      {/* Latest Experiments */}
      <div className="flex flex-col items-center justify-center border border-dashed p-8 text-center animate-in fade-in-50 rounded-md">
        <div className="bg-primary/15 flex items-center justify-center rounded-full size-20 border-4 border-indigo-600">
          <FlaskConicalIcon className="size-10 text-indigo-600" />
        </div>
        <h2 className="mt-6 font-semibold text-2xl">No experiments found!</h2>
        <p className="mb-8 mt-2 text-center text-xl text-muted-foreground max-w-lg">
          You haven’t run any experiments yet. Start by choosing a model and
          attack to simulate adversarial behavior and analyze the results
          visually.
        </p>
        <Button
          variant={"secondary"}
          size={"lg"}
          className={"bg-indigo-600 text-white"}
          asChild
        >
          <Link href={"/dashboard/playground"}>
            <PlusIcon className="mr-2" />
            Start Experiment
          </Link>
        </Button>
      </div>
      {/* Highlights or Quick Start */}
      <section className="space-y-4">
        <h2 className="text-xl font-medium">Highlights</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 space-y-2">
              <h3 className="font-semibold flex items-center">
                <BarChart3 className="h-4 w-4 mr-2" />
                Attack Analytics
              </h3>
              <p className="text-sm text-muted-foreground">
                View precision, accuracy, and attack success rate across models
                and datasets.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 space-y-2">
              <h3 className="font-semibold flex items-center">
                <FlaskConical className="h-4 w-4 mr-2" />
                Adversarial Playground
              </h3>
              <p className="text-sm text-muted-foreground">
                Choose a model, dataset, and attack type to run visual
                experiments in real-time.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 space-y-2">
              <h3 className="font-semibold flex items-center">
                <ArrowRight className="h-4 w-4 mr-2" />
                Quick Start
              </h3>
              <p className="text-sm text-muted-foreground">
                Go to the playground, pick an image and an attack, and instantly
                see the visual impact.
              </p>
              <Link href="/dashboard/playground">
                <Button variant="link" className="pl-0 text-indigo-500">
                  Try Now <ArrowRight />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Homepage;
