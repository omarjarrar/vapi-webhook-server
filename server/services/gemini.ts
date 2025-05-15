import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

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
 * Generate a response using Google's Gemini model
 * @param userMessage - The message from the user
 * @returns The assistant's response
 */
export async function generateAssistantResponse(userMessage: string): Promise<string> {
  try {
    console.log('Generating response with Gemini for:', userMessage);
    
    // Get the generative model (Gemini Pro)
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-pro',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 250,
        topP: 0.8,
        topK: 40,
      }
    });

    // Prepare the prompt - shorter and more direct
    const prompt = `You are Ring Ready, an AI receptionist for a plumbing company. Be helpful, friendly, and concise.
    
Customer question: ${userMessage}

Your professional response (keep it under 3 sentences):`;

    console.log('Using prompt:', prompt);

    // Generate the response
    const result = await model.generateContent(prompt);
    console.log('Gemini result object:', JSON.stringify(result, null, 2).substring(0, 200) + '...');
    
    const response = result.response;
    const responseText = response.text();
    
    console.log('Generated response from Gemini:', responseText);
    
    // Get the response text
    return responseText;
  } catch (error) {
    console.error('Error generating Gemini response:', error);
    // More detailed error handling
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack);
      throw new Error(`Gemini API error: ${error.message}`);
    }
    throw new Error('Failed to generate assistant response');
  }
}