import { useState, useEffect, useCallback } from 'react';
import { Call } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

// Define types for our stats
export type CallStats = {
  totalCalls: number;
  totalMinutes: number;
  workflowCounts: Record<string, number>;
};

// Defined types for our WebSocket message events
type WebSocketMessage = 
  | { type: 'initial_data'; data: { recentCalls: Call[]; stats: CallStats } }
  | { type: 'call_started'; data: Call }
  | { type: 'call_ended'; data: Call }
  | { type: 'call_transcription'; data: Call }
  | { type: 'call_summary'; data: Call };

/**
 * Hook for managing call data, stats, and real-time updates via WebSocket
 */
export function useCallData() {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [recentCalls, setRecentCalls] = useState<Call[]>([]);
  const [stats, setStats] = useState<CallStats>({
    totalCalls: 0,
    totalMinutes: 0,
    workflowCounts: {}
  });

  // Handle new call event
  const handleCallStarted = useCallback((call: Call) => {
    setRecentCalls(prev => {
      // Add the new call at the beginning and maintain sort order
      const updated = [call, ...prev];
      return updated.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
    
    setStats(prev => ({
      ...prev,
      totalCalls: prev.totalCalls + 1,
      workflowCounts: {
        ...prev.workflowCounts,
        [call.workflow_id || 'unknown']: (prev.workflowCounts[call.workflow_id || 'unknown'] || 0) + 1
      }
    }));
    
    toast({
      title: 'New Call',
      description: `Call started with ${call.caller_id || 'Unknown Caller'}`,
    });
  }, [toast]);
  
  // Handle call ended event
  const handleCallEnded = useCallback((call: Call) => {
    setRecentCalls(prev => {
      // Update the matching call
      return prev.map(c => c.call_id === call.call_id ? call : c);
    });
    
    // Calculate minutes only if we have a valid duration
    const durationSeconds = call.duration_seconds || 0;
    if (durationSeconds > 0) {
      setStats(prev => ({
        ...prev,
        totalMinutes: prev.totalMinutes + Math.ceil(durationSeconds / 60)
      }));
    }
    
    toast({
      title: 'Call Ended',
      description: `Call with ${call.caller_id || 'Unknown Caller'} has ended`,
    });
  }, [toast]);
  
  // Handle transcription update
  const handleCallTranscription = useCallback((call: Call) => {
    setRecentCalls(prev => {
      // Update the matching call
      return prev.map(c => c.call_id === call.call_id ? call : c);
    });
  }, []);
  
  // Handle summary update
  const handleCallSummary = useCallback((call: Call) => {
    setRecentCalls(prev => {
      // Update the matching call
      return prev.map(c => c.call_id === call.call_id ? call : c);
    });
    
    toast({
      title: 'Call Summary Available',
      description: `Summary for call with ${call.caller_id || 'Unknown Caller'} is ready`,
    });
  }, [toast]);
  
  // Handle WebSocket message events
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message = JSON.parse(event.data) as WebSocketMessage;
      
      switch (message.type) {
        case 'initial_data':
          setRecentCalls(message.data.recentCalls);
          setStats(message.data.stats);
          break;
          
        case 'call_started':
          handleCallStarted(message.data);
          break;
          
        case 'call_ended':
          handleCallEnded(message.data);
          break;
          
        case 'call_transcription':
          handleCallTranscription(message.data);
          break;
          
        case 'call_summary':
          handleCallSummary(message.data);
          break;
          
        default:
          console.log('Unknown message type:', message);
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  }, [handleCallStarted, handleCallEnded, handleCallTranscription, handleCallSummary]);
  
  // Connect to WebSocket for real-time updates
  useEffect(() => {
    // First, fetch initial data through REST API
    async function fetchInitialData() {
      try {
        // Fetch recent calls
        const callsResponse = await fetch('/api/calls?limit=10');
        const calls = await callsResponse.json();
        
        // Fetch stats
        const statsResponse = await fetch('/api/calls/stats');
        const stats = await statsResponse.json();
        
        // Update state
        setRecentCalls(calls);
        setStats(stats);
      } catch (error) {
        console.error('Error fetching initial call data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load call data',
          variant: 'destructive',
        });
      }
    }
    
    fetchInitialData();
    
    // Then, set up WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);
    
    socket.addEventListener('open', () => {
      setIsConnected(true);
      console.log('WebSocket connected');
    });
    
    socket.addEventListener('message', handleMessage);
    
    socket.addEventListener('close', () => {
      setIsConnected(false);
      console.log('WebSocket disconnected');
    });
    
    socket.addEventListener('error', (error) => {
      console.error('WebSocket error:', error);
      toast({
        title: 'Connection Error',
        description: 'Lost connection to server. Real-time updates paused.',
        variant: 'destructive',
      });
    });
    
    // Cleanup on unmount
    return () => {
      socket.close();
    };
  }, [handleMessage, toast]);
  
  // Fetch a specific call by ID
  const getCallById = useCallback(async (callId: string): Promise<Call | null> => {
    try {
      const response = await fetch(`/api/calls/${callId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch call');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching call:', error);
      return null;
    }
  }, []);
  
  // Refresh calls data manually
  const refreshCallData = useCallback(async () => {
    try {
      // Fetch recent calls
      const callsResponse = await fetch('/api/calls?limit=10');
      const calls = await callsResponse.json();
      
      // Fetch stats
      const statsResponse = await fetch('/api/calls/stats');
      const stats = await statsResponse.json();
      
      // Update state
      setRecentCalls(calls);
      setStats(stats);
      
      return { calls, stats };
    } catch (error) {
      console.error('Error refreshing call data:', error);
      toast({
        title: 'Error',
        description: 'Failed to refresh call data',
        variant: 'destructive',
      });
      return null;
    }
  }, [toast]);
  
  return {
    isConnected,
    recentCalls,
    stats,
    getCallById,
    refreshCallData
  };
}