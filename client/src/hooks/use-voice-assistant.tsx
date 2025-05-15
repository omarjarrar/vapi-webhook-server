import { useState, useEffect, useRef } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

type VoiceAssistantState = {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  userMessage: string;
  assistantMessage: string;
  error: string | null;
};

export function useVoiceAssistant() {
  const [state, setState] = useState<VoiceAssistantState>({
    isListening: false,
    isProcessing: false,
    isSpeaking: false,
    userMessage: '',
    assistantMessage: '',
    error: null,
  });
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  // Update userMessage from transcript and auto-submit after a brief pause
  useEffect(() => {
    let timerId: NodeJS.Timeout | undefined;
    
    if (transcript && !state.isProcessing) {
      // Log received transcript for debugging
      console.log("Received transcript:", transcript);
      
      // Always update the user message (even if speaking)
      setState(prev => ({ ...prev, userMessage: transcript }));
      
      // Auto-submit after short delay when user stops speaking
      // We allow this even when the assistant is speaking for overlapping conversation
      timerId = setTimeout(() => {
        // Only submit if still listening and transcript hasn't changed
        if (listening && transcript.trim() && !state.isProcessing) {
          console.log("Auto-submitting after silence:", transcript);
          // Ensure we have the complete, trimmed transcript when submitting
          setState(prev => ({ ...prev, userMessage: transcript.trim() }));
          handleUserMessage();
          // Reset transcript after sending to prepare for next input
          resetTranscript();
        }
      }, 1500); // Wait 1.5 seconds of silence before submitting
    }
    
    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [transcript, listening, state.isProcessing, resetTranscript]);

  // When voice stops speaking, resume listening and prepare for new input
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = () => {
        console.log("Audio playback ended, preparing for new input");
        
        // Reset speaking state
        setState(prev => ({ ...prev, isSpeaking: false }));
        
        // Reset the transcript to prepare for new input
        // only if we aren't already processing something
        if (!state.isProcessing) {
          resetTranscript();
        }
        
        // Resume listening after speaking ends
        if (state.isListening && !listening) {
          console.log("Restarting speech recognition");
          SpeechRecognition.startListening({ continuous: true });
        }
      };
    }
  }, [state.isListening, state.isProcessing, listening, resetTranscript]);

  // Stop listening when component unmounts
  useEffect(() => {
    return () => {
      if (listening) {
        SpeechRecognition.stopListening();
      }
      
      // Reset the abortController reference without calling abort
      // to prevent "signal is aborted without reason" error
      abortControllerRef.current = null;
    };
  }, [listening]);

  // Start listening
  const startListening = () => {
    if (!browserSupportsSpeechRecognition) {
      setState(prev => ({ 
        ...prev, 
        error: 'Your browser does not support speech recognition.' 
      }));
      return;
    }
    
    resetTranscript();
    setState(prev => ({ 
      ...prev, 
      isListening: true,
      error: null 
    }));
    SpeechRecognition.startListening({ continuous: true });
  };

  // Stop listening
  const stopListening = () => {
    SpeechRecognition.stopListening();
    setState(prev => ({ ...prev, isListening: false }));
    
    // Only abort if we're in the middle of a fetch request
    if (abortControllerRef.current && state.isProcessing) {
      abortControllerRef.current.abort();
    }
    // Otherwise just clear the reference
    else if (abortControllerRef.current) {
      abortControllerRef.current = null;
    }
  };

  // Handle user message and get AI response
  const handleUserMessage = async () => {
    // Get the current message to send - ensure it's captured at the moment of sending
    const messageToSend = state.userMessage.trim();
    
    if (!messageToSend) {
      console.log("No user message to process");
      return;
    }
    
    // Create a unique ID for this request to track it
    const requestId = Date.now().toString();
    console.log(`[${requestId}] Processing user message:`, messageToSend);
    
    try {
      // We'll keep speech recognition running if the assistant is speaking
      // This allows the user to speak over it without issues
      if (listening && !state.isSpeaking) {
        console.log(`[${requestId}] Pausing speech recognition during processing`);
        SpeechRecognition.stopListening();
      }
      
      // Set processing state
      setState(prev => ({ 
        ...prev, 
        isProcessing: true 
      }));

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();
      
      console.log(`[${requestId}] Sending request to voice assistant API with message:`, messageToSend);
      
      // Get AI response from server
      const response = await fetch('/api/voice-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: messageToSend  // Use the captured message
        }),
        signal: abortControllerRef.current.signal
      });
      
      console.log(`[${requestId}] Response received:`, response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[${requestId}] API error response:`, errorText);
        throw new Error(`Failed to get response from assistant: ${response.status} ${errorText}`);
      }
      
      // Get audio URL from response
      const data = await response.json();
      console.log(`[${requestId}] API response data:`, data);
      
      // Set assistant message and update state
      setState(prev => ({ 
        ...prev, 
        assistantMessage: data.text,
        isProcessing: false,
        isSpeaking: true
      }));
      
      // Resume listening if we're still on the call
      // This allows the user to start speaking again while the assistant is speaking
      if (state.isListening && !listening) {
        console.log(`[${requestId}] Resuming speech recognition while assistant speaks`);
        // Reset transcript before restarting
        resetTranscript();
        SpeechRecognition.startListening({ continuous: true });
      }
      
      // Play audio
      if (audioRef.current) {
        console.log(`[${requestId}] Playing audio from URL:`, data.audioUrl);
        audioRef.current.src = data.audioUrl;
        
        // Add event listeners for audio playback
        audioRef.current.onloadedmetadata = () => console.log(`[${requestId}] Audio metadata loaded, duration:`, audioRef.current?.duration);
        audioRef.current.oncanplay = () => console.log(`[${requestId}] Audio can play now`);
        audioRef.current.onerror = (e) => console.error(`[${requestId}] Audio error:`, e);
        
        try {
          const playPromise = audioRef.current.play();
          if (playPromise) {
            playPromise.catch(e => console.error(`[${requestId}] Audio play error:`, e));
          }
        } catch (audioError) {
          console.error(`[${requestId}] Error playing audio:`, audioError);
        }
      } else {
        console.error(`[${requestId}] Audio reference is not available`);
      }
      
    } catch (error) {
      console.error(`[${requestId}] Error in handleUserMessage:`, error);
      
      if (error instanceof Error && error.name !== 'AbortError') {
        setState(prev => ({ 
          ...prev, 
          error: error instanceof Error ? error.message : 'Unknown error',
          isProcessing: false
        }));
      } else {
        // Make sure to reset processing state even for abort errors
        setState(prev => ({ ...prev, isProcessing: false }));
      }
      
      // Resume listening if we're still in a call, regardless of error
      if (state.isListening && !listening) {
        console.log(`[${requestId}] Resuming speech recognition after error`);
        resetTranscript(); // Clear any partial transcript
        SpeechRecognition.startListening({ continuous: true });
      }
    }
  };

  // Reset the conversation
  const resetConversation = () => {
    resetTranscript();
    setState({
      isListening: false,
      isProcessing: false,
      isSpeaking: false,
      userMessage: '',
      assistantMessage: '',
      error: null,
    });
    
    if (listening) {
      SpeechRecognition.stopListening();
    }
    
    // Only abort if we're in the middle of a fetch request
    if (abortControllerRef.current && state.isProcessing) {
      abortControllerRef.current.abort();
    }
    // Just clear the reference otherwise
    else {
      abortControllerRef.current = null;
    }
  };

  return {
    state,
    audioRef,
    startListening,
    stopListening,
    handleUserMessage,
    resetConversation,
    browserSupportsSpeechRecognition
  };
}