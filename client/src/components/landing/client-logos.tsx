import { motion } from "framer-motion";
import { Home, Scissors, Building, Torus, Wrench, Bath } from "lucide-react";

const clientLogos = [
  { name: "HomeServe", icon: Home },
  { name: "StyleCuts", icon: Scissors },
  { name: "PremiumRealty", icon: Building },
  { name: "DentalCare", icon: Torus },
  { name: "MasterFix", icon: Wrench },
  { name: "SereneWellness", icon: Bath },
];

export function ClientLogos() {
  return (
    <section className="pb-16 border-t border-b border-gray-100 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <p className="text-center text-gray-600 mb-8 font-medium">
          Trusted by service-based businesses across industries
        </p>
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center justify-items-center opacity-70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ duration: 0.5 }}
        >
          {clientLogos.map((logo, index) => (
            <motion.div 
              key={logo.name} 
              className="h-12 flex items-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <logo.icon className="h-8 w-8 text-gray-400 mr-2" />
              <span className="font-display font-bold text-gray-500">{logo.name}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
