import { CohereClient } from 'cohere-ai';

// Initialize the Cohere client with API key
const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY!,
});

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
 * Generate a response using Cohere's API
 * @param userMessage - The message from the user
 * @returns The assistant's response
 */
export async function generateAssistantResponse(userMessage: string): Promise<string> {
  try {
    // Generate chat response
    const response = await cohere.chat({
      message: userMessage,
      model: 'command',
      preamble: SYSTEM_PROMPT,
      temperature: 0.7,
    });

    // Return the response text
    return response.text;
  } catch (error) {
    console.error('Error generating Cohere response:', error);
    throw new Error('Failed to generate assistant response');
  }
}