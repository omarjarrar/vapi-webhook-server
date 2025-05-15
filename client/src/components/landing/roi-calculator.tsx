import { useState, useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DollarSign, Calculator, TrendingUp } from "lucide-react";

// Define form schema with validation
const roiFormSchema = z.object({
  monthlyCalls: z.coerce
    .number()
    .min(1, { message: "Must receive at least 1 call per month" })
    .max(5000, { message: "For very high call volumes, please contact us directly" })
    .default(150),
  
  missedCallPercentage: z.coerce
    .number()
    .min(0, { message: "Must be at least 0%" })
    .max(100, { message: "Cannot exceed 100%" })
    .default(20),
  
  averageOrderValue: z.coerce
    .number()
    .min(1, { message: "Average order value must be at least $1" })
    .max(100000, { message: "For very high values, please contact us directly" })
    .default(200),
  
  conversionRate: z.coerce
    .number()
    .min(1, { message: "Must be at least 1%" })
    .max(100, { message: "Cannot exceed 100%" })
    .default(20),
  
  receptionistHourlyCost: z.coerce
    .number()
    .min(10, { message: "Hourly cost must be at least $10" })
    .max(100, { message: "Hourly cost cannot exceed $100" })
    .default(20),
});

type ROIFormValues = z.infer<typeof roiFormSchema>;

// Define ROI calculation result type
type ROICalculationResult = {
  additionalRevenue: number;
  costSavings: number;
  totalBenefit: number;
  ringReadyCost: number;
  netBenefit: number;
  roi: number;
};

export function ROICalculator() {
  // Initialize form with default values
  const form = useForm<ROIFormValues>({
    resolver: zodResolver(roiFormSchema),
    defaultValues: {
      monthlyCalls: 150,
      missedCallPercentage: 20,
      averageOrderValue: 200,
      conversionRate: 20,
      receptionistHourlyCost: 20,
    },
  });

  const [calculationResult, setCalculationResult] = useState<ROICalculationResult | null>(null);
  const [hasCalculated, setHasCalculated] = useState(false);

  // Calculate ROI when form values change
  useEffect(() => {
    if (hasCalculated) {
      calculateROI(form.getValues());
    }
  }, [form.watch(), hasCalculated]);

  const calculateROI = (values: ROIFormValues) => {
    // Calculate monthly missed calls
    const monthlyMissedCalls = Math.round(values.monthlyCalls * (values.missedCallPercentage / 100));
    
    // Calculate potential additional monthly revenue from captured calls
    const additionalRevenue = monthlyMissedCalls * values.averageOrderValue * (values.conversionRate / 100);
    
    // Calculate monthly cost of traditional receptionist (assuming 160 working hours per month)
    const receptionistMonthlyCost = values.receptionistHourlyCost * 160;
    
    // Ring Ready monthly cost (baseline of $249)
    const ringReadyCost = 249;
    
    // Calculate monthly cost savings
    const costSavings = receptionistMonthlyCost - ringReadyCost;
    
    // Calculate total monthly benefit
    const totalBenefit = additionalRevenue + costSavings;
    
    // Calculate net benefit
    const netBenefit = totalBenefit - ringReadyCost;
    
    // Calculate ROI (Return on Investment)
    const roi = (netBenefit / ringReadyCost) * 100;
    
    setCalculationResult({
      additionalRevenue,
      costSavings,
      totalBenefit,
      ringReadyCost,
      netBenefit,
      roi
    });
  };

  // Handle form submission
  const onSubmit = (data: ROIFormValues) => {
    calculateROI(data);
    setHasCalculated(true);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(amount));
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
          Calculate Your ROI with Ring Ready
        </h2>
        <p className="max-w-2xl mx-auto text-xl text-gray-500">
          See how much you can save by using our AI receptionist service compared to traditional options.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Input Form */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="mr-2 h-5 w-5" />
                Input Your Business Details
              </CardTitle>
              <CardDescription>
                Adjust the values to match your business situation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="monthlyCalls"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Call Volume</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormDescription>
                          How many calls does your business receive per month?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="missedCallPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Missed Call Percentage (%)</FormLabel>
                        <FormControl>
                          <div className="flex items-center space-x-4">
                            <Slider
                              value={[field.value]}
                              min={0}
                              max={100}
                              step={1}
                              onValueChange={(value) => field.onChange(value[0])}
                              className="flex-grow"
                            />
                            <span className="w-12 text-right">{field.value}%</span>
                          </div>
                        </FormControl>
                        <FormDescription>
                          What percentage of calls do you currently miss?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="averageOrderValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Average Order Value ($)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormDescription>
                          What is the average value of a customer order?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="conversionRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Call-to-Customer Conversion Rate (%)</FormLabel>
                        <FormControl>
                          <div className="flex items-center space-x-4">
                            <Slider
                              value={[field.value]}
                              min={1}
                              max={100}
                              step={1}
                              onValueChange={(value) => field.onChange(value[0])}
                              className="flex-grow"
                            />
                            <span className="w-12 text-right">{field.value}%</span>
                          </div>
                        </FormControl>
                        <FormDescription>
                          What percentage of answered calls convert to customers?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="receptionistHourlyCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Receptionist Hourly Cost ($)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormDescription>
                          How much do you pay an hourly receptionist?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full">
                    Calculate ROI
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Results Display */}
        <div>
          <Card className={`h-full flex flex-col ${!calculationResult ? 'justify-center items-center' : ''}`}>
            {calculationResult ? (
              <>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Your Ring Ready ROI
                  </CardTitle>
                  <CardDescription>
                    Based on your inputs, here's your potential return on investment
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="space-y-6">
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                      <h3 className="text-xl font-semibold text-blue-800 mb-2">Monthly Impact</h3>
                      <p className="text-3xl font-bold text-blue-900">
                        {formatCurrency(calculationResult.netBenefit)}
                        <span className="text-lg font-normal text-blue-600 ml-1">
                          /month
                        </span>
                      </p>
                      <p className="text-sm text-blue-600 mt-1">
                        Net benefit after Ring Ready costs
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Additional Revenue</span>
                        <span className="font-semibold">{formatCurrency(calculationResult.additionalRevenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cost Savings</span>
                        <span className="font-semibold">{formatCurrency(calculationResult.costSavings)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Monthly Benefit</span>
                        <span className="font-semibold">{formatCurrency(calculationResult.totalBenefit)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ring Ready Monthly Cost</span>
                        <span className="font-semibold">{formatCurrency(calculationResult.ringReadyCost)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-gray-700 font-medium">Net Monthly Benefit</span>
                        <span className="font-bold">{formatCurrency(calculationResult.netBenefit)}</span>
                      </div>
                    </div>

                    <div className="bg-green-50 p-6 rounded-lg border border-green-100">
                      <h3 className="text-xl font-semibold text-green-800 mb-2">Return on Investment</h3>
                      <p className="text-3xl font-bold text-green-900">
                        {Math.round(calculationResult.roi)}%
                      </p>
                      <p className="text-sm text-green-600 mt-1">
                        Monthly ROI on your Ring Ready investment
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-6">
                  <p className="text-sm text-gray-500">
                    This calculation is an estimate and actual results may vary based on your business specifics. 
                    Contact us for a detailed analysis of your potential savings.
                  </p>
                </CardFooter>
              </>
            ) : (
              <div className="text-center p-8">
                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Enter your details
                </h3>
                <p className="text-gray-500">
                  Fill out the form and click "Calculate ROI" to see your potential savings with Ring Ready.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}