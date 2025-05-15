import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";
import { images } from "@/lib/images";

const testimonials = [
  {
    id: 0,
    content:
      "Since using Ring Ready, I've been able to focus on my clients without worrying about missing calls. It's doubled my bookings and paid for itself within the first month!",
    author: "Sarah Johnson",
    role: "Hair Salon Owner",
    avatar: images.testimonials.sarah,
  },
  {
    id: 1,
    content:
      "The lead qualification feature alone is worth every penny. Ring Ready makes sure I only spend time on qualified leads, and my conversion rate has gone through the roof.",
    author: "Michael Rodriguez",
    role: "Real Estate Agent",
    avatar: images.testimonials.michael,
  },
  {
    id: 2,
    content:
      "As a plumber, I'm often under sinks or in crawl spaces when calls come in. Ring Ready handles everything professionally and I've seen a 40% increase in scheduled jobs since I started using it.",
    author: "Dave Thompson",
    role: "Plumbing Contractor",
    avatar: images.testimonials.dave,
  },
];

export function TestimonialCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleSlideChange = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <section id="testimonials" className="py-20 md:py-28 testimonial-gradient">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="max-w-3xl mx-auto text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            What Our Customers Say
          </h2>
          <p className="text-xl text-gray-600">
            Join thousands of businesses who never miss a call.
          </p>
        </motion.div>

        <div className="flex flex-wrap -mx-4">
          <AnimatePresence mode="wait">
            {testimonials.map((testimonial) => (
              <motion.div
                className={`w-full lg:w-1/3 px-4 mb-8 ${
                  activeIndex === testimonial.id ? "" : "hidden lg:block"
                }`}
                key={testimonial.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: activeIndex === testimonial.id ? 1 : 0.5, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white p-8 rounded-xl shadow-md h-full border border-gray-100">
                  <div className="flex mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <blockquote className="text-gray-600 mb-6">
                    "{testimonial.content}"
                  </blockquote>
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-gray-300 mr-4 overflow-hidden">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.author}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-bold">{testimonial.author}</p>
                      <p className="text-gray-500 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="text-center mt-8">
          <div className="inline-flex space-x-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => handleSlideChange(i)}
                className={`w-3 h-3 rounded-full focus:outline-none transition-colors ${
                  activeIndex === i
                    ? "bg-primary"
                    : "bg-gray-300 hover:bg-primary-light"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
