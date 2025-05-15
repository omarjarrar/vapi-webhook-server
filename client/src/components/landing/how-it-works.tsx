import { motion } from "framer-motion";
import { images } from "@/lib/images";

const steps = [
  {
    number: 1,
    title: "Full Business Phone Automation",
    description:
      "Our AI receptionist completely automates your business calls, saving up to 20 hours per week of administrative work with no hardware required.",
  },
  {
    number: 2,
    title: "Human-like Voice Conversations",
    description:
      "Cutting-edge AI technology creates natural, flowing conversations that sound completely human - clients won't know they're talking with AI.",
  },
  {
    number: 3,
    title: "Seamless Business Integration",
    description:
      "Ring Ready syncs perfectly with your calendars, CRM, and business tools to automate appointment bookings and follow-ups without you lifting a finger.",
  },
  {
    number: 4,
    title: "Focus On Revenue-Generating Work",
    description:
      "Reclaim hours spent on phone management and redirect that time to activities that directly grow your business and increase your bottom line.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="max-w-3xl mx-auto text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            How Ring Ready Works
          </h2>
          <p className="text-xl text-gray-600">
            Automated business communication that works for you 24/7, saving you time and growing your business.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            {steps.map((step, index) => (
              <motion.div 
                key={step.number} 
                className="mb-12 last:mb-0"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="flex items-start mb-4">
                  <div className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mr-4 mt-1">
                    {step.number}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div 
            className="rounded-2xl overflow-hidden shadow-2xl"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <img
              src={images.dashboard}
              alt="Ring Ready dashboard in action"
              className="w-full h-auto"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
