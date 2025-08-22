'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { searchTopic, SearchTopicOutput } from '@/ai/flows/search-topic';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, BookOpen, ExternalLink, HelpCircle, Lightbulb } from 'lucide-react';

export default function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q');
  const [results, setResults] = useState<SearchTopicOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query) {
      setIsLoading(true);
      setError(null);
      setResults(null);
      searchTopic({ topic: query })
        .then(data => {
          setResults(data);
        })
        .catch(err => {
          console.error(err);
          setError('Failed to fetch search results. Please try again.');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
        setIsLoading(false);
    }
  }, [query]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-9 w-1/2" />
          <Skeleton className="h-5 w-1/3 mt-2" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-1/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-5/6" />
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <Skeleton className="h-7 w-1/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
     return (
        <Card className="max-w-2xl mx-auto w-full border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive"><AlertTriangle/> Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      );
  }
  
  if (!query) {
      return (
          <div className="text-center py-12">
              <h2 className="text-xl font-semibold">Search for a topic</h2>
              <p className="text-muted-foreground">Use the search bar above to learn about a new concept.</p>
          </div>
      )
  }

  if (!results) {
    return null;
  }

  return (
    <div className="flex flex-col gap-8">
       <div>
        <h1 className="text-3xl font-bold font-headline">Search Results for &quot;{query}&quot;</h1>
        <p className="text-muted-foreground">Here&apos;s what we found to help you learn.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline"><BookOpen className="text-primary"/> Explanation</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                        {results.explanation}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                     <CardTitle className="flex items-center gap-2 font-headline"><Lightbulb className="text-primary"/> External Resources</CardTitle>
                     <CardDescription>Explore these links for more in-depth information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {results.resources.map((resource, index) => (
                        <a href={resource.url} target="_blank" rel="noopener noreferrer" key={index} className="block p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold">{resource.title}</p>
                                    <p className="text-sm text-muted-foreground">{resource.description}</p>
                                </div>
                                <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0 ml-4 mt-1"/>
                            </div>
                        </a>
                    ))}
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1">
             <Card className="sticky top-20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline"><HelpCircle className="text-primary"/> Test Your Knowledge</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <p className="text-muted-foreground">{results.quizTitle}</p>
                    <Button asChild className="w-full">
                        <Link href={`/study?topic=${encodeURIComponent(query ?? '')}`}>Start Quiz</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>

      </div>
    </div>
  );
}
