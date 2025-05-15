import { CohereClient } from "cohere-ai";

// Initialize Cohere client
const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

// Define types for Cohere chat history
type CohereMessage = {
  role: "USER" | "CHATBOT";
  message: string;
};

// Knowledge about Ring Ready to include in context
const siteKnowledge = `
Ring Ready is an AI receptionist service for service-based businesses like home services, salons, real estate, and clinics.
It helps small business owners by automatically answering client calls, reducing missed business opportunities.
Benefits include:
- 24/7 call answering
- Appointment scheduling
- Automated lead capture
- Integration with existing systems
- Significant cost savings compared to a human receptionist
- Improved customer experience

The service offers a 14-day free trial with no credit card required.
A typical business can save 20-40% on receptionist costs while capturing 80% more leads.

Pricing starts at $99/month for small businesses.
To book a demo, we need their name, email, business type, and preferred contact time.
`;

// Prompt to guide the assistant
const systemPrompt = `
You're the AI assistant for Ring Ready, an AI receptionist service for small businesses.
Your primary goals are to:
1. Answer questions about Ring Ready services and benefits
2. Help schedule demos for interested users
3. Provide information on pricing
4. Explain how the AI receptionist works

When users show interest, encourage them to book a demo. For demos, collect:
- Name
- Email
- Business type
- Preferred contact time

Here's information about Ring Ready:
${siteKnowledge}

Keep responses friendly, concise (under 3-4 sentences), and professional.
Always encourage scheduling a demo for more detailed information.
The current date is ${new Date().toDateString()}.
`;

// Types for chat messages
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Process a user message and generate a response using Cohere
 */
export async function processMessage(
  message: string,
  history: ChatMessage[] = []
): Promise<string> {
  try {
    // Prepare chat history for Cohere
    let chatHistory: CohereMessage[] | undefined = undefined;
    
    if (history.length > 0) {
      chatHistory = history.map(msg => ({
        role: msg.role === 'assistant' ? 'CHATBOT' as const : 'USER' as const,
        message: msg.content
      }));
    }
    
    // Add system message as preamble
    let preamble = systemPrompt;
    
    // Call the Cohere API
    const response = await cohere.chat({
      message,
      chatHistory,
      preamble,
      model: "command",
      temperature: 0.7,
      maxTokens: 600,
      connectors: [{ id: "web-search" }],
    });

    // Return the assistant's message
    return response.text || "I'm sorry, I couldn't process your request.";
  } catch (error) {
    console.error('Error processing message with Cohere:', error);
    throw new Error('Failed to process your message. Please try again later.');
  }
}