import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, X, MessageSquare, Loader2 } from 'lucide-react';

// Types for our chat messages
type MessageType = 'user' | 'assistant';

interface ChatMessage {
  type: MessageType;
  content: string;
  timestamp: Date;
}

// Placeholder site knowledge to use in prompts
const siteKnowledge = `
Ring Ready is an AI receptionist service for service-based businesses like home services, salons, real estate, and clinics.
It helps small business owners by automatically answering client calls and reducing missed business opportunities.
Benefits include:
- 24/7 call answering
- Appointment scheduling
- Automated lead capture
- Integration with existing systems
- Significant cost savings compared to a human receptionist
- Improved customer experience

The service offers a 14-day free trial with no credit card required.
A typical business can save 20-40% on receptionist costs while capturing 80% more leads.
`;

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Initial greeting message when chat is opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          type: 'assistant',
          content: "Hi there! I'm Ring Ready's assistant. How can I help you today? I can tell you about our services, pricing, or even schedule a demo for you.",
          timestamp: new Date()
        }
      ]);
    }
  }, [isOpen, messages.length]);
  
  // Scroll to bottom of messages when new ones are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Handle sending a message
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    // Add user message to chat
    const userMessage = {
      type: 'user' as MessageType,
      content: inputValue.trim(),
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      // Send message to API for processing with OpenAI
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content
          }))
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response');
      }
      
      const data = await response.json();
      
      // Add assistant response to chat
      setMessages(prevMessages => [
        ...prevMessages,
        {
          type: 'assistant',
          content: data.message,
          timestamp: new Date()
        }
      ]);
    } catch (error) {
      console.error('Error in chat:', error);
      
      // Add error message if the API call fails
      setMessages(prevMessages => [
        ...prevMessages,
        {
          type: 'assistant',
          content: "I'm sorry, I'm having trouble responding right now. Please try again or contact us directly.",
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle input submission via Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  return (
    <>
      {/* Chat toggle button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 p-0 flex items-center justify-center shadow-lg hover:shadow-xl z-50 bg-blue-600 hover:bg-blue-700"
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </Button>
      
      {/* Chat widget */}
      <div 
        className={`fixed bottom-24 right-6 w-[350px] sm:w-[420px] md:w-[450px] transition-all duration-300 z-40 ${
          isOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'
        }`}
      >
        <Card className="shadow-xl border-blue-100 max-h-[80vh] flex flex-col">
          <CardHeader className="bg-blue-600 text-white rounded-t-lg p-4 flex-shrink-0">
            <CardTitle className="text-lg flex items-center gap-2">
              <Avatar className="h-8 w-8 bg-white">
                <AvatarImage src="/images/ring-ready-logo.svg" alt="Ring Ready" />
                <AvatarFallback className="text-blue-600">RR</AvatarFallback>
              </Avatar>
              Ring Ready Assistant
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-0 flex-grow overflow-hidden flex flex-col min-h-0">
            {/* Chat messages area */}
            <div className="flex-grow overflow-y-auto p-4 flex flex-col gap-3 h-[350px] sm:h-[400px]">
              {messages.map((message, index) => (
                <div 
                  key={index}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} break-words`}
                >
                  <div 
                    className={`max-w-[90%] px-4 py-2 rounded-lg break-words whitespace-pre-wrap ${
                      message.type === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-gray-100 text-gray-800 rounded-tl-none'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[90%] p-3 bg-gray-100 rounded-lg rounded-tl-none flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <span className="text-sm text-gray-500">Typing...</span>
                  </div>
                </div>
              )}
              
              {/* Empty div for scrolling to bottom */}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
          
          <CardFooter className="p-3 border-t">
            <div className="flex w-full gap-2">
              <Textarea
                placeholder="Type your message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                className="flex-1 min-h-[50px] max-h-[100px] resize-none"
                rows={2}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                size="icon"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}