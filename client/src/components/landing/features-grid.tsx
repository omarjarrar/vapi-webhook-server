import { motion } from "framer-motion";
import { Phone, CalendarCheck, UserCheck, MessageSquare, RefreshCw, BarChart } from "lucide-react";

const features = [
  {
    icon: Phone,
    title: "24/7 AI Call Answering",
    description: "Never miss a client again with our always-on virtual receptionist that sounds just like a human.",
  },
  {
    icon: CalendarCheck,
    title: "Appointment Booking",
    description: "Automatically book appointments into your calendar, with automated confirmation and reminders.",
  },
  {
    icon: UserCheck,
    title: "Lead Qualification",
    description: "Customizable scripts that qualify leads based on your criteria, so you only follow up with the right ones.",
  },
  {
    icon: MessageSquare,
    title: "SMS Follow-ups",
    description: "Automatic text follow-ups after calls, plus voicemail transcription delivered straight to your inbox.",
  },
  {
    icon: RefreshCw,
    title: "CRM Integration",
    description: "Seamless integration with HubSpot, Salesforce, GoHighLevel and other popular CRM platforms.",
  },
  {
    icon: BarChart,
    title: "Analytics Dashboard",
    description: "Track calls, conversions, and ROI with our easy-to-understand analytics dashboard.",
  },
];

export function FeaturesGrid() {
  return (
    <section id="features" className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="max-w-3xl mx-auto text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            All the Tools You Need to Never Miss a Call
          </h2>
          <p className="text-xl text-gray-600">
            Your virtual receptionist works 24/7 so you don't have to.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition duration-300 border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <feature.icon className="text-primary text-2xl h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-600 mb-4">{feature.description}</p>
              <div className="text-primary font-medium flex items-center">
                <span>Learn more</span>
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
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
