import { motion } from "framer-motion";
import { images } from "@/lib/images";
import { CheckCircle } from "lucide-react";

const benefits = [
  "24/7 AI receptionist that answers every call with a human-like voice",
  "Automated appointment scheduling that integrates with your calendar",
  "Intelligent lead qualification to prioritize high-value prospects",
  "Follow-up management that ensures no opportunity falls through the cracks"
];

export function DemoSection() {
  return (
    <section id="demo" className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="max-w-3xl mx-auto text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            See Ring Ready in Action
          </h2>
          <p className="text-xl text-gray-600">
            Watch how our AI receptionist handles real calls and grows your business while you focus on what matters.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            className="rounded-2xl overflow-hidden shadow-2xl aspect-video"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-full h-full">
              <iframe
                src="https://www.youtube.com/embed/placeholder_video_id"
                title="Ring Ready AI Receptionist Demo"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full aspect-video"
              ></iframe>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-2xl font-display font-bold mb-6">
              Our Complete Service Suite
            </h3>
            <p className="text-gray-600 mb-8">
              Ring Ready is the complete phone automation solution that works while you sleep, helping your business grow 24/7.
            </p>

            <div className="space-y-6 mb-8">
              {benefits.map((benefit, index) => (
                <motion.div 
                  key={index} 
                  className="flex items-start"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <CheckCircle className="text-green-500 mt-1 mr-3 h-5 w-5 flex-shrink-0" />
                  <p className="text-gray-700">{benefit}</p>
                </motion.div>
              ))}
            </div>

            <a
              href="#booking"
              className="inline-block px-8 py-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg transition duration-300 shadow-lg hover:shadow-xl"
            >
              Book a Demo Call
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
