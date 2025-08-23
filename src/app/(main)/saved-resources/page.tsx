'use client';

import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, onSnapshot, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Bookmark, Compass, Newspaper, Trophy, ExternalLink, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

type SavedResource = {
    id: string;
    title: string;
    description: string;
    url: string;
    type: 'learning' | 'competition' | 'news';
    savedAt: {
        toDate: () => Date;
    };
};

const typeInfo = {
    learning: { icon: Compass, label: 'Learning', color: 'bg-blue-100 text-blue-800' },
    competition: { icon: Trophy, label: 'Competition', color: 'bg-yellow-100 text-yellow-800' },
    news: { icon: Newspaper, label: 'News', color: 'bg-green-100 text-green-800' },
};


export default function SavedResourcesPage() {
    const [user, setUser] = useState<User | null>(null);
    const [savedResources, setSavedResources] = useState<SavedResource[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                const q = query(collection(db, 'users', currentUser.uid, 'savedResources'), orderBy('savedAt', 'desc'));
                const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
                    const resources: SavedResource[] = [];
                    snapshot.forEach(doc => {
                        resources.push({ id: doc.id, ...doc.data() } as SavedResource);
                    });
                    setSavedResources(resources);
                    setIsLoading(false);
                }, (err) => {
                    console.error("Error fetching saved resources:", err);
                    setError("Could not load your saved resources.");
                    setIsLoading(false);
                });
                return () => unsubscribeSnapshot();
            } else {
                setIsLoading(false);
                setSavedResources([]);
            }
        });

        return () => unsubscribeAuth();
    }, []);

    const handleDelete = async (resourceId: string) => {
        if (!user) return;
        const resourceRef = doc(db, 'users', user.uid, 'savedResources', resourceId);
        try {
            await deleteDoc(resourceRef);
            toast({ title: "Resource removed." });
        } catch (e) {
            console.error("Error removing resource:", e);
            toast({ title: "Error", description: "Could not remove the resource.", variant: "destructive" });
        }
    };

    const ResourceItem = ({ resource }: { resource: SavedResource }) => {
        const info = typeInfo[resource.type] || { icon: Compass, label: 'Resource', color: 'bg-gray-100 text-gray-800'};
        const Icon = info.icon;

        return (
            <div className="p-4 rounded-lg border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4 flex-grow">
                     <div className={`p-2 rounded-full ${info.color}`}>
                        <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-grow">
                        <a href={resource.url} target="_blank" rel="noopener noreferrer">
                            <p className="font-semibold text-sm hover:underline">{resource.title}</p>
                            <p className="text-xs text-muted-foreground">{resource.description}</p>
                        </a>
                        <p className="text-xs text-muted-foreground mt-1">Saved on: {resource.savedAt.toDate().toLocaleDateString()}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-center">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(resource.id)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button asChild variant="outline" size="sm">
                         <a href={resource.url} target="_blank" rel="noopener noreferrer">
                            Open <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                    </Button>
                </div>
            </div>
        )
    };


    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                </div>
            );
        }

        if (error) {
            return (
                 <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive"><AlertTriangle/> Error</CardTitle>
                    </CardHeader>
                    <CardContent><p>{error}</p></CardContent>
                </Card>
            )
        }
        
        if (!user) {
             return (
                <Card className="text-center py-12">
                    <CardHeader>
                        <CardTitle>Please Log In</CardTitle>
                        <CardDescription>You need to be logged in to view your saved resources.</CardDescription>
                    </CardHeader>
                </Card>
            )
        }

        if (savedResources.length === 0) {
            return (
                <Card className="text-center py-12">
                    <CardHeader>
                         <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                           <Bookmark className="h-8 w-8 text-primary"/>
                        </div>
                        <CardTitle className="mt-4 font-headline">No Saved Resources</CardTitle>
                        <CardDescription>You haven&apos;t saved any resources yet. Start exploring to build your library!</CardDescription>
                    </CardHeader>
                </Card>
            )
        }

        return (
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Your Library</CardTitle>
                    <CardDescription>All your bookmarked resources in one place.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {savedResources.map(resource => <ResourceItem key={resource.id} resource={resource} />)}
                </CardContent>
            </Card>
        )
    }

    return (
         <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
                    <Bookmark /> Saved Resources
                </h1>
                <p className="text-muted-foreground">Your personal collection of learning materials and opportunities.</p>
            </div>

            {renderContent()}
        </div>
    )
}
