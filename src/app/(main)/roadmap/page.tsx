'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Map, GitMerge } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface Roadmap {
  id: string;
  goals: string;
  createdAt: {
    toDate: () => Date;
  };
  roadmap?: {
    title: string;
    content: string;
  }[];
}

export default function RoadmapListPage() {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      <div className="grid gap-8 md:grid-cols-1">
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
                         <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                          {item.content}
                        </div>
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
