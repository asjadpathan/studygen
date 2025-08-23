"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Flame, CheckCircle, Clock, TrendingUp, BookOpen, ChevronRight, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { auth, db } from "@/lib/firebase";
import { doc, onSnapshot, collection, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const chartData = [
  { month: "Jan", progress: 65 },
  { month: "Feb", progress: 59 },
  { month: "Mar", progress: 80 },
  { month: "Apr", progress: 81 },
  { month: "May", progress: 56 },
  { month: "Jun", progress: 55 },
  { month: "Jul", progress: 40 },
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

        const roadmapsCollectionRef = collection(db, `users/${user.uid}/roadmaps`);
        const roadmapsQuery = query(roadmapsCollectionRef);
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
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Welcome back! Here's your learning journey at a glance.</p>
        </div>
        <div className="flex gap-3">
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md">
            Start Next Lesson
          </Button>
          <Button variant="outline" asChild className="border-gray-300 shadow-sm">
            <Link href="/roadmap/create" className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              Add Roadmap
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {[
          { title: "Study Streak", value: `${userData?.studyStreak?.count ?? 0} days`, icon: <Flame className="h-5 w-5 text-red-500" />, color: "from-red-500 to-orange-500" },
          { title: "Skills Mastered", value: `${userData?.skillsMastered ?? 0} / 25`, icon: <CheckCircle className="h-5 w-5 text-green-500" />, color: "from-green-500 to-emerald-500" },
          { title: "Time Studied", value: formatTime(userData?.timeStudied ?? 0), icon: <Clock className="h-5 w-5 text-blue-500" />, color: "from-blue-500 to-cyan-500" },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg rounded-xl overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className={`h-2 bg-gradient-to-r ${stat.color}`}></div>
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</CardTitle>
                  <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 group-hover:scale-110 transition-transform">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-2xl font-bold mt-2">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Chart + Upcoming Lessons */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Chart */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="col-span-4">
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg rounded-xl overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                  <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <CardTitle>Progress Over Time</CardTitle>
                  <CardDescription>Your learning consistency over the past months</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pl-2">
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <BarChart accessibilityLayer data={chartData}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                  <defs>
                    <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0.4} />
                    </linearGradient>
                  </defs>
                  <Bar dataKey="progress" fill="url(#colorProgress)" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Lessons */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="col-span-4 lg:col-span-3">
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg rounded-xl overflow-hidden h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle>Upcoming Lessons</CardTitle>
                  <CardDescription>Your next steps in mastering your subjects</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingLessons.length > 0 ? (
                upcomingLessons.map((lesson, index) => (
                  <motion.div 
                    key={index} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all group cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{lesson.title}</p>
                      <Badge variant={lesson.progress === 100 ? "default" : "secondary"} className={lesson.progress === 100 ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : ""}>
                        {lesson.progress}%
                      </Badge>
                    </div>
                    <Progress value={lesson.progress} className="h-2 mb-2" />
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-muted-foreground">Next: {lesson.nextLesson}</p>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 px-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
                    <BookOpen className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">No active roadmaps yet</p>
                  <Button asChild variant="outline" className="border-gray-300">
                    <Link href="/roadmap/create" className="flex items-center gap-1">
                      <Plus className="h-4 w-4" />
                      Create Roadmap
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}