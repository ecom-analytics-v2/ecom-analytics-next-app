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
import { ShippingCostCalculatorSchema } from "@/lib/form-schemas/calculators";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import CalculatorResult from "./result";

const ShippingCostCalculator = () => {
  const result = api.calculators.shippingCost.useMutation();

  const form = useForm<z.infer<typeof ShippingCostCalculatorSchema>>({
    resolver: zodResolver(ShippingCostCalculatorSchema),
    defaultValues: {
      total_shipping_cost: 0,
    },
  });

  const onSubmit = (data: z.infer<typeof ShippingCostCalculatorSchema>) => {
    result.mutate(data);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Shipping Cost Calculator</CardTitle>
        <CardDescription>Calculate average shipping cost per order</CardDescription>
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
              name="total_shipping_cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Shipping Costs</FormLabel>
                  <FormControl>
                    <Input
                      id="totalShippingCost"
                      type="number"
                      placeholder="Enter total shipping costs"
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
              name="total_orders"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Orders (Leave blank for last 90 days)</FormLabel>
                  <FormControl>
                    <Input
                      id="totalOrders"
                      type="number"
                      placeholder="Enter number of orders"
                      {...field}
                      value={
                        field.value !== undefined && !isNaN(field.value) ? field.value : undefined
                      }
                      onChange={(e) =>
                        field.onChange(
                          field.value !== undefined && !isNaN(field.value)
                            ? parseInt(e.target.value)
                            : undefined
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button disabled={result.isPending} type="submit">
              {result.isPending ? "Calculating..." : "Calculate"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ShippingCostCalculator;
