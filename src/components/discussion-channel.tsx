'use client';

import { useState, useEffect, useRef } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, onSnapshot, orderBy, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from './ui/skeleton';

interface Message {
  id: string;
  text: string;
  createdAt: {
    toDate: () => Date;
  };
  userId: string;
  userEmail: string;
}

interface Channel {
  id: string;
  name: string;
  description: string;
}

const channelDetails: Record<string, { name: string, description: string }> = {
    'calculus-help': {
        name: "Calculus Help",
        description: "Discuss calculus problems and concepts."
    },
    'general-chat': {
        name: "General Chat",
        description: "Talk about anything study-related."
    }
}

export function DiscussionChannel({ channelId }: { channelId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [channel, setChannel] = useState<Channel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, setUser);
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    const details = channelDetails[channelId];
    if (!details) return;

    // Ensure channel document exists
    const channelRef = doc(db, 'discussionChannels', channelId);
    setDoc(channelRef, { name: details.name, description: details.description }, { merge: true });
    
    setChannel({ id: channelId, ...details });

    const q = query(collection(db, 'discussionChannels', channelId, 'messages'), orderBy('createdAt', 'asc'));
    const unsubscribeMessages = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = [];
      snapshot.forEach(doc => {
        msgs.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(msgs);
      setIsLoading(false);
    });

    return () => unsubscribeMessages();
  }, [channelId]);
  
  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
             viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim()) return;

    await addDoc(collection(db, 'discussionChannels', channelId, 'messages'), {
      text: newMessage,
      createdAt: serverTimestamp(),
      userId: user.uid,
      userEmail: user.email,
    });
    setNewMessage('');
  };

  const getInitials = (email?: string | null) => {
    if (!email) return 'U';
    return email.substring(0, 2).toUpperCase();
  }

  if (isLoading) {
      return (
          <Card>
              <CardHeader>
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent className="h-96 space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
              </CardContent>
              <CardFooter>
                   <Skeleton className="h-10 w-full" />
              </CardFooter>
          </Card>
      )
  }

  return (
    <Card className="flex flex-col h-[70vh]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><MessageSquare className="text-primary"/> {channel?.name}</CardTitle>
        <CardDescription>{channel?.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
         <ScrollArea className="h-full" ref={scrollAreaRef}>
            <div className="space-y-4 pr-4">
            {messages.map(msg => (
                <div key={msg.id} className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback>{getInitials(msg.userEmail)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                        <div className="flex items-baseline gap-2">
                           <p className="font-semibold text-sm">{msg.userEmail}</p>
                           <p className="text-xs text-muted-foreground">
                                {msg.createdAt ? formatDistanceToNow(msg.createdAt.toDate(), { addSuffix: true }) : 'just now'}
                           </p>
                        </div>
                        <div className="p-2 bg-muted rounded-lg text-sm mt-1">
                            <p>{msg.text}</p>
                        </div>
                    </div>
                </div>
            ))}
            </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={!user}
          />
          <Button type="submit" size="icon" disabled={!user || !newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
