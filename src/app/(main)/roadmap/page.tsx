'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Map, GitMerge, Loader2, BookOpen } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { getConceptExplanation, GetConceptExplanationOutput } from '@/ai/flows/get-concept-explanation';

interface Roadmap {
  id: string;
  goals: string;
  expertise: string;
  createdAt: {
    toDate: () => Date;
  };
  roadmap?: {
    title: string;
    concepts: string[];
  }[];
}

function markdownToHtml(markdown: string) {
    if (!markdown) return '';
    // A simple markdown to HTML converter
    return markdown
        .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mb-2 mt-4">$1</h3>')
        .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mb-3 mt-5">$1</h2>')
        .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4 mt-6">$1</h1>')
        .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*)\*/gim, '<em>$1</em>')
        .replace(/`([^`]+)`/gim, '<code class="bg-muted text-muted-foreground rounded-sm px-1 py-0.5 font-mono text-sm">$1</code>')
        .replace(/^- (.*$)/gim, '<li class="ml-4 mb-1 list-disc">$1</li>')
        .replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>')
        .replace(/<\/ul>\n<ul>/gim, '')
        .replace(/\n/g, '<br />');
}

export default function RoadmapListPage() {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeConcept, setActiveConcept] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<GetConceptExplanationOutput | null>(null);
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);

  const handleConceptClick = useCallback(async (concept: string, roadmap: Roadmap) => {
    const conceptKey = `${roadmap.id}-${concept}`;
    if (activeConcept === conceptKey) {
      setActiveConcept(null); // Toggle off if clicking the same concept
      setExplanation(null);
      return;
    }
    
    setActiveConcept(conceptKey);
    setIsLoadingExplanation(true);
    setExplanation(null);
    try {
      const result = await getConceptExplanation({
        concept: concept,
        topic: roadmap.goals,
        expertise: roadmap.expertise,
      });
      setExplanation(result);
    } catch (err) {
      console.error(err);
      setExplanation({ explanation: "Sorry, we couldn't generate an explanation for this concept." });
    } finally {
      setIsLoadingExplanation(false);
    }
  }, [activeConcept]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        const q = query(collection(db, 'users', user.uid, 'roadmaps'), orderBy('createdAt', 'desc'));
        const unsubscribeSnapshot = onSnapshot(q, (querySnapshot) => {
          const userRoadmaps: Roadmap[] = [];
          querySnapshot.forEach((doc) => {
            userRoadmaps.push({ id: doc.id, ...doc.data() } as Roadmap);
          });
          setRoadmaps(userRoadmaps);
          setIsLoading(false);
        }, (err) => {
          console.error(err);
          setError('Failed to fetch roadmaps.');
          setIsLoading(false);
        });
        return () => unsubscribeSnapshot();
      } else {
        setIsLoading(false);
        setRoadmaps([]);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline">My Roadmaps</h1>
          <p className="text-muted-foreground">Review your learning plans or create a new one.</p>
        </div>
        <Button asChild>
          <Link href="/roadmap/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Roadmap
          </Link>
        </Button>
      </div>

      {isLoading && (
        <div className="grid gap-8 md:grid-cols-2">
            <Card><CardHeader><Skeleton className="h-6 w-2/3" /></CardHeader><CardContent><Skeleton className="h-4 w-1/2" /><Skeleton className="h-20 w-full mt-4" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-6 w-2/3" /></CardHeader><CardContent><Skeleton className="h-4 w-1/2" /><Skeleton className="h-20 w-full mt-4" /></CardContent></Card>
        </div>
      )}

      {!isLoading && roadmaps.length === 0 && (
        <Card className="flex flex-col items-center justify-center py-24 gap-4 text-center">
             <GitMerge size={48} className="text-muted-foreground"/>
            <CardTitle className="font-headline">No Roadmaps Yet</CardTitle>
            <CardDescription>You haven&apos;t created any learning roadmaps.</CardDescription>
            <Button asChild>
                <Link href="/roadmap/create">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Your First Roadmap
                </Link>
            </Button>
        </Card>
      )}

      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
        {roadmaps.map(roadmap => (
          <Card key={roadmap.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline">
                <Map className="text-primary" /> {roadmap.goals}
              </CardTitle>
              <CardDescription>
                Created on: {roadmap.createdAt?.toDate().toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
               <Accordion type="single" collapsible className="w-full">
                  {Array.isArray(roadmap.roadmap) && roadmap.roadmap.map((item, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                      <AccordionTrigger>{item.title}</AccordionTrigger>
                      <AccordionContent>
                         <Accordion type="single" collapsible className="w-full pl-4">
                            {Array.isArray(item.concepts) && item.concepts.map((concept, conceptIndex) => (
                                <AccordionItem value={`concept-${conceptIndex}`} key={conceptIndex}>
                                    <AccordionTrigger 
                                        className="text-sm"
                                        onClick={() => handleConceptClick(concept, roadmap)}
                                    >
                                        {concept}
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        {activeConcept === `${roadmap.id}-${concept}` && (
                                            <div className="p-4 border-l-2 border-primary bg-primary/5">
                                                {isLoadingExplanation && (
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <Loader2 className="h-4 w-4 animate-spin"/>
                                                        <span>Generating explanation...</span>
                                                    </div>
                                                )}
                                                {explanation && (
                                                    <div className="prose prose-sm dark:prose-invert max-w-none"
                                                        dangerouslySetInnerHTML={{ __html: markdownToHtml(explanation.explanation) }}
                                                    />
                                                )}
                                            </div>
                                        )}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                         </Accordion>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
