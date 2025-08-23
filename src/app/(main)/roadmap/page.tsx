'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Map, GitMerge, Loader2, BookOpen, HelpCircle, CheckCircle2, XCircle, Lightbulb } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { getConceptExplanation, GetConceptExplanationOutput } from '@/ai/flows/get-concept-explanation';
import { generateQuizAndExplanation, QuizAndExplanationOutput } from '@/ai/flows/active-feedback';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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

type QuizState = 'idle' | 'loading' | 'ready' | 'answered';

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

  // State for explanation
  const [activeConcept, setActiveConcept] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<GetConceptExplanationOutput | null>(null);
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);

  // State for quiz
  const [quizConceptKey, setQuizConceptKey] = useState<string | null>(null);
  const [quizData, setQuizData] = useState<QuizAndExplanationOutput | null>(null);
  const [quizState, setQuizState] = useState<QuizState>('idle');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);


  const handleConceptClick = useCallback(async (concept: string, roadmap: Roadmap) => {
    const conceptKey = `${roadmap.id}-${concept}`;
    if (activeConcept === conceptKey) {
      setActiveConcept(null);
      setExplanation(null);
      setQuizConceptKey(null);
      setQuizData(null);
      setQuizState('idle');
      return;
    }
    
    setActiveConcept(conceptKey);
    setQuizConceptKey(null);
    setQuizData(null);
    setQuizState('idle');
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

  const handleStartQuiz = async (concept: string) => {
      setQuizConceptKey(activeConcept);
      setQuizState('loading');
      setQuizFeedback(null);
      setSelectedAnswer(null);
      setIsCorrect(null);
      try {
          const result = await generateQuizAndExplanation({ topic: concept });
          setQuizData(result);
          setQuizState('ready');
      } catch (err) {
          console.error(err);
          setQuizFeedback("Sorry, couldn't generate a quiz for this concept.");
          setQuizState('idle');
      }
  }

  const handleQuizSubmit = async () => {
    if (!selectedAnswer || !quizData) return;

    setQuizState('answered');
    const correct = selectedAnswer === quizData.correctAnswer;
    setIsCorrect(correct);

    if (!correct) {
      setQuizState('loading');
      try {
        const result = await generateQuizAndExplanation({
          topic: quizData.question,
          userAnswer: selectedAnswer,
          correctAnswer: quizData.correctAnswer,
        });
        setQuizFeedback(result.explanation);
      } catch (error) {
        console.error('Failed to fetch explanation:', error);
        setQuizFeedback('Sorry, there was an error generating the explanation.');
      } finally {
        setQuizState('answered');
      }
    }
  };

  const ConceptQuiz = ({concept}: {concept: string}) => (
    <div className="mt-4 p-4 border-t-2 border-primary/20">
      {quizState === 'idle' && (
        <Button onClick={() => handleStartQuiz(concept)}>
          <HelpCircle className="mr-2"/> Test Your Knowledge
        </Button>
      )}

      {(quizState === 'loading' && !quizData) && (
        <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin"/>
            <span>Generating quiz...</span>
        </div>
      )}

      {quizData && (quizState === 'ready' || quizState === 'answered' || (quizState === 'loading' && !!quizData)) && (
          <div className="space-y-4">
              <p className="font-semibold">{quizData.question}</p>
              <RadioGroup
                value={selectedAnswer ?? ''}
                onValueChange={setSelectedAnswer}
                disabled={quizState === 'answered' || quizState === 'loading'}
              >
                {quizData.options.map((option, index) => (
                   <Label key={index} htmlFor={`quiz-${index}`} className={`flex items-center gap-3 p-3 rounded-md border transition-all cursor-pointer ${
                        quizState === 'answered' && option === quizData.correctAnswer ? 'border-green-500 bg-green-500/10' : ''
                      } ${
                        quizState === 'answered' && option === selectedAnswer && !isCorrect ? 'border-destructive bg-destructive/10' : ''
                      }`}>
                        <RadioGroupItem value={option} id={`quiz-${index}`} disabled={quizState === 'answered' || quizState === 'loading'} />
                        <span>{option}</span>
                    </Label>
                ))}
              </RadioGroup>

              {quizState === 'answered' && isCorrect !== null && (
                 <Alert variant={isCorrect ? "default" : "destructive"} className={isCorrect ? "border-green-500 text-green-700" : ""}>
                  {isCorrect ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  <AlertTitle>{isCorrect ? 'Correct!' : 'Not quite!'}</AlertTitle>
                  <AlertDescription>
                    {isCorrect ? 'Great job!' : `The correct answer is: ${quizData.correctAnswer}`}
                  </AlertDescription>
                </Alert>
              )}

              {quizFeedback && (
                <Alert className="mt-4 animate-in fade-in-50">
                  <Lightbulb className="h-4 w-4" />
                  <AlertTitle>Explanation</AlertTitle>
                  <AlertDescription className="whitespace-pre-wrap">{quizFeedback}</AlertDescription>
                </Alert>
              )}

              {quizState === 'loading' && (
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin"/>
                    <span>Checking answer...</span>
                </div>
              )}

              {quizState === 'ready' && <Button onClick={handleQuizSubmit} disabled={!selectedAnswer}>Submit Answer</Button>}
              {quizState === 'answered' && <Button onClick={() => handleStartQuiz(concept)}>Try another question</Button>}

          </div>
      )}
    </div>
  );

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
                                                  <>
                                                    <div className="prose prose-sm dark:prose-invert max-w-none"
                                                        dangerouslySetInnerHTML={{ __html: markdownToHtml(explanation.explanation) }}
                                                    />
                                                    <ConceptQuiz concept={concept}/>
                                                  </>
                                                )}
                                                {quizConceptKey === activeConcept && quizState !== 'idle' && (
                                                   <ConceptQuiz concept={concept}/>
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
