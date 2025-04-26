import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/layout";
import { StatsCard } from "@/components/admin/stats-card";
import { 
  LineChart,
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Book,
  Users,
  BookOpen,
  MessageSquare,
  Flag,
  TrendingUp,
} from "lucide-react";

export default function AdminDashboard() {
  // Fetch stats overview
  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      // Since we're using in-memory storage, we'll just create mock data for the dashboard
      // In a real app, we'd fetch this from the backend
      return {
        userCount: 150,
        storyCount: 48,
        chapterCount: 856,
        commentCount: 732,
        reportCount: 12,
      };
    },
  });

  // Activity data for charts (mock data for demo)
  const activityData = [
    { name: "Mon", users: 15, chapters: 8 },
    { name: "Tue", users: 20, chapters: 12 },
    { name: "Wed", users: 25, chapters: 15 },
    { name: "Thu", users: 18, chapters: 10 },
    { name: "Fri", users: 22, chapters: 14 },
    { name: "Sat", users: 30, chapters: 20 },
    { name: "Sun", users: 35, chapters: 25 },
  ];

  const popularGenresData = [
    { name: "Action", count: 35 },
    { name: "Fantasy", count: 28 },
    { name: "Romance", count: 25 },
    { name: "Comedy", count: 22 },
    { name: "Drama", count: 18 },
  ];

  return (
    <AdminLayout>
      <div className="flex flex-col space-y-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatsCard
            title="Total Users"
            value={stats?.userCount || 0}
            description="Registered users"
            icon={<Users className="h-5 w-5" />}
            trend={+12}
          />
          <StatsCard
            title="Total Stories"
            value={stats?.storyCount || 0}
            description="Published stories"
            icon={<Book className="h-5 w-5" />}
            trend={+5}
          />
          <StatsCard
            title="Total Chapters"
            value={stats?.chapterCount || 0}
            description="Published chapters"
            icon={<BookOpen className="h-5 w-5" />}
            trend={+24}
          />
          <StatsCard
            title="Comments"
            value={stats?.commentCount || 0}
            description="User comments"
            icon={<MessageSquare className="h-5 w-5" />}
            trend={+18}
          />
          <StatsCard
            title="Reports"
            value={stats?.reportCount || 0}
            description="Active reports"
            icon={<Flag className="h-5 w-5" />}
            trend={-3}
            trendType="negative"
          />
          <StatsCard
            title="Daily Visitors"
            value={254}
            description="Unique visitors today"
            icon={<TrendingUp className="h-5 w-5" />}
            trend={+15}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Activity</CardTitle>
              <CardDescription>
                New users and chapters over the last 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={activityData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="chapters"
                      stroke="#82ca9d"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Popular Genres</CardTitle>
              <CardDescription>
                Most popular genres by story count
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={popularGenresData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="count"
                      fill="#8884d8"
                      label={{ position: "top" }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">New User Registration</p>
                  <p className="text-sm text-muted-foreground">
                    User Sarah Johnson joined the platform
                  </p>
                </div>
                <span className="ml-auto text-xs text-muted-foreground">
                  2 hours ago
                </span>
              </div>

              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <BookOpen className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">New Chapter Published</p>
                  <p className="text-sm text-muted-foreground">
                    Chapter 15 added to "The Lost Kingdom"
                  </p>
                </div>
                <span className="ml-auto text-xs text-muted-foreground">
                  4 hours ago
                </span>
              </div>

              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <MessageSquare className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">New Comment</p>
                  <p className="text-sm text-muted-foreground">
                    User Mike left a comment on "Dragon Hunter"
                  </p>
                </div>
                <span className="ml-auto text-xs text-muted-foreground">
                  5 hours ago
                </span>
              </div>

              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <Flag className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Report Resolved</p>
                  <p className="text-sm text-muted-foreground">
                    Image issue in Chapter 8 of "Moonlight Warrior" fixed
                  </p>
                </div>
                <span className="ml-auto text-xs text-muted-foreground">
                  8 hours ago
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
