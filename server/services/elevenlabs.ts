import ElevenLabs from 'elevenlabs-node';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { promises as fsPromises } from 'fs';

// Voice ID for a professional female voice
// Using "Nicole" voice - clear, professional female voice
const VOICE_ID = "D38z5RcWu1voky8WS1ja"; 
const MODEL_ID = "eleven_monolingual_v1";

/**
 * Convert text to speech using ElevenLabs API
 * @param text - The text to convert to speech
 * @returns The URL to the generated audio file
 */
export async function textToSpeech(text: string): Promise<string> {
  try {
    console.log("Starting ElevenLabs TTS process");
    
    // Create public/audio directory if it doesn't exist
    const audioDir = path.join(process.cwd(), 'public', 'audio');
    if (!fs.existsSync(audioDir)) {
      console.log(`Creating audio directory: ${audioDir}`);
      fs.mkdirSync(audioDir, { recursive: true });
    }
    
    // Generate a unique filename based on text content
    const hash = crypto.createHash('md5').update(text).digest('hex');
    const fileName = `${hash}.mp3`;
    const filePath = path.join(audioDir, fileName);
    
    // Skip generation if file already exists to avoid unnecessary API calls
    if (fs.existsSync(filePath)) {
      console.log(`Audio file already exists: ${filePath}`);
      return `/audio/${fileName}`;
    }

    console.log(`Setting up ElevenLabs client with API key: ${process.env.ELEVENLABS_API_KEY ? 'provided' : 'missing'}`);
    
    // Set up ElevenLabs client
    const elevenLabs = new ElevenLabs({
      apiKey: process.env.ELEVENLABS_API_KEY!,
      voiceId: VOICE_ID
    });
    
    console.log(`Starting ElevenLabs TTS generation to ${filePath}`);
    
    // Generate speech from text
    const result = await elevenLabs.textToSpeech({
      voiceId: VOICE_ID,
      fileName: filePath,
      textInput: text,
      stability: 0.3,
      similarityBoost: 0.7,
      modelId: MODEL_ID,
      style: 0.0,
      speakerBoost: true
    });
    
    console.log(`TTS generation complete:`, result);

    // Return the URL to the audio file
    return `/audio/${fileName}`;
  } catch (error) {
    console.error('Error generating audio with ElevenLabs:', error);
    
    // If ElevenLabs fails, use placeholder as fallback
    console.log('Falling back to placeholder audio file');
    
    // For fallback, we'll use a simple placeholder audio file
    const placeholderPath = path.join(process.cwd(), 'public', 'audio', 'placeholder.mp3');
    if (!fs.existsSync(placeholderPath)) {
      console.log("Creating placeholder audio file as fallback");
      
      try {
        // Create a simple MP3 file with a basic header
        const header = Buffer.from([
          0x49, 0x44, 0x33, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,  // ID3v2 header
          0x54, 0x49, 0x54, 0x32, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,  // Title frame
          0x54, 0x65, 0x73, 0x74, 0x20, 0x41, 0x75, 0x64, 0x69, 0x6F   // "Test Audio"
        ]);
        
        await fsPromises.writeFile(placeholderPath, header);
        console.log(`Created placeholder audio file at: ${placeholderPath}`);
      } catch (writeError) {
        console.error('Error creating placeholder file:', writeError);
      }
    }
    
    return '/audio/placeholder.mp3';
  }
}