import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  PhoneCall, 
  CalendarCheck, 
  User, 
  MessageCircle, 
  BarChart, 
  Settings,
  ArrowRight,
  Bell,
  Users,
  LogOut,
  RefreshCw
} from "lucide-react";
import { useState, useEffect } from "react";
import { useCallData } from "@/hooks/use-call-data";
import { CallStatsDisplay } from "@/components/dashboard/call-stats";
import { CallList } from "@/components/dashboard/call-list";

export default function DashboardPage() {
  const { user, logoutMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [refreshing, setRefreshing] = useState(false);
  
  // Use our custom hook for call data
  const callData = useCallData();
  
  // Handle manual refresh button
  useEffect(() => {
    if (refreshing) {
      const fetchData = async () => {
        await callData.refreshCallData();
        setRefreshing(false);
      };
      
      fetchData();
    }
  }, [refreshing, callData]);

  // Fake data for dashboard display
  const stats = {
    callsAnswered: 127,
    appointmentsBooked: 43,
    leadsQualified: 38,
    missedCalls: 3,
    callDuration: "2:30",
    responseRate: "97%"
  };

  const recentCalls = [
    { id: 1, name: "John Smith", number: "(555) 123-4567", time: "Today at 10:30 AM", status: "Appointment Booked" },
    { id: 2, name: "Sarah Johnson", number: "(555) 876-5432", time: "Today at 9:15 AM", status: "Lead Qualified" },
    { id: 3, name: "Mark Williams", number: "(555) 234-5678", time: "Yesterday at 3:45 PM", status: "Message Left" },
    { id: 4, name: "Emily Davis", number: "(555) 345-6789", time: "Yesterday at 1:20 PM", status: "Appointment Booked" },
  ];

  const upcomingAppointments = [
    { id: 1, name: "John Smith", service: "Consultation", time: "Today at 2:00 PM" },
    { id: 2, name: "Emily Davis", service: "Follow-up", time: "Tomorrow at 10:30 AM" },
    { id: 3, name: "Michael Johnson", service: "Initial Assessment", time: "May 15, 11:00 AM" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-white border-r">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">
            <span className="text-primary">Ring</span>
            <span className="text-primary-dark">Ready</span>
          </h1>
        </div>
        
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            <li>
              <Button 
                variant={activeTab === "overview" ? "default" : "ghost"} 
                className="w-full justify-start" 
                onClick={() => setActiveTab("overview")}
              >
                <BarChart className="mr-2 h-4 w-4" />
                Overview
              </Button>
            </li>
            <li>
              <Button 
                variant={activeTab === "calls" ? "default" : "ghost"} 
                className="w-full justify-start" 
                onClick={() => setActiveTab("calls")}
              >
                <PhoneCall className="mr-2 h-4 w-4" />
                Calls
              </Button>
            </li>
            <li>
              <Button 
                variant={activeTab === "appointments" ? "default" : "ghost"} 
                className="w-full justify-start" 
                onClick={() => setActiveTab("appointments")}
              >
                <CalendarCheck className="mr-2 h-4 w-4" />
                Appointments
              </Button>
            </li>
            <li>
              <Button 
                variant={activeTab === "leads" ? "default" : "ghost"} 
                className="w-full justify-start" 
                onClick={() => setActiveTab("leads")}
              >
                <Users className="mr-2 h-4 w-4" />
                Leads
              </Button>
            </li>
            <li>
              <Button 
                variant={activeTab === "messages" ? "default" : "ghost"} 
                className="w-full justify-start" 
                onClick={() => setActiveTab("messages")}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Messages
              </Button>
            </li>
            <li>
              <Button 
                variant={activeTab === "settings" ? "default" : "ghost"} 
                className="w-full justify-start" 
                onClick={() => setActiveTab("settings")}
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </li>
          </ul>
        </nav>
        
        <div className="p-4 border-t">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {logoutMutation.isPending ? "Logging out..." : "Log out"}
          </Button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">Dashboard</h1>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
              </Button>
              
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mr-2">
                  <User className="h-4 w-4" />
                </div>
                <span className="font-medium">{user?.username}</span>
              </div>
            </div>
          </div>
        </header>
        
        {/* Main content area */}
        <main className="flex-1 p-6 overflow-auto">
          <div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsContent value="overview" className="space-y-6">
                <h2 className="text-2xl font-bold">Welcome, {user?.username}!</h2>
                <p className="text-gray-600">Here's what's been happening with your virtual receptionist.</p>
                
                {/* Stats grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-500">Calls Answered</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{stats.callsAnswered}</div>
                      <p className="text-sm text-green-600 mt-1">+12% from last month</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-500">Appointments Booked</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{stats.appointmentsBooked}</div>
                      <p className="text-sm text-green-600 mt-1">+8% from last month</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-500">Leads Qualified</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{stats.leadsQualified}</div>
                      <p className="text-sm text-green-600 mt-1">+15% from last month</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-500">Missed Calls</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{stats.missedCalls}</div>
                      <p className="text-sm text-red-600 mt-1">-2 from last month</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-500">Avg. Call Duration</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{stats.callDuration}</div>
                      <p className="text-sm text-gray-500 mt-1">minutes</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-500">Response Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{stats.responseRate}</div>
                      <p className="text-sm text-green-600 mt-1">+2% from last month</p>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Recent calls list */}
                <div className="mt-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Calls</CardTitle>
                      <CardDescription>Your latest call activity</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recentCalls.map(call => (
                          <div key={call.id} className="border-b pb-4 last:border-0 last:pb-0">
                            <div className="flex justify-between">
                              <div>
                                <h4 className="font-medium">{call.name}</h4>
                                <p className="text-sm text-gray-500">{call.number}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-500">{call.time}</p>
                                <p className="text-sm font-medium text-primary">{call.status}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="ghost" className="w-full">
                        View all calls <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
                
                {/* Upcoming appointments */}
                <div className="mt-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>Upcoming Appointments</CardTitle>
                      <CardDescription>Scheduled appointments for the next few days</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {upcomingAppointments.map(appointment => (
                          <div key={appointment.id} className="border-b pb-4 last:border-0 last:pb-0">
                            <div className="flex justify-between">
                              <div>
                                <h4 className="font-medium">{appointment.name}</h4>
                                <p className="text-sm text-gray-500">{appointment.service}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-500">{appointment.time}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="ghost" className="w-full">
                        View all appointments <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="calls">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">Call Activity</h2>
                      <p className="text-gray-600">Real-time call data</p>
                    </div>
                    <Button onClick={() => setRefreshing(true)} disabled={refreshing} variant="outline">
                      {refreshing ? 
                        <><span className="mr-2">Refreshing...</span></> : 
                        <><span className="mr-2">Refresh Data</span></>}
                    </Button>
                  </div>
                  
                  {/* Call stats section */}
                  <CallStatsDisplay stats={callData.stats} isLoading={refreshing} />
                  
                  {/* Call list section */}
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-4">Recent Calls</h3>
                    <CallList calls={callData.recentCalls} isLoading={refreshing} />
                  </div>
                  
                  {/* Connection status */}
                  <div className="flex items-center mt-4 text-sm">
                    <div className={`h-2 w-2 rounded-full mr-2 ${callData.isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-gray-600">
                      {callData.isConnected ? 
                        'Connected: Receiving real-time updates' : 
                        'Disconnected: Real-time updates paused'}
                    </span>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="appointments">
                <h2 className="text-2xl font-bold mb-6">Appointment Management</h2>
                <p className="text-gray-600 mb-6">Manage your appointments, set availability, and configure your booking preferences here.</p>
                <Card>
                  <CardHeader>
                    <CardTitle>Coming Soon</CardTitle>
                    <CardDescription>This section is under development</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Enhanced appointment management features will be available in the next update.</p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="leads">
                <h2 className="text-2xl font-bold mb-6">Lead Management</h2>
                <p className="text-gray-600 mb-6">Track and manage your qualified leads, set custom qualification criteria, and export lead data.</p>
                <Card>
                  <CardHeader>
                    <CardTitle>Coming Soon</CardTitle>
                    <CardDescription>This section is under development</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Enhanced lead management features will be available in the next update.</p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="messages">
                <h2 className="text-2xl font-bold mb-6">Message Center</h2>
                <p className="text-gray-600 mb-6">View SMS follow-ups, voicemail transcriptions, and manage your message templates.</p>
                <Card>
                  <CardHeader>
                    <CardTitle>Coming Soon</CardTitle>
                    <CardDescription>This section is under development</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Enhanced messaging features will be available in the next update.</p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="settings">
                <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
                <p className="text-gray-600 mb-6">Manage your account settings, subscription, and billing information.</p>
                <Card>
                  <CardHeader>
                    <CardTitle>Coming Soon</CardTitle>
                    <CardDescription>This section is under development</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Enhanced account management features will be available in the next update.</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}