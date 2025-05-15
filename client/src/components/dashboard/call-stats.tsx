import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CallStats } from "@/hooks/use-call-data";
import { Phone, Clock, List } from "lucide-react";

interface CallStatsProps {
  stats: CallStats;
  isLoading?: boolean;
}

export function CallStatsDisplay({ stats, isLoading = false }: CallStatsProps) {
  // Find the most used workflow
  let mostUsedWorkflow = { id: 'None', count: 0 };
  
  Object.entries(stats.workflowCounts).forEach(([id, count]) => {
    if (count > mostUsedWorkflow.count) {
      mostUsedWorkflow = { id, count };
    }
  });
  
  // Format workflow ID to be more readable
  const formatWorkflowId = (id: string) => {
    // Extract just the first part of a UUID if present
    if (id.includes('-')) {
      return id.split('-')[0];
    }
    // Truncate very long IDs
    if (id.length > 15) {
      return id.substring(0, 12) + '...';
    }
    return id;
  };

  // Stats cards with subtle loading state
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className={isLoading ? "opacity-70" : ""}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
          <Phone className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCalls}</div>
          <p className="text-xs text-muted-foreground">
            All time call volume
          </p>
        </CardContent>
      </Card>
      
      <Card className={isLoading ? "opacity-70" : ""}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Minutes</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalMinutes}</div>
          <p className="text-xs text-muted-foreground">
            Minutes of conversation
          </p>
        </CardContent>
      </Card>
      
      <Card className={isLoading ? "opacity-70" : ""}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Most Used Workflow</CardTitle>
          <List className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {mostUsedWorkflow.id !== 'None' 
              ? formatWorkflowId(mostUsedWorkflow.id) 
              : 'None'}
          </div>
          <p className="text-xs text-muted-foreground">
            {mostUsedWorkflow.count} calls processed
          </p>
        </CardContent>
      </Card>
    </div>
  );
}