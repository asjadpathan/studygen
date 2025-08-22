'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { assessSkill, AssessSkillOutput } from '@/ai/flows/skill-assessment';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, Lightbulb, BarChart3, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  topic: z.string().min(2, { message: 'Topic must be at least 2 characters.' }),
});

export default function AssessmentPage() {
  const [assessment, setAssessment] = useState<AssessSkillOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setAssessment(null);
    setError(null);
    try {
      const result = await assessSkill(values);
      setAssessment(result);
    } catch (e) {
      setError('Failed to generate assessment. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
       <div>
        <h1 className="text-3xl font-bold font-headline">Skill Assessment</h1>
        <p className="text-muted-foreground">Let our AI gauge your knowledge and pinpoint areas for improvement.</p>
      </div>
      <Card className="max-w-2xl mx-auto w-full">
        <CardHeader>
          <CardTitle className="font-headline">Assess Your Knowledge</CardTitle>
          <CardDescription>Enter a topic, and our AI will generate an assessment of your skills.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent>
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topic</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Quantum Physics, Renaissance Art" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Assess My Skill
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {isLoading && (
        <Card className="max-w-2xl mx-auto w-full">
          <CardHeader>
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="space-y-2">
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-5 w-1/3" />
            </div>
             <div className="space-y-2">
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-5/6" />
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
         <Card className="max-w-2xl mx-auto w-full border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive"><AlertTriangle/> Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {assessment && (
        <Card className="max-w-2xl mx-auto w-full animate-in fade-in-50">
          <CardHeader>
            <CardTitle className="font-headline">Your Assessment Results</CardTitle>
            <CardDescription>Based on the topic &quot;{form.getValues('topic')}&quot;</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">
                <BarChart3 className="text-primary" />
                Skill Level
              </h3>
              <p className="text-xl font-bold text-primary bg-primary/10 px-4 py-2 rounded-md inline-block">{assessment.skillLevel}</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">
                <Lightbulb className="text-accent" />
                Knowledge Gaps & Recommendations
              </h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{assessment.knowledgeGaps}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
