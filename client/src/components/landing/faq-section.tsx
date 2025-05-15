import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    question: "How does Ring Ready sound to my callers?",
    answer:
      "Ring Ready uses advanced AI technology to create a natural-sounding virtual receptionist. Your callers will think they're speaking with a real person. You can customize the voice, tone, and scripts to match your brand.",
  },
  {
    question: "Do I need to change my business phone number?",
    answer:
      "No, you can keep your existing business phone number. Ring Ready works with your current phone system. We can set up call forwarding from your current number to our service, or you can choose to get a new dedicated number through us.",
  },
  {
    question: "What calendar systems does Ring Ready integrate with?",
    answer:
      "Ring Ready integrates with all major calendar systems including Google Calendar, Microsoft Outlook, Apple Calendar, and industry-specific scheduling software like Calendly, Acuity, and more. If you use a custom system, contact us for integration options.",
  },
  {
    question: "How does the lead qualification feature work?",
    answer:
      "You can set custom qualifying questions that Ring Ready will ask callers. Based on their responses, the system will categorize leads, schedule appointments, or route the call according to your preferences. You'll receive detailed information about each lead so you can prioritize follow-ups.",
  },
  {
    question: "Is there a limit to how many calls Ring Ready can handle?",
    answer:
      "Each plan includes a specific number of calls per month. The Starter plan includes 100 calls, Professional includes 300 calls, and Enterprise includes 1,000 calls. If you need more, we offer custom plans for businesses with higher call volumes.",
  },
  {
    question: "What happens if I exceed my monthly call limit?",
    answer:
      "If you exceed your monthly call limit, additional calls are billed at a per-call rate. We'll notify you when you're approaching your limit so you can decide whether to upgrade your plan or pay for the additional calls. We'll never cut off your service unexpectedly.",
  },
];

export function FaqSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about Ring Ready
            </p>
          </motion.div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className="border border-gray-200 rounded-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <button
                  className="flex justify-between items-center w-full px-6 py-4 text-left font-bold focus:outline-none"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={activeIndex === index}
                  aria-controls={`faq-answer-${index}`}
                >
                  <span>{faq.question}</span>
                  {activeIndex === index ? (
                    <Minus className="text-primary h-5 w-5" />
                  ) : (
                    <Plus className="text-primary h-5 w-5" />
                  )}
                </button>
                <AnimatePresence>
                  {activeIndex === index && (
                    <motion.div
                      id={`faq-answer-${index}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-4">
                        <p className="text-gray-600">{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <p className="text-gray-600 mb-4">
              Still have questions? We're here to help.
            </p>
            <a
              href="#contact"
              className="inline-block px-6 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition duration-300"
            >
              Contact Support
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
