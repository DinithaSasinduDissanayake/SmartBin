// frontend/src/components/ui/UserDataDisplay.jsx
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Demo component for displaying user data with shadcn/ui components
 * This component demonstrates how to use multiple shadcn/ui components together
 */
const UserDataDisplay = ({ users = [] }) => {
  // Default sample data if no users are provided
  const sampleUsers = users.length > 0 ? users : [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
      role: "Administrator",
      status: "Active",
      lastLogin: "2025-04-30T12:00:00",
      avatar: "https://api.dicebear.com/6.x/initials/svg?seed=JD",
      details: {
        phone: "+1 (555) 123-4567",
        department: "IT Department",
        location: "New York",
        joinDate: "2024-01-15",
      },
      notes: [
        { id: 1, title: "Project Assignment", content: "Assigned to Smart City Waste Management project" },
        { id: 2, title: "Performance Review", content: "Excellent technical skills, meets all deadlines" },
      ]
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@example.com",
      role: "Manager",
      status: "Inactive",
      lastLogin: "2025-04-25T09:15:00",
      avatar: "https://api.dicebear.com/6.x/initials/svg?seed=JS",
      details: {
        phone: "+1 (555) 987-6543",
        department: "Operations",
        location: "Boston",
        joinDate: "2023-11-03",
      },
      notes: [
        { id: 1, title: "Vacation Schedule", content: "Approved vacation from May 15-22, 2025" },
        { id: 2, title: "Training Completion", content: "Completed leadership training program" },
      ]
    },
    {
      id: 3,
      name: "Alex Johnson",
      email: "alex.johnson@example.com",
      role: "User",
      status: "Active",
      lastLogin: "2025-05-01T10:30:00",
      avatar: "https://api.dicebear.com/6.x/initials/svg?seed=AJ",
      details: {
        phone: "+1 (555) 456-7890",
        department: "Marketing",
        location: "Los Angeles",
        joinDate: "2024-03-10",
      },
      notes: [
        { id: 1, title: "Project Status", content: "Current project is 75% complete, on schedule" },
      ]
    },
  ];

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>User Management Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="table" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="table">Table View</TabsTrigger>
              <TabsTrigger value="cards">Card View</TabsTrigger>
              <TabsTrigger value="details">Detailed View</TabsTrigger>
            </TabsList>
            
            {/* Table View */}
            <TabsContent value="table">
              <Table>
                <TableCaption>A list of users in the system</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          {user.name}
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.status}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(user.lastLogin).toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <Button variant="ghost" size="sm">
                              View Details
                            </Button>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-80">
                            <div className="flex justify-between space-x-4">
                              <Avatar>
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <div className="space-y-1">
                                <h4 className="text-sm font-semibold">{user.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {user.role} at {user.details.department}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {user.details.location}
                                </p>
                                <div className="flex items-center pt-2">
                                  <span className="text-xs text-muted-foreground">
                                    Joined on {new Date(user.details.joinDate).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            
            {/* Card View */}
            <TabsContent value="cards">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sampleUsers.map((user) => (
                  <Card key={user.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Avatar>
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{user.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">{user.role}</p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.status}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Email</span>
                          <span className="text-sm">{user.email}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Department</span>
                          <span className="text-sm">{user.details.department}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Location</span>
                          <span className="text-sm">{user.details.location}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Last Login</span>
                          <span className="text-sm">{new Date(user.lastLogin).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex justify-end mt-4">
                        <Button variant="outline" size="sm">View Profile</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            {/* Detailed View */}
            <TabsContent value="details">
              <Accordion type="single" collapsible className="w-full">
                {sampleUsers.map((user) => (
                  <AccordionItem key={user.id} value={`user-${user.id}`}>
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <span>{user.name}</span>
                        <span className="text-muted-foreground text-sm">({user.role})</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pl-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-semibold mb-2">Contact Information</h4>
                            <div className="space-y-1">
                              <p className="text-sm">Email: {user.email}</p>
                              <p className="text-sm">Phone: {user.details.phone}</p>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold mb-2">Employment Details</h4>
                            <div className="space-y-1">
                              <p className="text-sm">Department: {user.details.department}</p>
                              <p className="text-sm">Location: {user.details.location}</p>
                              <p className="text-sm">Join Date: {new Date(user.details.joinDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-semibold mb-2">Notes</h4>
                          <div className="space-y-2">
                            {user.notes.map((note) => (
                              <div key={note.id} className="border rounded p-2">
                                <p className="text-sm font-medium">{note.title}</p>
                                <p className="text-sm text-muted-foreground">{note.content}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex justify-end">
                          <Button variant="outline" className="mr-2">Edit User</Button>
                          <Button variant="default">View Activity</Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDataDisplay;