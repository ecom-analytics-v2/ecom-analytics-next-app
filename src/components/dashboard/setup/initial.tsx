"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, CheckCircle } from "lucide-react";

const SetupRequirements = ({ nextStep }: { nextStep: () => void }) => {
  const requirements = [
    {
      title: "Shopify Account",
      description: "An active Shopify store to connect with our platform",
    },
    {
      title: "Google Account (Analytics & Ads)",
      description: "A Google account with Analytics and Ads access",
    },
    {
      title: "Meta Ads Account (Not required for now)",
      description: "A Meta ads account with adveritising spend history",
    },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Setup Requirements</h1>
        <p className="text-muted-foreground">
          Before we begin, please ensure you have the following:
        </p>
      </div>

      <div className="space-y-4">
        {requirements.map((requirement, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center gap-4">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <CardTitle className="text-lg">{requirement.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{requirement.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end pt-6">
        <Button onClick={nextStep}>
          Continue to Next Step <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default SetupRequirements;
