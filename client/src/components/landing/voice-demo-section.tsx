import { motion } from "framer-motion";
import { Volume2, Mic, MicOff, PhoneCall, PhoneOff, RefreshCw, MessageSquare } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useVoiceAssistant } from "@/hooks/use-voice-assistant";
import { cn } from "@/lib/utils";

export function VoiceDemoSection() {
  const {
    state,
    audioRef,
    startListening,
    stopListening,
    handleUserMessage,
    resetConversation,
    browserSupportsSpeechRecognition
  } = useVoiceAssistant();

  const [progress, setProgress] = useState(0);
  const [showUnsupportedMessage, setShowUnsupportedMessage] = useState(false);
  const [callActive, setCallActive] = useState(false);

  // Handle progress bar animation during audio playback
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (state.isSpeaking && audioRef.current) {
      intervalId = setInterval(() => {
        if (audioRef.current) {
          const duration = audioRef.current.duration || 1;
          const currentTime = audioRef.current.currentTime || 0;
          setProgress((currentTime / duration) * 100);
        }
      }, 50);
    } else {
      setProgress(0);
    }
    
    return () => {
      clearInterval(intervalId);
    };
  }, [state.isSpeaking, audioRef]);

  // Show speech recognition unsupported warning if needed
  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      setShowUnsupportedMessage(true);
    }
  }, [browserSupportsSpeechRecognition]);

  // Start a call
  const startCall = () => {
    setCallActive(true);
    startListening();
  };
  
  // End a call
  const endCall = () => {
    stopListening();
    setCallActive(false);
    resetConversation();
  };
  
  // Mute/unmute during call
  const toggleMic = () => {
    if (state.isListening) {
      stopListening();
    } else if (callActive) {
      startListening();
    }
  };

  // Handle sending of user message
  const submitMessage = () => {
    if (state.userMessage.trim()) {
      handleUserMessage();
    }
  };

  return (
    <section id="voice-demo" className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="max-w-3xl mx-auto text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Meet Ring Ready AI Receptionist
          </h2>
          <p className="text-xl text-gray-600 mb-6">
            Try our AI receptionist service in action. Have a conversation with Ring Ready and experience how it can transform your business communication. Ask about our services, pricing, setup process, and discover how we can help your business never miss a call.
          </p>
        </motion.div>

        <motion.div 
          className="max-w-2xl mx-auto bg-gray-50 p-8 rounded-2xl shadow-md"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Call status indicator */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex flex-col items-center">
              {callActive ? (
                <>
                  <Volume2 className={cn(
                    "h-12 w-12 mb-2",
                    state.isSpeaking ? "text-primary animate-pulse" : 
                    state.isListening ? "text-green-500" : "text-gray-400"
                  )} />
                  <span className="text-sm font-medium text-gray-600">
                    {state.isProcessing ? "Ring Ready is thinking..." : 
                     state.isSpeaking ? "Ring Ready is speaking..." : 
                     state.isListening ? "Call active - listening..." : 
                     "Call connected"}
                  </span>
                  <span className="text-xs text-primary mt-1">
                    {callActive && !state.isListening && !state.isSpeaking && !state.isProcessing && 
                      "Click microphone to speak"}
                  </span>
                </>
              ) : (
                <>
                  <PhoneCall className="h-12 w-12 mb-2 text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">
                    Ready to start call
                  </span>
                </>
              )}
            </div>
          </div>
          
          {/* Conversation display */}
          <div className="bg-white rounded-lg p-4 mb-6 shadow-inner min-h-[120px] max-h-[180px] overflow-y-auto">
            {state.userMessage && (
              <div className="mb-3">
                <div className="flex items-start">
                  <div className="bg-gray-100 rounded-lg p-3 inline-block max-w-[80%]">
                    <p className="text-gray-800 text-sm">
                      <span className="font-semibold text-primary block mb-1">You:</span>
                      {state.userMessage}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {state.assistantMessage && (
              <div>
                <div className="flex items-start justify-end">
                  <div className="bg-primary/10 rounded-lg p-3 inline-block max-w-[80%]">
                    <p className="text-gray-800 text-sm">
                      <span className="font-semibold text-primary-dark block mb-1">Ring Ready AI:</span>
                      {state.assistantMessage}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {!state.userMessage && !state.assistantMessage && (
              <p className="text-gray-500 text-center text-sm italic py-8">
                Start a conversation by clicking the microphone button below
              </p>
            )}
          </div>
          
          {/* Error message if any */}
          {state.error && (
            <div className="bg-red-50 text-red-600 p-3 mb-6 rounded-lg text-sm">
              Error: {state.error}
            </div>
          )}
          
          {/* Speech recognition not supported warning */}
          {showUnsupportedMessage && (
            <div className="bg-yellow-50 text-yellow-700 p-3 mb-6 rounded-lg text-sm">
              Your browser doesn't support speech recognition. Please try Chrome, Edge, or Safari.
            </div>
          )}
          
          {/* Audio and call controls */}
          <div className="flex items-center justify-center gap-4 mb-6">
            {!callActive ? (
              /* Start Call Button */
              <button 
                onClick={startCall}
                disabled={!browserSupportsSpeechRecognition}
                className={cn(
                  "w-14 h-14 rounded-full flex items-center justify-center shadow-md transition-all",
                  "bg-green-500 hover:bg-green-600 text-white",
                  !browserSupportsSpeechRecognition ? "opacity-50 cursor-not-allowed" : ""
                )}
              >
                <PhoneCall className="h-6 w-6" />
              </button>
            ) : (
              /* Call Active Controls */
              <>
                {/* Mute/Unmute Button */}
                <button 
                  onClick={toggleMic}
                  disabled={state.isProcessing || state.isSpeaking || !browserSupportsSpeechRecognition}
                  className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center shadow-md transition-all",
                    state.isListening 
                      ? "bg-primary hover:bg-primary-dark text-white" 
                      : "bg-gray-400 hover:bg-gray-500 text-white",
                    (state.isProcessing || state.isSpeaking || !browserSupportsSpeechRecognition) 
                      ? "opacity-50 cursor-not-allowed" 
                      : ""
                  )}
                >
                  {state.isListening ? 
                    <Mic className="h-6 w-6" /> : 
                    <MicOff className="h-6 w-6" />
                  }
                </button>
                
                {/* Progress Bar */}
                <div className="flex-1 max-w-lg">
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary h-full" 
                      style={{ 
                        width: `${progress}%`, 
                        transition: 'width 0.1s linear' 
                      }}
                    />
                  </div>
                </div>
                
                {/* End Call Button */}
                <button
                  onClick={endCall}
                  className="w-14 h-14 rounded-full flex items-center justify-center shadow-md transition-all bg-red-500 hover:bg-red-600 text-white"
                >
                  <PhoneOff className="h-6 w-6" />
                </button>
              </>
            )}
          </div>
          
          {/* Hidden audio element for playback */}
          <audio 
            ref={audioRef} 
            className="hidden"
          />
          
          {/* Submit button for when user has typed but not submitted */}
          {callActive && state.userMessage && !state.assistantMessage && !state.isProcessing && !state.isSpeaking && (
            <div className="flex justify-center mb-6">
              <button
                onClick={submitMessage}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors shadow-sm"
              >
                <MessageSquare className="h-4 w-4" />
                Send Message
              </button>
            </div>
          )}
          
          {!callActive && (
            <div className="text-center mt-4 mb-4 text-gray-600">
              <p className="font-medium">Click the green call button to start a conversation</p>
              <p className="text-sm mt-2">During the call, you can ask our AI receptionist:</p>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• "What services does Ring Ready offer?"</li>
                <li>• "How does Ring Ready work?"</li>
                <li>• "What are the benefits of using Ring Ready?"</li>
                <li>• "How much does Ring Ready cost?"</li>
              </ul>
            </div>
          )}
          
          <div className="mt-8 text-center">
            <a 
              href="#booking" 
              className="inline-block px-8 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg transition-all shadow-md"
            >
              Book a Demo
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}