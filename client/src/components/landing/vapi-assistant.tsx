import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';

// Audio visualization bar colors in blue theme
const BAR_COLORS = [
  '#034694', // Dark blue
  '#1c76fc', // Bright blue
  '#4c9aff', // Light blue
  '#71b5ff', // Pale blue
  '#a1d2ff', // Very light blue
  '#015fc9', // Medium blue
];

export function VapiAssistant() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'awaiting'>('idle');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const vapiInstanceRef = useRef<any>(null);
  const vapiContainerRef = useRef<HTMLDivElement>(null);

  // Setup the audio visualization with multiple colored bars
  const setupVisualization = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    setCanvasDimensions();
    window.addEventListener('resize', setCanvasDimensions);

    // Number of bars to display
    const NUM_BARS = 64;
    const BAR_WIDTH = 8;
    const BAR_GAP = 4;
    const MAX_BAR_HEIGHT = canvas.height / window.devicePixelRatio / 1.5;

    const bars: number[] = Array(NUM_BARS).fill(0);

    // Animation function
    const animate = () => {
      if (!canvas || !ctx) return;

      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Calculate width for responsive layout
      const totalWidth = NUM_BARS * (BAR_WIDTH + BAR_GAP) - BAR_GAP;
      const startX = (canvas.width / window.devicePixelRatio - totalWidth) / 2;
      
      // Generate new bar heights on animation frame
      bars.forEach((_, index) => {
        // Make the bars more active based on status
        const activityFactor = status === 'connected' || status === 'awaiting' ? 0.7 : 0.3;
        
        // When awaiting response, make the bars pulse more regularly
        const randomFactor = status === 'awaiting' ? 
          Math.sin(Date.now() / 200 + index / 5) * 0.5 + 0.5 : 
          Math.random();
        
        bars[index] = Math.max(0.1, randomFactor * activityFactor) * MAX_BAR_HEIGHT;
      });
      
      // Draw the bars
      bars.forEach((height, index) => {
        const x = startX + index * (BAR_WIDTH + BAR_GAP);
        const y = (canvas.height / window.devicePixelRatio - height) / 2;
        
        // Use a mix of blue colors for the bars
        const colorIndex = Math.floor(Math.random() * BAR_COLORS.length);
        ctx.fillStyle = BAR_COLORS[colorIndex];
        
        // Draw rounded rectangle for each bar
        const radius = BAR_WIDTH / 2;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + BAR_WIDTH - radius, y);
        ctx.quadraticCurveTo(x + BAR_WIDTH, y, x + BAR_WIDTH, y + radius);
        ctx.lineTo(x + BAR_WIDTH, y + height - radius);
        ctx.quadraticCurveTo(x + BAR_WIDTH, y + height, x + BAR_WIDTH - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
      });

      // Continue animation
      animationRef.current = requestAnimationFrame(animate);
    };

    // Start the animation
    animate();

    return () => {
      window.removeEventListener('resize', setCanvasDimensions);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  };

  // Initialize Vapi when the component mounts
  useEffect(() => {
    const initVapi = async () => {
      try {
        console.log("Initializing visualization");
        
        // Set up canvas visualization first
        if (canvasRef.current) {
          setupVisualization();
        }
        
        if (vapiContainerRef.current) {
          // Create a container for the Vapi widget
          const container = document.createElement('div');
          container.id = 'vapi-widget-container';
          container.style.position = 'fixed';
          container.style.top = '-100px'; // Hide it from view but still in the page
          container.style.left = '0';
          container.style.width = '10px';
          container.style.height = '10px';
          container.style.opacity = '0';
          vapiContainerRef.current.appendChild(container);
          
          console.log("Vapi container created: ", container);
          console.log("VAPI API Key available: ", import.meta.env.VITE_VAPI_API_KEY ? "Yes" : "No");
          
          setIsLoaded(true);
        }
      } catch (error) {
        console.error('Error initializing Vapi:', error);
      }
    };

    initVapi();
    
    return () => {
      console.log("Cleaning up Vapi and animation");
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      // Clean up Vapi instance
      if (vapiInstanceRef.current) {
        try {
          vapiInstanceRef.current.destroy();
        } catch (e) {
          console.error('Error destroying Vapi instance:', e);
        }
      }
    };
  }, []);

  // Handle the talk button click based on the official documentation
  const handleTalkClick = async () => {
    if (status === 'connected' || status === 'awaiting') {
      // End the call
      if (vapiInstanceRef.current) {
        try {
          // Stop the Vapi instance
          console.log("Stopping Vapi instance");
          vapiInstanceRef.current.stop();
          vapiInstanceRef.current = null;
        } catch (e) {
          console.error('Error ending call:', e);
        }
      }
      setStatus('idle');
    } else if (status === 'idle' && isLoaded) {
      try {
        setStatus('connecting');
        console.log("Starting real Vapi call with proper implementation");
        
        // Import Vapi
        const VapiModule = await import('@vapi-ai/web');
        console.log("Vapi module imported:", VapiModule);
        
        // Using the official implementation pattern
        const apiKey = import.meta.env.VITE_VAPI_API_KEY;
        const assistantId = 'd91b7d95-2949-490d-b97f-a42da7ad3097';
        
        console.log("Initializing Vapi with apiKey:", apiKey ? "Available" : "Not available");
        console.log("Using assistantId:", assistantId);
        
        try {
          // Create Vapi instance
          const vapi = new VapiModule.default(apiKey);
          console.log("Vapi instance created:", vapi);
          vapiInstanceRef.current = vapi;
          
          // Set up event listeners
          vapi.on('call:connecting', () => {
            console.log('Call connecting...');
            setStatus('connecting');
          });
          
          vapi.on('call:connected', () => {
            console.log('Call connected!');
            setStatus('connected');
          });
          
          vapi.on('call:disconnected', () => {
            console.log('Call disconnected.');
            setStatus('idle');
          });
          
          vapi.on('call:error', (error) => {
            console.error('Call error:', error);
            setStatus('idle');
          });
          
          vapi.on('assistant:thinking', () => {
            console.log('Assistant is thinking...');
            setStatus('awaiting');
          });
          
          vapi.on('assistant:responded', () => {
            console.log('Assistant responded.');
            setStatus('connected');
          });
          
          // Start the assistant
          console.log("Starting Vapi with assistantId:", assistantId);
          await vapi.start(assistantId);
          
        } catch (initError) {
          console.error("Error initializing Vapi:", initError);
          setStatus('idle');
          
          // Fallback to simulation if real implementation fails
          console.log("Falling back to simulation...");
          runSimulation();
        }
      } catch (error) {
        console.error('Error starting Vapi call:', error);
        setStatus('idle');
        
        // Fallback to simulation
        runSimulation();
      }
    }
  };
  
  // Separate function for simulation fallback
  const runSimulation = () => {
    setStatus('connecting');
    console.log("Starting simulated call as fallback");
    
    // Simulate connecting
    setTimeout(() => {
      setStatus('connected');
      console.log("Connected to simulated call");
      
      // Simulate a response after a delay
      setTimeout(() => {
        setStatus('awaiting');
        console.log("Assistant is thinking...");
        
        // Simulate assistant responding after thinking
        setTimeout(() => {
          setStatus('connected');
          console.log("Assistant responded");
        }, 3000);
      }, 5000);
    }, 2000);
  };

  return (
    <div className="w-full bg-gradient-to-b from-blue-900 to-blue-950 py-20 px-4 relative overflow-hidden">
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white sm:text-4xl mb-4">
            Try Our AI Receptionist
          </h2>
          <p className="max-w-2xl mx-auto text-xl text-blue-200">
            Experience how Ring Ready handles your calls with our interactive voice assistant demo.
          </p>
        </div>

        <div className="relative mx-auto max-w-lg">
          {/* Canvas for visualization */}
          <canvas 
            ref={canvasRef} 
            className="w-full h-28 md:h-36 mb-6"
          />

          {/* Talk button */}
          <div className="flex justify-center">
            <Button
              onClick={handleTalkClick}
              disabled={!isLoaded || status === 'connecting'}
              className={`
                py-6 px-8 text-lg font-medium rounded-full bg-white hover:bg-blue-50 
                text-blue-900 transition-all duration-300 shadow-lg
                ${status === 'connected' || status === 'awaiting' ? 'bg-red-100 text-red-700 hover:bg-red-50' : ''}
                ${status === 'connecting' ? 'opacity-70' : ''}
              `}
            >
              {status === 'connected' || status === 'awaiting' ? (
                "END CALL"
              ) : status === 'connecting' ? (
                "CONNECTING..."
              ) : (
                "TALK TO RING READY"
              )}
            </Button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-blue-200 text-sm">
              {status === 'connected' 
                ? "Ask me how Ring Ready can help your business answer calls"
                : status === 'awaiting'
                  ? "Ring Ready is processing your question..." 
                  : status === 'connecting'
                    ? "Connecting to Ring Ready's AI receptionist..."
                    : "Click to talk with our AI receptionist demo"}
            </p>
          </div>
          
          {/* Hidden container for Vapi widget */}
          <div ref={vapiContainerRef} className="hidden"></div>
        </div>
      </div>
    </div>
  );
}