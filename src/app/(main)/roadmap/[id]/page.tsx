'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Map, Loader2, BookOpen, HelpCircle, CheckCircle2, XCircle, Lightbulb, AlertTriangle, ExternalLink, Bookmark, CheckSquare, BrainCircuit } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { getConceptExplanation, GetConceptExplanationOutput } from '@/ai/flows/get-concept-explanation';
import { generateQuizAndExplanation, QuizAndExplanationOutput } from '@/ai/flows/active-feedback';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { searchTopic, SearchTopicOutput } from '@/ai/flows/search-topic';
import { useToast } from '@/hooks/use-toast';

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

export default function RoadmapDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
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

  // State for resources
  const [resources, setResources] = useState<SearchTopicOutput['resources'] | null>(null);
  const [isLoadingResources, setIsLoadingResources] = useState(false);

  const handleConceptClick = useCallback(async (concept: string, currentRoadmap: Roadmap) => {
    const conceptKey = `${currentRoadmap.id}-${concept}`;
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
        topic: currentRoadmap.goals,
        expertise: currentRoadmap.expertise,
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
    if (!id) return;
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        const docRef = doc(db, 'users', user.uid, 'roadmaps', id);
        const unsubscribeSnapshot = onSnapshot(docRef, (doc) => {
          if (doc.exists()) {
            const data = { id: doc.id, ...doc.data() } as Roadmap;
            setRoadmap(data);
            
            // Fetch resources when roadmap loads
            if (data.goals && !resources && !isLoadingResources) {
              setIsLoadingResources(true);
              searchTopic({topic: data.goals}).then(res => {
                  setResources(res.resources);
              }).catch(err => {
                  console.error("Failed to fetch resources", err);
              }).finally(() => {
                  setIsLoadingResources(false);
              })
            }

          } else {
            setError('Roadmap not found.');
          }
          setIsLoadingPage(false);
        }, (err) => {
          console.error(err);
          setError('Failed to fetch roadmap.');
          setIsLoadingPage(false);
        });
        return () => unsubscribeSnapshot();
      } else {
        setIsLoadingPage(false);
        setError('You must be logged in to view a roadmap.');
      }
    });
    return () => unsubscribe();
  }, [id, resources, isLoadingResources]);

  const handleToggleComplete = async (concept: string, isCompleted: boolean) => {
    if (!roadmap) return;
    const user = auth.currentUser;
    if (!user) return;
    
    const docRef = doc(db, 'users', user.uid, 'roadmaps', roadmap.id);
    try {
      if (isCompleted) {
        await updateDoc(docRef, {
          completedConcepts: arrayRemove(concept)
        });
         toast({ title: "Concept marked as incomplete."});
      } else {
        await updateDoc(docRef, {
          completedConcepts: arrayUnion(concept)
        });
         toast({ title: "Concept marked as complete!", description: "Great progress!"});
      }
    } catch(err) {
        console.error("Failed to update completion status", err);
        toast({ title: "Error", description: "Could not update completion status.", variant: "destructive"});
    }
  }

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

  const ConceptQuiz = ({concept}: {concept: string}) => {
    // This state is local to the review quiz modal, separate from the concept quiz
    const [reviewQuizData, setReviewQuizData] = useState<QuizAndExplanationOutput | null>(null);
    const [reviewQuizState, setReviewQuizState] = useState<QuizState>('idle');
    const [reviewSelectedAnswer, setReviewSelectedAnswer] = useState<string | null>(null);
    const [reviewIsCorrect, setReviewIsCorrect] = useState<boolean | null>(null);
    const [reviewFeedback, setReviewFeedback] = useState<string | null>(null);

    if (activeConcept && activeConcept === quizConceptKey) {
        // This is for the inline concept quiz
        return (
          <div className="mt-4 p-4 border-t-2 border-primary/20">
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
    
                    {quizState === 'loading' && quizData && (
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
    }
    
     return (
        <div className="mt-4 p-4 border-t-2 border-primary/20 flex gap-4">
            <Button onClick={() => handleStartQuiz(concept)}>
                <HelpCircle className="mr-2"/> Test Your Knowledge
            </Button>
        </div>
    );
  }

  if (isLoadingPage) {
     return (
        <div className="space-y-4">
            <Skeleton className="h-9 w-1/3" />
            <Skeleton className="h-5 w-1/2" />
            <div className="mt-8 space-y-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        </div>
     );
  }
  
  if (error) {
     return (
         <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive"><AlertTriangle/> Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      );
  }

  if (!roadmap) {
    return null; // or a not found component
  }
  
  const completedConcepts = roadmap.completedConcepts || [];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
            <Map className="h-8 w-8 text-primary"/>
            {roadmap.goals}
        </h1>
        <p className="text-muted-foreground">
            Created on: {roadmap.createdAt?.toDate().toLocaleDateString()}
        </p>
      </div>

     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><BookOpen className="text-primary"/> Learning Modules</CardTitle>
                <CardDescription>
                    Click a concept to get an explanation. Mark concepts as complete as you master them.
                </CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {Array.isArray(roadmap.roadmap) && roadmap.roadmap.map((item, index) => (
                        <AccordionItem value={`item-${index}`} key={index}>
                            <AccordionTrigger className="text-lg font-semibold">{item.title}</AccordionTrigger>
                            <AccordionContent>
                                <Accordion type="single" collapsible className="w-full pl-4">
                                {Array.isArray(item.concepts) && item.concepts.map((concept, conceptIndex) => {
                                    const isCompleted = completedConcepts.includes(concept);
                                    const conceptKey = `${roadmap.id}-${concept}`;

                                    return (
                                    <AccordionItem value={`concept-${conceptIndex}`} key={conceptIndex}>
                                        <div className="flex items-center gap-2">
                                            <AccordionTrigger 
                                                className="text-base flex-1"
                                                onClick={() => handleConceptClick(concept, roadmap)}
                                            >
                                                <div className="flex items-center gap-2">
                                                     {isCompleted && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                                                    <span>{concept}</span>
                                                </div>
                                            </AccordionTrigger>
                                            <Button
                                              variant={isCompleted ? "secondary" : "outline"}
                                              size="sm"
                                              onClick={() => handleToggleComplete(concept, isCompleted)}
                                              title={isCompleted ? "Mark as Incomplete" : "Mark as Complete"}
                                            >
                                                <CheckSquare className="mr-2"/>
                                                {isCompleted ? "Completed" : "Complete"}
                                            </Button>
                                        </div>
                                        <AccordionContent>
                                            {activeConcept === conceptKey && (
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
                                                </div>
                                            )}
                                        </AccordionContent>
                                    </AccordionItem>
                                    )
                                })}
                                </Accordion>
                            </AccordionContent>
                        </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-1 space-y-8 sticky top-20">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><BrainCircuit className="text-primary"/> Review Quiz</CardTitle>
                    <CardDescription>Test your knowledge on all completed concepts.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button className="w-full" disabled={completedConcepts.length === 0} onClick={() => alert("Review quiz coming soon!")}>
                        Start Review Quiz
                    </Button>
                    {completedConcepts.length === 0 && <p className="text-xs text-muted-foreground mt-2 text-center">Complete some lessons to unlock the review quiz.</p>}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><Bookmark className="text-primary"/> Related Resources</CardTitle>
                    <CardDescription>External resources to supplement your learning.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoadingResources && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                           <Loader2 className="h-4 w-4 animate-spin"/>
                           <span>Finding resources...</span>
                        </div>
                    )}
                    {resources && resources.length > 0 ? (
                        <div className="space-y-3">
                        {resources.map((resource, index) => (
                           <a href={resource.url} target="_blank" rel="noopener noreferrer" key={index} className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold text-sm">{resource.title}</p>
                                        <p className="text-xs text-muted-foreground">{resource.description}</p>
                                    </div>
                                    <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0 ml-2 mt-1"/>
                                </div>
                            </a>
                        ))}
                        </div>
                    ) : !isLoadingResources && (
                        <p className="text-sm text-muted-foreground">No resources found.</p>
                    )}
                </CardContent>
            </Card>
        </div>
     </div>
    </div>
  );
}
