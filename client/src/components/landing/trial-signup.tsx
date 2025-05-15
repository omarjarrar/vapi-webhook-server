import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trialFormSchema, type TrialFormData } from "@/lib/schema";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { images } from "@/lib/images";
import { Calendar, Clock, CheckCircle2 } from "lucide-react";

export function TrialSignup() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<TrialFormData>({
    resolver: zodResolver(trialFormSchema),
    defaultValues: {
      businessName: "",
      fullName: "",
      email: "",
      phone: "",
      industry: "",
    },
  });

  const onSubmit = async (data: TrialFormData) => {
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/trial-signup", data);
      toast({
        title: "Success!",
        description: "Your demo request has been received. We'll be in touch shortly.",
      });
      form.reset();
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again later or contact our support team.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    "See how our AI receptionist handles real calls",
    "Understand how it seamlessly integrates with your systems",
    "Get pricing tailored to your business needs",
    "Learn how to implement in your specific business context"
  ];

  return (
    <section id="booking" className="py-20 md:py-28 gradient-bg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid md:grid-cols-2">
            <div className="p-8 md:p-12">
              <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">
                Book a Personalized Demo
              </h2>
              <p className="text-gray-600 mb-6">
                Experience how Ring Ready can transform your business communications.
              </p>

              <div className="space-y-4 mb-8">
                {benefits.map((benefit, index) => (
                  <motion.div 
                    key={index} 
                    className="flex items-start"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <CheckCircle2 className="text-green-500 mt-1 mr-3 h-5 w-5 flex-shrink-0" />
                    <p className="text-gray-700">{benefit}</p>
                  </motion.div>
                ))}
              </div>

              <div className="mb-8">
                <div className="flex items-center mb-3">
                  <Calendar className="text-primary mr-2 h-5 w-5" />
                  <h3 className="font-bold">Choose a Date and Time</h3>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <iframe 
                    src="https://calendly.com/placeholder/30min" 
                    width="100%" 
                    height="350" 
                    frameBorder="0"
                    className="rounded-lg shadow-sm"
                  ></iframe>
                </div>
              </div>

              <p className="text-gray-500 text-sm mt-4">
                Our demos typically last 30 minutes with time for Q&A about your specific needs.
              </p>
            </div>

            <div className="p-8 md:p-12 bg-primary text-white">
              <h3 className="text-xl font-bold mb-4">What to Expect</h3>
              
              <div className="space-y-6 mb-8">
                <div className="flex">
                  <Clock className="mr-3 h-6 w-6 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold mb-1">30-Minute Personalized Session</h4>
                    <p className="opacity-80">We'll tailor the demonstration to your industry and business model.</p>
                  </div>
                </div>
                
                <div className="flex">
                  <Calendar className="mr-3 h-6 w-6 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold mb-1">Flexible Scheduling</h4>
                    <p className="opacity-80">Choose a time that works for you - we have slots available daily.</p>
                  </div>
                </div>
                
                <div className="border-t border-white border-opacity-20 pt-6">
                  <h4 className="font-bold mb-3">During Your Demo:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>See live demonstrations of our AI receptionist in action</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Get personalized pricing based on your call volume</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Learn about implementation and onboarding process</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
