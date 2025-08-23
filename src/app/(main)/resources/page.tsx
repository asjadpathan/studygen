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
import { Loader2, AlertTriangle, Compass, Newspaper, Trophy, ExternalLink, Pencil, Bookmark } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc, arrayUnion, serverTimestamp, collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

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

  const ResourceCard = ({ resource, type }: {resource: {title: string, description: string, url: string}, type: Resource['type']}) => (
     <div className="p-4 rounded-lg border hover:bg-muted/50 transition-colors group">
        <div className="flex justify-between items-start">
            <a href={resource.url} target="_blank" rel="noopener noreferrer" className="flex-grow">
                <p className="font-semibold text-sm">{resource.title}</p>
                <p className="text-xs text-muted-foreground">{resource.description}</p>
            </a>
            <div className="flex items-center gap-2 pl-4">
                 <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => handleSaveResource({...resource, type})}>
                    <Bookmark className="h-4 w-4"/>
                </Button>
                <a href={resource.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0 mt-1"/>
                </a>
            </div>
        </div>
    </div>
  );

  const renderContent = () => {
    if (isLoading) {
        return (
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
        )
    }
    
    return (
        <>
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
                    <Button type="submit" disabled={isFinding} className="w-full">
                    {isFinding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
                        <CardDescription>Here are your saved interests.</CardDescription>
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

        {isFinding && (
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
                    results.learningResources.map((res, i) => <ResourceCard key={`lr-${i}`} resource={res} type="learning" />)
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
                    results.competitions.map((res, i) => <ResourceCard key={`comp-${i}`} resource={res} type="competition" />)
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
                    results.news.map((res, i) => <ResourceCard key={`news-${i}`} resource={res} type="news" />)
                ) : <p className="text-sm text-muted-foreground">No news found.</p>}
                </CardContent>
            </Card>
            </div>
        )}
      </>
    )
  }

  return (
    <div className="flex flex-col gap-8">
       <div>
        <h1 className="text-3xl font-bold font-headline">Resources</h1>
        <p className="text-muted-foreground">Discover resources, competitions, and news tailored to your interests.</p>
      </div>
      {renderContent()}
    </div>
  );
}
