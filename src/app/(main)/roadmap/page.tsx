'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generatePersonalizedRoadmap, PersonalizedRoadmapOutput } from '@/ai/flows/personalized-roadmap';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, AlertTriangle, Map } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp, collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  goals: z.string().min(10, { message: 'Please describe your goals in more detail.' }),
  expertise: z.string().min(10, { message: 'Please describe your expertise in more detail.' }),
  availableStudyTime: z.string().min(2, { message: 'Please specify your available study time.' }),
});

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState<PersonalizedRoadmapOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      goals: '',
      expertise: '',
      availableStudyTime: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setRoadmap(null);
    setError(null);
    const user = auth.currentUser;
    if (!user) {
      setError('You must be logged in to generate a roadmap.');
      setIsLoading(false);
      return;
    }

    try {
      const result = await generatePersonalizedRoadmap(values);
      setRoadmap(result);

      const roadmapRef = doc(collection(db, 'users', user.uid, 'roadmaps'));
      await setDoc(roadmapRef, {
        ...values,
        ...result,
        createdAt: serverTimestamp(),
      });
      
      toast({
        title: "Roadmap Saved",
        description: "Your new roadmap has been saved to your profile.",
      });

    } catch (e) {
      setError('Failed to generate roadmap. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Personalized Roadmap</h1>
        <p className="text-muted-foreground">Chart your course to mastery with an AI-generated learning plan.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="font-headline">Create Your Roadmap</CardTitle>
            <CardDescription>Tell us about your learning journey, and we&apos;ll create a plan for you.</CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="goals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Learning Goals</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Pass the AP Calculus Exam" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expertise"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Expertise</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g., Some experience with Calculus" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="availableStudyTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Available Study Time</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 1 hour per day for 3 months" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate My Roadmap
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <Map className="text-primary"/>
                Your Learning Path
                </CardTitle>
              <CardDescription>Your generated roadmap will appear here.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading && (
                 <div className="space-y-4">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-full" />
                   <br />
                   <Skeleton className="h-6 w-1/4" />
                   <Skeleton className="h-4 w-full" />
                   <Skeleton className="h-4 w-5/6" />
                </div>
              )}
              {error && (
                <div className="text-destructive flex items-center gap-2">
                  <AlertTriangle /> {error}
                </div>
              )}
              {roadmap && (
                 <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap animate-in fade-in-50">
                  {roadmap.roadmap}
                </div>
              )}
               {!isLoading && !roadmap && !error && (
                <div className="text-center text-muted-foreground py-16">
                    <Map size={48} className="mx-auto mb-4"/>
                    <p>Your personalized roadmap is waiting to be discovered.</p>
                </div>
               )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
