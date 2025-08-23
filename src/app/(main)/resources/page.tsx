'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { findResources, FindResourcesOutput } from '@/ai/flows/find-resources';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, AlertTriangle, Compass, Newspaper, Trophy, ExternalLink, Pencil } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';


const industries = [
  { id: 'technology', label: 'Technology' },
  { id: 'healthcare', label: 'Healthcare' },
  { id: 'finance', label: 'Finance' },
  { id: 'education', label: 'Education' },
  { id: 'creative_arts', label: 'Creative Arts' },
  { id: 'engineering', label: 'Engineering' },
  { id: 'business', label: 'Business & Management' },
  { id: 'environmental_science', label: 'Environmental Science' },
];

const formSchema = z.object({
  interests: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: 'You have to select at least one interest.',
  }),
});

export default function ResourcesPage() {
  const [results, setResults] = useState<FindResourcesOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      interests: [],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResults(null);
    setError(null);

    try {
      const result = await findResources(values);
      setResults(result);
      setIsEditing(false);
    } catch (e) {
      setError('Failed to find resources. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  const ResourceCard = ({ title, description, url }: {title: string, description: string, url: string}) => (
     <a href={url} target="_blank" rel="noopener noreferrer" className="block p-4 rounded-lg border hover:bg-muted/50 transition-colors">
        <div className="flex justify-between items-start">
            <div>
                <p className="font-semibold text-sm">{title}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0 ml-4 mt-1"/>
        </div>
    </a>
  );

  return (
    <div className="flex flex-col gap-8">
       <div>
        <h1 className="text-3xl font-bold font-headline">Resources</h1>
        <p className="text-muted-foreground">Discover resources, competitions, and news tailored to your interests.</p>
      </div>

      {isEditing ? (
        <Card className="max-w-2xl mx-auto w-full">
          <CardHeader>
            <CardTitle className="font-headline">Select Your Interests</CardTitle>
            <CardDescription>Choose the industries you&apos;re passionate about to find relevant content.</CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent>
                <FormField
                  control={form.control}
                  name="interests"
                  render={() => (
                    <FormItem>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {industries.map((item) => (
                          <FormField
                            key={item.id}
                            control={form.control}
                            name="interests"
                            render={({ field }) => {
                              return (
                                <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, item.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== item.id
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {item.label}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Find Resources
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      ) : (
         <Card className="max-w-2xl mx-auto w-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="font-headline">Your Interests</CardTitle>
                    <CardDescription>Here are the interests you selected.</CardDescription>
                </div>
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <Pencil className="mr-2 h-4 w-4"/>
                    Edit Interests
                </Button>
            </CardHeader>
            <CardContent>
                 <div className="flex flex-wrap gap-2">
                    {form.getValues('interests').map(interestId => {
                        const interest = industries.find(i => i.id === interestId);
                        return <Badge key={interestId} variant="secondary">{interest?.label || interestId}</Badge>
                    })}
                </div>
            </CardContent>
         </Card>
      )}

      {isLoading && (
        <div className="space-y-8">
          <Card>
            <CardHeader><Skeleton className="h-7 w-1/4" /></CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </div>
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

      {results && (
        <div className="space-y-8 animate-in fade-in-50">
           <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2"><Compass className="text-primary"/> Learning Resources</CardTitle>
              <CardDescription>Articles, tutorials, and courses to expand your knowledge.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {results.learningResources.length > 0 ? (
                results.learningResources.map((res, i) => <ResourceCard key={`lr-${i}`} {...res} />)
              ) : <p className="text-sm text-muted-foreground">No learning resources found.</p>}
            </CardContent>
          </Card>
          
           <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2"><Trophy className="text-primary"/> Competitions</CardTitle>
              <CardDescription>Challenges and competitions to test your skills.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {results.competitions.length > 0 ? (
                results.competitions.map((res, i) => <ResourceCard key={`comp-${i}`} {...res} />)
              ) : <p className="text-sm text-muted-foreground">No competitions found.</p>}
            </CardContent>
          </Card>

           <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2"><Newspaper className="text-primary"/> Latest News</CardTitle>
              <CardDescription>Stay up-to-date with the latest news and trends in your fields of interest.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {results.news.length > 0 ? (
                 results.news.map((res, i) => <ResourceCard key={`news-${i}`} {...res} />)
               ) : <p className="text-sm text-muted-foreground">No news found.</p>}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
