
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { findResources, FindResourcesOutput, FindResourcesInput } from '@/ai/flows/find-resources';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, AlertTriangle, Compass, Newspaper, Trophy, ExternalLink, Pencil, Bookmark, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc, arrayUnion, serverTimestamp, collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

const industries = [
  { id: 'technology', label: 'Technology', color: 'from-blue-500 to-cyan-500' },
  { id: 'healthcare', label: 'Healthcare', color: 'from-emerald-500 to-green-500' },
  { id: 'finance', label: 'Finance', color: 'from-amber-500 to-yellow-500' },
  { id: 'education', label: 'Education', color: 'from-violet-500 to-purple-500' },
  { id: 'creative_arts', label: 'Creative Arts', color: 'from-pink-500 to-rose-500' },
  { id: 'engineering', label: 'Engineering', color: 'from-orange-500 to-red-500' },
  { id: 'business', label: 'Business & Management', color: 'from-indigo-500 to-blue-500' },
  { id: 'environmental_science', label: 'Environmental Science', color: 'from-teal-500 to-emerald-500' },
];

const formSchema = z.object({
  interests: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: 'You have to select at least one interest.',
  }),
});

type Resource = { title: string, description: string, url: string, type: 'learning' | 'competition' | 'news' };

export default function ResourcesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [results, setResults] = useState<FindResourcesOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFinding, setIsFinding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(true);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      interests: [],
    },
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists() && userDoc.data().interests?.length > 0) {
          const interests = userDoc.data().interests;
          form.setValue('interests', interests);
          setIsEditing(false);
          await onSubmit({ interests });
        } else {
          setIsEditing(true);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsFinding(true);
    setResults(null);
    setError(null);

    if (user) {
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, { interests: values.interests });
    }

    try {
      const result = await findResources(values);
      setResults(result);
      setIsEditing(false);
    } catch (e) {
      setError('Failed to find resources. Please try again.');
      console.error(e);
    } finally {
      setIsFinding(false);
    }
  }
  
  const handleSaveResource = async (resource: Resource) => {
    if (!user) {
        toast({ title: "Please log in to save resources.", variant: "destructive"});
        return;
    }

    try {
        const resourceRef = doc(collection(db, "users", user.uid, "savedResources"));
        await setDoc(resourceRef, { ...resource, savedAt: serverTimestamp() });
        toast({ title: "Resource saved!", description: "You can view it in your 'Saved' page."});
    } catch (e) {
        console.error("Error saving resource:", e);
        toast({ title: "Error", description: "Could not save the resource.", variant: "destructive" });
    }
  }

  const ResourceCard = ({ resource, type }: {resource: {title: string, description: string, url: string}, type: Resource['type']}) => {
    const iconMap = {
      learning: <Compass className="h-5 w-5 text-blue-600" />,
      competition: <Trophy className="h-5 w-5 text-amber-600" />,
      news: <Newspaper className="h-5 w-5 text-purple-600" />
    };
    
    const gradientMap = {
      learning: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20",
      competition: "from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20",
      news: "from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20"
    };
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 rounded-xl border-0 bg-gradient-to-r ${gradientMap[type]} shadow-sm hover:shadow-md transition-all group`}
      >
        <div className="flex justify-between items-start gap-3">
          <div className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
            {iconMap[type]}
          </div>
          <div className="flex-grow">
            <a href={resource.url} target="_blank" rel="noopener noreferrer" className="block">
              <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{resource.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{resource.description}</p>
            </a>
          </div>
          <div className="flex items-center gap-1 pl-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleSaveResource({...resource, type})}>
              <Bookmark className="h-4 w-4 text-muted-foreground hover:text-amber-500 transition-colors"/>
            </Button>
            <a href={resource.url} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-blue-600 transition-colors"/>
              </Button>
            </a>
          </div>
        </div>
      </motion.div>
    )
  };

  const renderContent = () => {
    if (isLoading) {
        return (
          <div className="space-y-8">
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg rounded-xl">
              <CardHeader><Skeleton className="h-7 w-1/4" /></CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </CardContent>
            </Card>
          </div>
        )
    }
    
    return (
        <>
            {isEditing ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto w-full"
              >
                <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg rounded-xl overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                  <CardHeader className="pb-3">
                    <CardTitle className="font-headline text-2xl flex items-center gap-2">
                      <Sparkles className="h-6 w-6 text-indigo-600" />
                      Select Your Interests
                    </CardTitle>
                    <CardDescription>Choose the industries you're passionate about to find relevant content.</CardDescription>
                  </CardHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                      <CardContent>
                        <FormField
                          control={form.control}
                          name="interests"
                          render={({ field }) => (
                            <FormItem>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {industries.map((item) => {
                                  const isSelected = field.value?.includes(item.id);
                                  return (
                                    <label
                                      key={item.id}
                                      className={`rounded-xl p-4 border-2 cursor-pointer transition-all ${
                                        isSelected
                                          ? `border-transparent bg-gradient-to-r ${item.color} text-white shadow-md`
                                          : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
                                      }`}
                                    >
                                      <div className="flex items-center gap-3">
                                        <Checkbox
                                          checked={isSelected}
                                          onCheckedChange={(checked) => {
                                            const currentValue = field.value || [];
                                            if (checked) {
                                              field.onChange([...currentValue, item.id]);
                                            } else {
                                              field.onChange(
                                                currentValue.filter(
                                                  (value) => value !== item.id
                                                )
                                              );
                                            }
                                          }}
                                          className={`${isSelected ? 'border-white bg-white/20' : ''}`}
                                        />
                                        <FormLabel className="font-normal cursor-pointer">
                                          {item.label}
                                        </FormLabel>
                                      </div>
                                    </label>
                                  );
                                })}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                      <CardFooter>
                        <Button 
                          type="submit" 
                          disabled={isFinding} 
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md"
                          size="lg"
                        >
                          {isFinding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Find Resources
                        </Button>
                      </CardFooter>
                    </form>
                  </Form>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto w-full"
              >
                <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg rounded-xl overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500"></div>
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <div>
                      <CardTitle className="font-headline text-2xl flex items-center gap-2">
                        <Sparkles className="h-6 w-6 text-emerald-600" />
                        Your Interests
                      </CardTitle>
                      <CardDescription>Here are your saved interests.</CardDescription>
                    </div>
                    <Button variant="outline" onClick={() => setIsEditing(true)} className="border-gray-300 shadow-sm">
                      <Pencil className="mr-2 h-4 w-4"/>
                      Edit Interests
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {form.getValues('interests').map(interestId => {
                        const interest = industries.find(i => i.id === interestId);
                        const gradient = interest?.color || 'from-gray-500 to-gray-600';
                        return (
                          <Badge 
                            key={interestId} 
                            className={`bg-gradient-to-r ${gradient} text-white border-0 shadow-sm`}
                          >
                            {interest?.label || interestId}
                          </Badge>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {isFinding && (
              <div className="space-y-8">
                <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg rounded-xl">
                  <CardHeader><Skeleton className="h-7 w-1/4" /></CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-12 w-full rounded-xl" />
                    <Skeleton className="h-12 w-full rounded-xl" />
                    <Skeleton className="h-12 w-full rounded-xl" />
                  </CardContent>
                </Card>
              </div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto w-full"
              >
                <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg rounded-xl overflow-hidden border-l-4 border-l-destructive">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-5 w-5"/> 
                      Error
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{error}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {results && (
              <div className="space-y-8 animate-in fade-in-50">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg rounded-xl overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                    <CardHeader className="pb-3">
                      <CardTitle className="font-headline flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                          <Compass className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        Learning Resources
                      </CardTitle>
                      <CardDescription>Articles, tutorials, and courses to expand your knowledge.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {results.learningResources.length > 0 ? (
                        results.learningResources.map((res, i) => <ResourceCard key={`lr-${i}`} resource={res} type="learning" />)
                      ) : <p className="text-sm text-muted-foreground text-center py-4">No learning resources found.</p>}
                    </CardContent>
                  </Card>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg rounded-xl overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-amber-500 to-yellow-500"></div>
                    <CardHeader className="pb-3">
                      <CardTitle className="font-headline flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                          <Trophy className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        Competitions
                      </CardTitle>
                      <CardDescription>Challenges and competitions to test your skills.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {results.competitions.length > 0 ? (
                        results.competitions.map((res, i) => <ResourceCard key={`comp-${i}`} resource={res} type="competition" />)
                      ) : <p className="text-sm text-muted-foreground text-center py-4">No competitions found.</p>}
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg rounded-xl overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                    <CardHeader className="pb-3">
                      <CardTitle className="font-headline flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                          <Newspaper className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        Latest News
                      </CardTitle>
                      <CardDescription>Stay up-to-date with the latest news and trends in your fields of interest.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {results.news.length > 0 ? (
                        results.news.map((res, i) => <ResourceCard key={`news-${i}`} resource={res} type="news" />)
                      ) : <p className="text-sm text-muted-foreground text-center py-4">No news found.</p>}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            )}
        </>
    )
  }

  return (
    <div className="flex flex-col gap-8 p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Resources
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Discover resources, competitions, and news tailored to your interests.</p>
        </div>
      </motion.div>
      {renderContent()}
    </div>
  );
}

    