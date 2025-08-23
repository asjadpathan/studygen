"use client";

import { useState, useEffect } from "react";
import { Flame, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { auth, db } from "@/lib/firebase";
import { doc, onSnapshot, collection, query } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const chartData = [
  { month: "January", progress: 65 },
  { month: "February", progress: 59 },
  { month: "March", progress: 80 },
  { month: "April", progress: 81 },
  { month: "May", progress: 56 },
  { month: "June", progress: 55 },
  { month: "July", progress: 40 },
];

const chartConfig = {
  progress: {
    label: "Progress",
    color: "hsl(var(--primary))",
  },
};

interface UserData {
  studyStreak: {
    count: number;
    lastUpdate: string;
  };
  skillsMastered: number;
  timeStudied: number; // in minutes
}

interface Roadmap {
  id: string;
  goals: string;
  roadmap?: { title: string; concepts: string[] }[];
  completedConcepts?: string[];
}

interface UpcomingLesson {
  title: string;
  progress: number;
  nextLesson: string;
}

export default function DashboardPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [upcomingLessons, setUpcomingLessons] = useState<UpcomingLesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            setUserData(doc.data() as UserData);
          }
          setLoading(false);
        });

        const roadmapsQuery = query(collection(db, "users", user.uid, "roadmaps"));
        const unsubscribeRoadmaps = onSnapshot(roadmapsQuery, (snapshot) => {
          const lessons: UpcomingLesson[] = [];
          snapshot.forEach((doc) => {
            const roadmap = doc.data() as Roadmap;
            if (roadmap.roadmap && Array.isArray(roadmap.roadmap)) {
              const allConcepts = roadmap.roadmap.flatMap((module) => module.concepts || []);
              const completedConcepts = roadmap.completedConcepts || [];

              const progress = allConcepts.length > 0 ? (completedConcepts.length / allConcepts.length) * 100 : 0;
              const nextLesson = allConcepts.find((concept) => !completedConcepts.includes(concept)) || "All concepts completed!";

              lessons.push({
                title: roadmap.goals,
                progress: Math.round(progress),
                nextLesson: nextLesson,
              });
            }
          });
          setUpcomingLessons(lessons);
        });

        return () => {
          unsubscribeUser();
          unsubscribeRoadmaps();
        };
      } else {
        setUserData(null);
        setUpcomingLessons([]);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-8 p-6">
        <Skeleton className="h-9 w-1/3" />
        <Skeleton className="h-5 w-1/2 mt-2" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-2/3" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <Skeleton className="h-7 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
          <Card className="col-span-4 lg:col-span-3">
            <CardHeader>
              <Skeleton className="h-7 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 min-h-screen">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Welcome back! Here’s your learning journey at a glance.</p>
        <div className="flex gap-3 mt-4">
          <Button className="bg-blue-600 text-white hover:bg-blue-700">Start Next Lesson</Button>
          <Button variant="outline">Add Roadmap</Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[
          { title: "Study Streak", value: `${userData?.studyStreak?.count ?? 0} days`, icon: <Flame className="h-6 w-6 text-red-500" /> },
          { title: "Skills Mastered", value: `${userData?.skillsMastered ?? 0} / 25`, icon: <CheckCircle className="h-6 w-6 text-green-500" /> },
          { title: "Time Studied", value: formatTime(userData?.timeStudied ?? 0), icon: <Clock className="h-6 w-6 text-blue-500" /> },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-lg border border-gray-200 shadow-lg hover:shadow-xl transition rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Chart + Upcoming Lessons */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Chart */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="col-span-4">
          <Card className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl border shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-purple-600" />
                Progress Over Time
              </CardTitle>
              <CardDescription>Your learning consistency over the past months.</CardDescription>
            </CardHeader>
            <CardContent className="pl-4">
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <BarChart accessibilityLayer data={chartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={(v) => v.slice(0, 3)} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                  <defs>
                    <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0.4} />
                    </linearGradient>
                  </defs>
                  <Bar dataKey="progress" fill="url(#colorProgress)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Lessons */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="col-span-4 lg:col-span-3">
          <Card className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl border shadow-lg">
            <CardHeader>
              <CardTitle>Upcoming Lessons</CardTitle>
              <CardDescription>Your next steps in mastering your subjects.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingLessons.length > 0 ? (
                upcomingLessons.map((lesson, index) => (
                  <div key={index} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition">
                    <div className="flex justify-between mb-1">
                      <p className="font-medium truncate">{lesson.title}</p>
                      <Badge variant={lesson.progress === 100 ? "success" : "secondary"}>{lesson.progress}%</Badge>
                    </div>
                    <Progress value={lesson.progress} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">Next: {lesson.nextLesson}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No active roadmaps. Create one to get started!</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
