declare module 'elevenlabs-node' {
  interface ElevenLabsOptions {
    apiKey: string;
    voiceId?: string;
  }

  interface TextToSpeechOptions {
    voiceId?: string;
    fileName: string;
    textInput: string;
    stability?: number;
    similarityBoost?: number;
    modelId?: string;
    style?: number;
    speakerBoost?: boolean;
  }

  class ElevenLabs {
    constructor(options: ElevenLabsOptions);
    textToSpeech(options: TextToSpeechOptions): Promise<{status: string, fileName: string}>;
    getUserInfo(): Promise<any>;
    getUserSubscription(): Promise<any>;
  }

  export default ElevenLabs;
}