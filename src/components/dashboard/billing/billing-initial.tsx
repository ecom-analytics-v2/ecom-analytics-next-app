"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { Check } from "lucide-react";

const BillingInitial = () => {
  const subscribeMutation = api.billingRouter.subscribe.useMutation();

  const handleSubscribe = async () => {
    const result = await subscribeMutation.mutateAsync();
    window.location.href = result.url;
  };

  return (
    <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto p-6">
      {/* Free Plan */}
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Free Plan</CardTitle>
          <p className="text-3xl font-bold">
            $0<span className="text-lg text-muted-foreground">/mo</span>
          </p>
          <p className="text-muted-foreground">Perfect for getting started</p>
        </CardHeader>
        <CardContent className="flex-grow">
          <ul className="space-y-2">
            {freePlanFeatures.map((feature, i) => (
              <li key={i} className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button className="w-full" variant="outline">
            Current Plan
          </Button>
        </CardFooter>
      </Card>

      {/* Pro Plan */}
      <Card className="flex flex-col border-2 border-primary">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Pro Plan</CardTitle>
          <p className="text-3xl font-bold">
            $29<span className="text-lg text-muted-foreground">/mo</span>
          </p>
          <p className="text-muted-foreground">Unlock all features</p>
        </CardHeader>
        <CardContent className="flex-grow">
          <ul className="space-y-2">
            {proPlanFeatures.map((feature, i) => (
              <li key={i} className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => handleSubscribe()} variant="default">
            Subscribe to Pro
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

const freePlanFeatures = [
  "Lorem ipsum dolor sit amet consectetur",
  "Adipiscing elit sed do eiusmod",
  "Tempor incididunt ut labore",
  "Dolore magna aliqua ut enim",
  "Minim veniam quis nostrud",
];

const proPlanFeatures = [
  "Lorem ipsum dolor sit amet elit",
  "Consectetur adipiscing elit tempus",
  "Sed do eiusmod tempor magna",
  "Ut labore et dolore magna aliqua",
  "Ut enim ad minim veniam quis",
  "Nostrud exercitation ullamco",
  "Laboris nisi ut aliquip ex ea",
  "Commodo consequat duis aute",
];

export default BillingInitial;
