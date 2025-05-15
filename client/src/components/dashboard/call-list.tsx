import { useState } from "react";
import { format } from "date-fns";
import { Call } from "@shared/schema";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Phone, 
  CalendarClock, 
  Clock, 
  User, 
  FileText, 
  Info, 
  AlertCircle 
} from "lucide-react";

interface CallListProps {
  calls: Call[];
  isLoading?: boolean;
}

export function CallList({ calls, isLoading = false }: CallListProps) {
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Function to format call duration
  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return "N/A";
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes === 0) {
      return `${remainingSeconds}s`;
    }
    
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Function to get appropriate call status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "started":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">In Progress</Badge>;
      case "ended":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Ended</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Function to format date
  const formatDate = (dateString?: string | Date | null) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "MMM d, yyyy h:mm a");
  };

  // Function to truncate text with ellipsis
  const truncateText = (text?: string | null, maxLength = 80) => {
    if (!text) return "Not available";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Function to handle viewing call details
  const handleViewDetails = (call: Call) => {
    setSelectedCall(call);
    setIsDialogOpen(true);
  };

  return (
    <>
      <div className={`rounded-md border ${isLoading ? "opacity-70" : ""}`}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Caller</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Summary</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {calls.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Phone className="h-8 w-8 mb-2 opacity-50" />
                    <p>No calls recorded yet</p>
                    <p className="text-sm">New calls will appear here as they come in</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              calls.map((call) => (
                <TableRow key={call.call_id}>
                  <TableCell>{getStatusBadge(call.status || "unknown")}</TableCell>
                  <TableCell>
                    <div className="font-medium">{call.caller_id || "Unknown"}</div>
                  </TableCell>
                  <TableCell>{formatDate(call.start_time)}</TableCell>
                  <TableCell>{formatDuration(call.duration_seconds)}</TableCell>
                  <TableCell className="max-w-xs">
                    {truncateText(call.summary)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(call)}
                    >
                      <Info className="h-4 w-4 mr-1" />
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Call details dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedCall && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Call Details
                </DialogTitle>
                <DialogDescription>
                  Call ID: {selectedCall.call_id}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Caller
                  </div>
                  <div className="rounded-md border p-3">
                    {selectedCall.caller_id || "Unknown Caller"}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <CalendarClock className="h-4 w-4 text-muted-foreground" />
                    Time
                  </div>
                  <div className="rounded-md border p-3">
                    {formatDate(selectedCall.start_time)}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    Duration
                  </div>
                  <div className="rounded-md border p-3">
                    {formatDuration(selectedCall.duration_seconds)}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    Status
                  </div>
                  <div className="rounded-md border p-3">
                    {getStatusBadge(selectedCall.status || "unknown")}
                  </div>
                </div>
              </div>

              {/* Summary section */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Summary
                </div>
                <div className="rounded-md border p-4 whitespace-pre-wrap">
                  {selectedCall.summary || "No summary available yet."}
                </div>
              </div>

              {/* Transcription section, collapsible for long transcripts */}
              {selectedCall.transcription && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    Transcription
                  </div>
                  <div className="rounded-md border p-4 max-h-64 overflow-y-auto whitespace-pre-wrap">
                    {selectedCall.transcription || "No transcription available."}
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}