'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Map, GitMerge, ArrowRight, MoreVertical, Trash2, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

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
  completedConcepts?: string[];
}

export default function RoadmapListPage() {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [roadmapToDelete, setRoadmapToDelete] = useState<string | null>(null);
  const { toast } = useToast();

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

  const handleDelete = async () => {
    if (!roadmapToDelete) return;
    const user = auth.currentUser;
    if (!user) return;
    
    const docRef = doc(db, 'users', user.uid, 'roadmaps', roadmapToDelete);
    try {
      await deleteDoc(docRef);
      toast({
        title: "Roadmap Deleted",
        description: "The roadmap has been successfully removed.",
      });
    } catch(err) {
      console.error("Failed to delete roadmap", err);
      toast({
        title: "Error",
        description: "Could not delete the roadmap.",
        variant: "destructive",
      });
    } finally {
      setIsAlertOpen(false);
      setRoadmapToDelete(null);
    }
  };

  const openDeleteDialog = (roadmapId: string) => {
    setRoadmapToDelete(roadmapId);
    setIsAlertOpen(true);
  }

  const calculateProgress = (roadmap: Roadmap) => {
    if (!Array.isArray(roadmap.roadmap)) return 0;
    const totalConcepts = roadmap.roadmap?.flatMap(module => module.concepts || []).length || 0;
    if (totalConcepts === 0) return 0;
    const completedConcepts = roadmap.completedConcepts?.length || 0;
    return Math.round((completedConcepts / totalConcepts) * 100);
  }

  const getGradientByProgress = (progress: number) => {
    if (progress >= 80) return 'from-green-500 to-emerald-500';
    if (progress >= 50) return 'from-blue-500 to-cyan-500';
    if (progress >= 25) return 'from-amber-500 to-yellow-500';
    return 'from-gray-500 to-gray-600';
  }

  return (
    <>
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent className="bg-white dark:bg-gray-800 border-0 rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-gray-100">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              This action cannot be undone. This will permanently delete this roadmap and all its progress.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-300 bg-white hover:bg-gray-50 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <div className="flex flex-col gap-8 p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 min-h-screen">
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              My Roadmaps
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Review your learning plans or create a new one.</p>
          </div>
          <Button 
            asChild 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md"
          >
            <Link href="/roadmap/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Roadmap
            </Link>
          </Button>
        </motion.div>

        {isLoading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <Card key={i} className="bg-white dark:bg-gray-800 border-0 shadow-lg rounded-xl overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700"></div>
                <CardHeader className="pb-3">
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-4 w-1/6" />
                    </div>
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <div className="flex flex-wrap gap-2">
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full rounded-lg" />
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && roadmaps.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="flex flex-col items-center justify-center py-24 gap-4 text-center bg-white dark:bg-gray-800 border-0 shadow-lg rounded-xl">
              <div className="p-4 rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                <GitMerge size={48} className="text-indigo-600 dark:text-indigo-400"/>
              </div>
              <CardTitle className="font-headline text-2xl text-gray-900 dark:text-gray-100">No Roadmaps Yet</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">You haven't created any learning roadmaps.</CardDescription>
              <Button 
                asChild
                className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md"
              >
                <Link href="/roadmap/create">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Your First Roadmap
                </Link>
              </Button>
            </Card>
          </motion.div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {roadmaps.map((roadmap, index) => {
            const progress = calculateProgress(roadmap);
            const gradient = getGradientByProgress(progress);
            
            return (
              <motion.div
                key={roadmap.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                  <div className={`h-2 bg-gradient-to-r ${gradient}`}></div>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 mt-1">
                          <Map className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="font-headline text-lg text-gray-900 dark:text-gray-100 line-clamp-2">
                            {roadmap.goals}
                          </CardTitle>
                          <CardDescription className="text-sm mt-1">
                            Created: {roadmap.createdAt?.toDate().toLocaleDateString()}
                          </CardDescription>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2 -mr-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border-0 shadow-lg rounded-xl">
                          <DropdownMenuItem 
                            onClick={() => openDeleteDialog(roadmap.id)} 
                            className="text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-900/20"
                          >
                            <Trash2 className="mr-2 h-4 w-4"/>
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Progress</h4>
                        <span className="text-sm font-bold text-primary">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Next Modules</h4>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(roadmap.roadmap) && roadmap.roadmap.slice(0, 3).map((item, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className="bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                          >
                            {item.title}
                          </Badge>
                        ))}
                        {Array.isArray(roadmap.roadmap) && roadmap.roadmap.length > 3 && (
                          <Badge variant="outline" className="border-gray-300 text-gray-500 dark:border-gray-600 dark:text-gray-400">
                            +{roadmap.roadmap.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      asChild 
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md"
                    >
                      <Link href={`/roadmap/${roadmap.id}`}>
                        View Full Roadmap <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </>
  );
}