'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Map, GitMerge, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card><CardHeader><Skeleton className="h-6 w-2/3" /></CardHeader><CardContent><Skeleton className="h-4 w-1/2" /><Skeleton className="h-10 w-full mt-4" /></CardContent><CardFooter><Skeleton className="h-10 w-full" /></CardFooter></Card>
            <Card><CardHeader><Skeleton className="h-6 w-2/3" /></CardHeader><CardContent><Skeleton className="h-4 w-1/2" /><Skeleton className="h-10 w-full mt-4" /></CardContent><CardFooter><Skeleton className="h-10 w-full" /></CardFooter></Card>
            <Card><CardHeader><Skeleton className="h-6 w-2/3" /></CardHeader><CardContent><Skeleton className="h-4 w-1/2" /><Skeleton className="h-10 w-full mt-4" /></CardContent><CardFooter><Skeleton className="h-10 w-full" /></CardFooter></Card>
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

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {roadmaps.map(roadmap => (
          <Card key={roadmap.id} className="flex flex-col hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline">
                <Map className="text-primary" /> {roadmap.goals}
              </CardTitle>
              <CardDescription>
                Created on: {roadmap.createdAt?.toDate().toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
               <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Modules</h4>
                    <div className="flex flex-wrap gap-2">
                        {Array.isArray(roadmap.roadmap) && roadmap.roadmap.slice(0, 5).map((item, index) => (
                            <Badge key={index} variant="secondary">{item.title}</Badge>
                        ))}
                         {Array.isArray(roadmap.roadmap) && roadmap.roadmap.length > 5 && (
                            <Badge variant="outline">...</Badge>
                        )}
                    </div>
               </div>
            </CardContent>
            <CardFooter>
                 <Button asChild className="w-full">
                    <Link href={`/roadmap/${roadmap.id}`}>
                        View Full Roadmap <ArrowRight className="ml-2" />
                    </Link>
                </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
