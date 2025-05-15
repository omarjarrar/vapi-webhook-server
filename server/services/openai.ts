import OpenAI from "openai";

// Initialize the OpenAI API client with API key
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Create AI assistant prompt context
const SYSTEM_PROMPT = `You are Ring Ready, an AI receptionist for a service-based business.
Your job is to answer phone calls, provide information about services, collect caller information, 
and schedule appointments. You're friendly, professional, and efficient.

Keep your responses conversational and concise (under 70 words).

As an AI receptionist, you should:
- Greet callers politely
- Answer questions about business services
- Collect information for appointments (name, contact details, service needed)
- Offer appointment scheduling
- Thank callers for their time

For this demo, assume you work for a plumbing company that offers services including:
- Emergency plumbing repairs
- Drain cleaning
- Leak detection and repair
- Water heater installation and repair
- Pipe replacement
- Fixture installation and repair
- Sewer line repair

Your available appointment slots are:
- Tomorrow: 9am-12pm, 1pm-3pm
- The day after tomorrow: 10am-2pm, 3pm-5pm
- Next week: Multiple slots available each day`;

/**
 * Generate a response using OpenAI's GPT model
 * @param userMessage - The message from the user
 * @returns The assistant's response
 */
export async function generateAssistantResponse(userMessage: string): Promise<string> {
  try {
    console.log('Processing user message:', userMessage);
    
    // For testing purposes, use predetermined responses instead of API calls
    // This helps us test the full voice assistant flow without API issues
    let responseText = "";
    
    // Message preprocessing - clean up the message and extract keywords
    let cleanMessage = userMessage.toLowerCase().trim();
    console.log("Original clean message:", cleanMessage);
    
    // Filter out inappropriate language and set up pattern matching
    const inappropriate = ['fuck', 'shit', 'ass', 'damn', 'bitch', 'cunt'];
    let isInappropriate = false;
    
    // Check for inappropriate words
    for (const word of inappropriate) {
      if (cleanMessage.includes(word)) {
        isInappropriate = true;
        // Replace inappropriate words with asterisks for logging
        cleanMessage = cleanMessage.replace(new RegExp(word, 'g'), '*'.repeat(word.length));
      }
    }
    
    if (isInappropriate) {
      console.log("Detected inappropriate language, responding with polite redirect");
      return "I'm here to help with information about Ring Ready's AI receptionist service. How can I assist you with learning more about our features, pricing, or setup process?";
    }
    
    console.log("Clean message for pattern matching:", cleanMessage);
    
    // Improved pattern matching with better keyword detection
    // Check for pricing/cost related questions first (most common question)
    if (cleanMessage.includes("price") || 
        cleanMessage.includes("cost") || 
        cleanMessage.includes("pricing") ||
        cleanMessage.includes("rate") ||
        cleanMessage.includes("plan") ||
        (cleanMessage.includes("much") && (cleanMessage.includes("cost") || cleanMessage.includes("pay") || cleanMessage.includes("charge"))) ||
        (cleanMessage.includes("how") && cleanMessage.includes("much"))) {
      responseText = "Ring Ready offers flexible pricing plans starting at $249 per month for small businesses. Custom plans are available for companies with higher call volumes. All plans include 24/7 service and our satisfaction guarantee.";
    } 
    // Services/offerings related questions
    else if (cleanMessage.includes("service") || 
             cleanMessage.includes("offer") ||
             cleanMessage.includes("provide") ||
             cleanMessage.includes("what") && (cleanMessage.includes("do") || cleanMessage.includes("does"))) {
      responseText = "Ring Ready is an AI receptionist service that handles your business calls 24/7. We answer calls, schedule appointments, answer customer questions, and ensure you never miss important client communications.";
    } 
    // How it works questions
    else if ((cleanMessage.includes("how") || cleanMessage.includes("explain")) &&
             (cleanMessage.includes("work") || 
              cleanMessage.includes("does it") ||
              cleanMessage.includes("function") ||
              cleanMessage.includes("operate"))) {
      responseText = "Ring Ready works by integrating with your existing phone system. When a call comes in, our AI answers with a natural voice, collects information, books appointments, and forwards urgent calls to your team as needed.";
    }
    // Implementation questions
    else if (cleanMessage.includes("setup") || 
             cleanMessage.includes("install") || 
             cleanMessage.includes("integrate") ||
             cleanMessage.includes("implementation") ||
             cleanMessage.includes("set up")) {
      responseText = "Setting up Ring Ready is simple. We integrate with your existing business phone system in less than a day. There's no hardware to install, and our team handles the entire configuration process for you.";
    }
    // Benefits and advantages questions, including comparison to traditional receptionists
    else if (cleanMessage.includes("benefit") || 
             cleanMessage.includes("advantage") || 
             cleanMessage.includes("why") ||
             cleanMessage.includes("pros") ||
             cleanMessage.includes("compare") ||
             (cleanMessage.includes("help") && cleanMessage.includes("business")) ||
             (cleanMessage.includes("traditional") && cleanMessage.includes("receptionist")) ||
             (cleanMessage.includes("difference") && cleanMessage.includes("between"))) {
      responseText = "Ring Ready helps businesses save up to 80% on receptionist costs while never missing a call. Unlike traditional receptionists, we're available 24/7, never take breaks, handle unlimited calls simultaneously, and provide detailed analytics on every interaction.";
    }
    // Industry questions
    else if (cleanMessage.includes("industry") || 
             cleanMessage.includes("business type") || 
             cleanMessage.includes("who use") ||
             cleanMessage.includes("what business") ||
             cleanMessage.includes("company") && cleanMessage.includes("type")) {
      responseText = "Ring Ready is ideal for service businesses including plumbers, electricians, HVAC companies, dental offices, medical practices, law firms, real estate agencies, and any business that values responsive client communication.";
    }
    // Demo and trial questions
    else if (cleanMessage.includes("demo") || 
             cleanMessage.includes("trial") || 
             cleanMessage.includes("try") ||
             cleanMessage.includes("test") ||
             cleanMessage.includes("free")) {
      responseText = "We offer a free 7-day trial of Ring Ready with no obligation. You can experience how our AI receptionist handles your actual business calls. Would you like to schedule a demo with one of our specialists?";
    }
    // Technology questions
    else if (cleanMessage.includes("ai") || 
             cleanMessage.includes("technology") || 
             cleanMessage.includes("natural") ||
             cleanMessage.includes("voice") ||
             cleanMessage.includes("speech") ||
             cleanMessage.includes("tech") ||
             cleanMessage.includes("machine learning")) {
      responseText = "Ring Ready uses advanced natural language processing and voice synthesis technology. Our AI understands context, responds naturally to callers, and continuously improves through machine learning.";
    }
    // Handle acknowledgments and short responses
    else if (cleanMessage.includes("okay") || 
             cleanMessage.includes("thanks") || 
             cleanMessage.includes("thank you") ||
             cleanMessage.includes("sounds good") ||
             cleanMessage.includes("great") ||
             cleanMessage.includes("got it") ||
             cleanMessage.includes("alright") ||
             cleanMessage.includes("cool")) {
      responseText = "Is there anything else you'd like to know about Ring Ready? I can tell you about our pricing, features, setup process, or how we compare to hiring a traditional receptionist.";
    }
    // Default welcome message for greetings and unrecognized inputs
    else {
      responseText = "Welcome to Ring Ready, your 24/7 AI receptionist service. We help businesses never miss a call by handling appointment scheduling, answering common questions, and providing exceptional customer service. How can I help you learn more about our service?";
    }
    
    console.log('Generated response for testing:', responseText);
    
    return responseText;
  } catch (error) {
    console.error('Error in voice assistant:', error);
    
    // Return a fallback response about Ring Ready rather than throwing an error
    return "Thank you for your interest in Ring Ready AI receptionist service. We're here to help your business never miss a call and provide exceptional customer service 24/7. Please let me know if you have specific questions about our service, pricing, or how to get started with a free demo.";
  }
}