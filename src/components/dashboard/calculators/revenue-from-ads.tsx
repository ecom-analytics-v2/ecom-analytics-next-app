"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RevenueFromAdsCalculatorSchema } from "@/lib/form-schemas/calculators";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import CalculatorResult from "./result";
const RevenueFromAdsCalculator = () => {
  const result = api.calculators.revenueFromAds.useMutation();

  const form = useForm<z.infer<typeof RevenueFromAdsCalculatorSchema>>({
    resolver: zodResolver(RevenueFromAdsCalculatorSchema),
    defaultValues: {
      revenue_from_ads: 0,
      ad_spend_time_period: "24h",
    },
  });

  const onSubmit = (data: z.infer<typeof RevenueFromAdsCalculatorSchema>) => {
    result.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue from Ads</CardTitle>
        <CardDescription> Calculate your revenue per dollar spent on ads</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {result.data == undefined && <CalculatorResult>$----.----</CalculatorResult>}
        {result.data !== undefined && (
          <CalculatorResult>${result.data.toFixed(2)}</CalculatorResult>
        )}
        <Form {...form}>
          <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="revenue_from_ads"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Revenue from Ads</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value !== undefined && !isNaN(field.value) ? field.value : ""}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ad_spend_time_period"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ad Time Period</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a time period" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="24h">Last 24 Hours</SelectItem>
                      <SelectItem value="7d">Last 7 Days</SelectItem>
                      <SelectItem value="30d">Last 30 Days</SelectItem>
                      <SelectItem value="90d">Last 90 Days</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit">Calculate</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default RevenueFromAdsCalculator;
