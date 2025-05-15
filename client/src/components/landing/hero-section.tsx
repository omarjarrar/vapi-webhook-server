import { motion } from "framer-motion";
import { images } from "@/lib/images";
import { Star } from "lucide-react";
import { PlayCircle } from "lucide-react";

export function HeroSection() {
  return (
    <section className="pt-16 pb-20 md:pt-20 md:pb-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center">
          <motion.div 
            className="lg:w-1/2 mb-10 lg:mb-0 lg:pr-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 leading-tight mb-4">
              Never Miss a Client Call Again
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
              Ring Ready is your 24/7 AI receptionist that answers calls, books appointments, qualifies leads, and follows up — so you never lose business while you're working.
            </p>
            <div className="flex flex-col sm:flex-row items-center mb-8">
              <a
                href="#booking"
                className="w-full sm:w-auto mb-4 sm:mb-0 sm:mr-4 px-8 py-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg transition duration-300 text-center shadow-lg hover:shadow-xl"
              >
                Book a Demo
              </a>
              <a
                href="#demo"
                className="w-full sm:w-auto px-8 py-4 border border-gray-300 hover:border-primary text-gray-700 hover:text-primary font-medium rounded-lg transition duration-300 text-center flex items-center justify-center"
              >
                <PlayCircle className="mr-2" /> Watch Demo
              </a>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center mb-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="ml-2 text-gray-600 font-medium">4.9/5 from 230+ reviews</span>
              </div>
              <p className="text-gray-700 italic">
                "Ring Ready saved me hours each week — and doubled my bookings!"
              </p>
            </div>
          </motion.div>
          <motion.div 
            className="lg:w-1/2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <img 
              src={images.hero} 
              alt="Professional using Ring Ready AI receptionist" 
              className="w-full h-auto rounded-2xl shadow-2xl" 
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
