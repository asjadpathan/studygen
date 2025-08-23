
"use client"

import { useState, useEffect } from "react";
import { Flame, CheckCircle, Clock, TrendingUp, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { auth, db } from "@/lib/firebase";
import { collection, doc, onSnapshot, query } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen } from 'lucide-react';
import Link from "next/link";

const chartData = [
  { month: "January", progress: 65 },
  { month: "February", progress: 59 },
  { month: "March", progress: 80 },
  { month: "April", progress: 81 },
  { month: "May", progress: 56 },
  { month: "June", progress: 55 },
  { month: "July", progress: 40 },
]

const chartConfig = {
  progress: {
    label: "Progress",
    color: "hsl(var(--primary))",
  },
}

interface UserData {
  studyStreak: number;
  skillsMastered: number;
  timeStudied: number; // in minutes
}

interface Roadmap {
  id: string;
  goals: string;
  roadmap?: {
    title: string;
    concepts: string[];
  }[];
  completedConcepts?: string[];
}

interface UpcomingLesson {
  id: string;
  title: string;
  nextConcept: string;
  progress: number;
}


export default function DashboardPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [upcomingLessons, setUpcomingLessons] = useState<UpcomingLesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Fetch user profile data
        const userDocRef = doc(db, "users", user.uid);
        const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            setUserData(doc.data() as UserData);
          }
          setLoading(false);
        });

        // Fetch roadmaps and calculate upcoming lessons
        const roadmapsQuery = query(collection(db, "users", user.uid, "roadmaps"));
        const unsubscribeRoadmaps = onSnapshot(roadmapsQuery, (snapshot) => {
          const lessons: UpcomingLesson[] = [];
          snapshot.forEach(doc => {
            const roadmap = { id: doc.id, ...doc.data() } as Roadmap;
            const allConcepts = roadmap.roadmap?.flatMap(m => m.concepts) || [];
            const completedConcepts = roadmap.completedConcepts || [];

            if (allConcepts.length > 0) {
              const progress = Math.round((completedConcepts.length / allConcepts.length) * 100);
              const nextConcept = allConcepts.find(c => !completedConcepts.includes(c));

              lessons.push({
                id: roadmap.id,
                title: roadmap.goals,
                nextConcept: nextConcept || "All concepts completed!",
                progress: progress,
              });
            }
          });
          setUpcomingLessons(lessons);
          // Set loading to false only after both fetches attempted
           setLoading(false);
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
  }
  
  if (loading) {
      return (
      <div className="flex flex-col gap-8">
        <div>
          <Skeleton className="h-9 w-1/3" />
          <Skeleton className="h-5 w-1/2 mt-2" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card><CardHeader><Skeleton className="h-5 w-2/3" /></CardHeader><CardContent><Skeleton className="h-8 w-1/3" /></CardContent></Card>
          <Card><CardHeader><Skeleton className="h-5 w-2/3" /></CardHeader><CardContent><Skeleton className="h-8 w-1/3" /></CardContent></Card>
          <Card><CardHeader><Skeleton className="h-5 w-2/3" /></CardHeader><CardContent><Skeleton className="h-8 w-1/3" /></CardContent></Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card className="lg:col-span-3"><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-48 w-full" /></CardContent></Card>
            <Card className="lg:col-span-2"><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent className="space-y-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></CardContent></Card>
        </div>
      </div>
      )
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here&apos;s a summary of your progress.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
            <Flame className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userData?.studyStreak ?? 0} days</div>
            <p className="text-xs text-muted-foreground">Keep up the great work!</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Skills Mastered</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userData?.skillsMastered ?? 0}</div>
            <p className="text-xs text-muted-foreground">Total skills acquired</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Studied</CardTitle>
            <Clock className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(userData?.timeStudied ?? 0)}</div>
            <p className="text-xs text-muted-foreground">Total time invested in learning</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card className="lg:col-span-3 hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <TrendingUp className="h-6 w-6" />
              Progress Over Time
            </CardTitle>
            <CardDescription>Your learning consistency over the past months.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="progress" fill="var(--color-progress)" radius={8} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="font-headline">Upcoming Lessons</CardTitle>
            <CardDescription>Your next steps in mastering your subjects.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingLessons.length > 0 ? (
                 <div className="flex flex-col gap-4">
                    {upcomingLessons.map(lesson => (
                        <Link href={`/roadmap/${lesson.id}`} key={lesson.id} className="block hover:bg-muted/50 p-2 rounded-md transition-colors">
                            <p className="font-semibold text-primary truncate">{lesson.title}</p>
                            <p className="text-sm text-muted-foreground truncate mb-2">Next: {lesson.nextConcept}</p>
                            <div className="flex items-center gap-2">
                                <Progress value={lesson.progress} className="h-2"/>
                                <span className="text-xs font-semibold text-muted-foreground">{lesson.progress}%</span>
                            </div>
                        </Link>
                    ))}
                 </div>
            ) : (
                <div className="text-center text-muted-foreground py-8">
                    <BookOpen className="mx-auto h-12 w-12" />
                    <p className="mt-4 font-semibold">No active roadmaps</p>
                    <p className="text-sm">Create a new roadmap to start learning!</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
