import { motion } from "framer-motion";
import { Check, Info } from "lucide-react";

const pricingPlans = [
  {
    name: "Starter",
    price: "$99",
    description: "Perfect for small businesses just getting started",
    features: [
      "Up to 100 calls per month",
      "24/7 AI call answering",
      "Basic appointment booking",
      "Voicemail transcription",
      "Email notifications",
    ],
    popular: false,
  },
  {
    name: "Professional",
    price: "$199",
    description: "For growing businesses with more call volume",
    features: [
      "Up to 300 calls per month",
      "Everything in Starter, plus:",
      "Advanced appointment booking",
      "Calendar integration",
      "Lead qualification",
      "SMS notifications",
      "Basic CRM integration",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$349",
    description: "For established businesses with high call volume",
    features: [
      "Up to 1,000 calls per month",
      "Everything in Professional, plus:",
      "Advanced CRM integration",
      "Custom scripts and workflows",
      "Priority routing",
      "Advanced analytics dashboard",
      "Dedicated account manager",
    ],
    popular: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 md:py-28 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="max-w-3xl mx-auto text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600">
            No hidden fees. Choose the plan that works for your business.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row -mx-4">
          {pricingPlans.map((plan, index) => (
            <motion.div 
              key={plan.name} 
              className="w-full lg:w-1/3 px-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div
                className={`bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition duration-300 h-full flex flex-col ${
                  plan.popular
                    ? "shadow-xl border-2 border-primary relative"
                    : "border border-gray-100"
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-primary text-white py-1 px-4 text-sm font-medium rounded-bl-lg rounded-tr-lg">
                    Most Popular
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="text-3xl font-display font-bold">
                    {plan.price}
                    <span className="text-gray-500 text-lg font-normal">
                      /month
                    </span>
                  </div>
                  <p className="text-gray-600 mt-2">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="text-green-500 mt-1 mr-3 h-5 w-5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <motion.a
                  href="#booking"
                  className={`w-full py-3 font-bold rounded-lg transition duration-300 text-center ${
                    plan.popular
                      ? "bg-primary hover:bg-primary-dark text-white shadow-md hover:shadow-lg"
                      : "border border-primary text-primary hover:bg-primary hover:text-white"
                  }`}
                  whileHover={{ y: -3 }}
                  whileTap={{ y: 0 }}
                >
                  Book a Demo
                </motion.a>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="max-w-3xl mx-auto mt-8 p-6 bg-blue-50 rounded-xl border border-blue-100"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-start">
            <div className="text-primary mr-4">
              <Info className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold mb-2">Need a custom plan?</h4>
              <p className="text-gray-700 mb-4">
                If your business has unique needs or higher call volume, we offer
                custom solutions tailored to your requirements.
              </p>
              <a
                href="#contact"
                className="text-primary font-medium hover:text-primary-dark flex items-center"
              >
                Contact our sales team 
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 ml-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
