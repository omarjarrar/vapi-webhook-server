declare module 'react-speech-recognition' {
  export interface SpeechRecognitionOptions {
    continuous?: boolean;
    interimResults?: boolean;
    lang?: string;
  }

  export interface SpeechRecognitionHookResult {
    transcript: string;
    listening: boolean;
    resetTranscript: () => void;
    browserSupportsSpeechRecognition: boolean;
  }

  export function useSpeechRecognition(): SpeechRecognitionHookResult;

  const SpeechRecognition: {
    startListening: (options?: SpeechRecognitionOptions) => void;
    stopListening: () => void;
    abortListening: () => void;
  };

  export default SpeechRecognition;
}