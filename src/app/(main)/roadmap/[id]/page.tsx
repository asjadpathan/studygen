'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Map, Loader2, BookOpen, HelpCircle, CheckCircle2, XCircle, Lightbulb, AlertTriangle, ExternalLink, Bookmark, CheckSquare, BrainCircuit, Trash2, Sparkles, ChevronDown, ChevronRight, Target, Clock, BarChart3, ArrowRight, RefreshCw, X } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { getConceptExplanation, GetConceptExplanationOutput } from '@/ai/flows/get-concept-explanation';
import { generateQuizAndExplanation, QuizAndExplanationOutput } from '@/ai/flows/active-feedback';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { searchTopic, SearchTopicOutput } from '@/ai/flows/search-topic';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { generateReviewQuiz } from '@/ai/flows/review-quiz';
import type { ReviewQuizOutput } from '@/ai/schemas/review-quiz';


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
  completedConcepts?: { name: string; completedAt: any }[];
}

type QuizState = 'idle' | 'loading' | 'ready' | 'answered';
type ReviewQuizState = 'idle' | 'loading' | 'ready' | 'submitted' | 'error';
type QuizItem = ReviewQuizOutput['quiz'][0];

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
  const router = useRouter();
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

  // State for Review Quiz
  const [isReviewQuizOpen, setIsReviewQuizOpen] = useState(false);
  const [reviewQuizState, setReviewQuizState] = useState<ReviewQuizState>('idle');
  const [reviewQuizData, setReviewQuizData] = useState<QuizItem[]>([]);
  const [reviewQuizAnswers, setReviewQuizAnswers] = useState<Record<number, string>>({});
  const [reviewQuizScore, setReviewQuizScore] = useState<number | null>(null);

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

  const handleToggleComplete = async (conceptName: string, isCompleted: boolean) => {
    if (!roadmap) return;
    const user = auth.currentUser;
    if (!user) return;
    
    const docRef = doc(db, 'users', user.uid, 'roadmaps', roadmap.id);
    try {
      if (isCompleted) {
        // To remove, we need to find the specific object to remove.
        const conceptToRemove = roadmap.completedConcepts?.find(c => c.name === conceptName);
        if (conceptToRemove) {
          await updateDoc(docRef, {
            completedConcepts: arrayRemove(conceptToRemove)
          });
          toast({ title: "Concept marked as incomplete."});
        }
      } else {
        await updateDoc(docRef, {
          completedConcepts: arrayUnion({ name: conceptName, completedAt: new Date() })
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
  
  const handleDeleteRoadmap = async () => {
    if (!roadmap) return;
    const user = auth.currentUser;
    if (!user) return;
    
    const docRef = doc(db, 'users', user.uid, 'roadmaps', roadmap.id);
    try {
        await deleteDoc(docRef);
        toast({ title: "Roadmap Deleted", description: "The roadmap has been successfully removed."});
        router.push('/roadmap');
    } catch (err) {
        console.error("Failed to delete roadmap", err);
        toast({ title: "Error", description: "Could not delete the roadmap.", variant: "destructive"});
    }
  }
  
  const handleStartReviewQuiz = useCallback(async () => {
    const completedConceptNames = roadmap?.completedConcepts?.map(c => c.name) || [];
    if (completedConceptNames.length === 0) return;

    setReviewQuizState('loading');
    setReviewQuizAnswers({});
    setReviewQuizScore(null);
    setReviewQuizData([]);

    try {
      const result = await generateReviewQuiz({ topics: completedConceptNames });
      setReviewQuizData(result.quiz);
      setReviewQuizState('ready');
    } catch (err) {
      console.error(err);
      setReviewQuizState('error');
    }
  }, [roadmap?.completedConcepts]);

  const handleSubmitReviewQuiz = () => {
    let score = 0;
    reviewQuizData.forEach((q, index) => {
      if (reviewQuizAnswers[index] === q.correctAnswer) {
        score++;
      }
    });
    setReviewQuizScore(score);
    setReviewQuizState('submitted');
  };

  const calculateProgress = (roadmap: Roadmap) => {
    if (!Array.isArray(roadmap.roadmap)) return 0;
    const totalConcepts = roadmap.roadmap?.flatMap(module => module.concepts || []).length || 0;
    if (totalConcepts === 0) return 0;
    const completedConcepts = roadmap.completedConcepts?.length || 0;
    return Math.round((completedConcepts / totalConcepts) * 100);
  }

  const ConceptQuiz = ({concept}: {concept: string}) => {
    if (activeConcept && activeConcept === quizConceptKey) {
        // This is for the inline concept quiz
        return (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
          >
            {(quizState === 'loading' && !quizData) && (
              <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin"/>
                  <span>Generating quiz...</span>
              </div>
            )}
    
            {quizData && (quizState === 'ready' || quizState === 'answered' || (quizState === 'loading' && !!quizData)) && (
                <div className="space-y-4">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{quizData.question}</p>
                    <RadioGroup
                      value={selectedAnswer ?? ''}
                      onValueChange={setSelectedAnswer}
                      disabled={quizState === 'answered' || quizState === 'loading'}
                      className="space-y-2"
                    >
                      {quizData.options.map((option, index) => (
                         <Label 
                           key={index} 
                           htmlFor={`quiz-${index}`} 
                           className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                             quizState === 'answered' && option === quizData.correctAnswer 
                               ? 'border-green-500 bg-green-500/10 text-green-900 dark:text-green-100' 
                               : ''
                           } ${
                             quizState === 'answered' && option === selectedAnswer && !isCorrect 
                               ? 'border-red-500 bg-red-500/10 text-red-900 dark:text-red-100' 
                               : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                           }`}
                         >
                            <RadioGroupItem 
                              value={option} 
                              id={`quiz-${index}`} 
                              disabled={quizState === 'answered' || quizState === 'loading'} 
                              className="text-blue-600"
                            />
                            <span>{option}</span>
                         </Label>
                      ))}
                    </RadioGroup>
    
                    {quizState === 'answered' && isCorrect !== null && (
                       <Alert variant={isCorrect ? "default" : "destructive"} className={isCorrect ? "border-green-500 bg-green-500/10 text-green-900 dark:text-green-100" : ""}>
                        {isCorrect ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                        <AlertTitle>{isCorrect ? 'Correct!' : 'Not quite!'}</AlertTitle>
                        <AlertDescription>
                          {isCorrect ? 'Great job!' : `The correct answer is: ${quizData.correctAnswer}`}
                        </AlertDescription>
                      </Alert>
                    )}
    
                    {quizFeedback && (
                      <Alert className="mt-4 animate-in fade-in-50 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
                        <Lightbulb className="h-4 w-4 text-blue-600" />
                        <AlertTitle className="text-blue-900 dark:text-blue-100">Explanation</AlertTitle>
                        <AlertDescription className="text-blue-800 dark:text-blue-200 whitespace-pre-wrap">{quizFeedback}</AlertDescription>
                      </Alert>
                    )}
    
                    {quizState === 'loading' && quizData && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin"/>
                          <span>Checking answer...</span>
                      </div>
                    )}
    
                    {quizState === 'ready' && (
                      <Button 
                        onClick={handleQuizSubmit} 
                        disabled={!selectedAnswer}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md"
                      >
                        Submit Answer
                      </Button>
                    )}
                    {quizState === 'answered' && (
                      <Button 
                        onClick={() => handleStartQuiz(concept)}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md"
                      >
                        Try another question
                      </Button>
                    )}
                </div>
            )}
          </motion.div>
        );
    }
    
     return (
        <div className="mt-4 flex gap-4">
            <Button 
              onClick={() => handleStartQuiz(concept)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md"
            >
                <HelpCircle className="mr-2 h-4 w-4"/> Test Your Knowledge
            </Button>
        </div>
    );
  }

  const ReviewQuizDialog = () => (
    <Dialog open={isReviewQuizOpen} onOpenChange={setIsReviewQuizOpen}>
      <DialogContent className="max-w-3xl bg-white dark:bg-gray-800 border-0 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-gray-100 text-2xl font-headline flex items-center gap-3">
             <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <BrainCircuit className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            Review Quiz
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Test your knowledge on the concepts you've completed.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto p-1 pr-4 custom-scrollbar">
          <AnimatePresence mode="wait">
            {reviewQuizState === 'loading' && (
              <motion.div key="loading" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="flex flex-col items-center justify-center gap-4 py-20">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                <p className="text-muted-foreground">Generating your review quiz...</p>
              </motion.div>
            )}

            {reviewQuizState === 'error' && (
              <motion.div key="error" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="flex flex-col items-center justify-center gap-4 py-20">
                <AlertTriangle className="h-8 w-8 text-destructive" />
                <p className="text-destructive">Failed to generate quiz.</p>
                <Button onClick={handleStartReviewQuiz}><RefreshCw className="mr-2 h-4 w-4" /> Try Again</Button>
              </motion.div>
            )}

            {reviewQuizState === 'ready' && (
              <motion.div key="ready" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="space-y-6">
                {reviewQuizData.map((item, index) => (
                  <div key={index} className="space-y-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{index + 1}. {item.question}</p>
                    <RadioGroup
                      value={reviewQuizAnswers[index] || ''}
                      onValueChange={(value) => setReviewQuizAnswers(prev => ({...prev, [index]: value}))}
                      className="space-y-2"
                    >
                      {item.options.map((option, i) => (
                        <Label key={i} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 cursor-pointer transition-colors">
                          <RadioGroupItem value={option} id={`review-q${index}-o${i}`} className="text-purple-600" />
                          <span>{option}</span>
                        </Label>
                      ))}
                    </RadioGroup>
                  </div>
                ))}
                 <div className="flex justify-end pt-4">
                    <Button 
                        onClick={handleSubmitReviewQuiz} 
                        disabled={Object.keys(reviewQuizAnswers).length !== reviewQuizData.length}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-md"
                    >
                        Submit Quiz
                    </Button>
                 </div>
              </motion.div>
            )}
            
            {reviewQuizState === 'submitted' && reviewQuizScore !== null && (
                <motion.div key="submitted" initial={{opacity: 0, scale: 0.9}} animate={{opacity: 1, scale: 1}} exit={{opacity: 0}} className="text-center py-10">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Quiz Complete!</h2>
                    <p className="text-5xl font-bold my-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                        {Math.round((reviewQuizScore / reviewQuizData.length) * 100)}%
                    </p>
                    <p className="text-muted-foreground">You scored {reviewQuizScore} out of {reviewQuizData.length}.</p>
                    <div className="mt-8 flex justify-center gap-4">
                        <Button variant="outline" onClick={() => { setReviewQuizState('ready'); setReviewQuizScore(null); setReviewQuizAnswers({}); }}>Review Answers</Button>
                        <Button onClick={handleStartReviewQuiz} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-md">
                            <RefreshCw className="mr-2 h-4 w-4"/>
                            Take Again
                        </Button>
                    </div>
                </motion.div>
            )}

          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );

  if (isLoadingPage) {
     return (
        <div className="space-y-4 p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 min-h-screen">
            <Skeleton className="h-9 w-1/3 rounded-lg" />
            <Skeleton className="h-5 w-1/2 rounded-lg" />
            <div className="mt-8 space-y-4">
                <Skeleton className="h-48 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
            </div>
        </div>
     );
  }
  
  if (error) {
     return (
        <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 min-h-screen">
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg rounded-xl overflow-hidden border-l-4 border-l-destructive">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5"/> 
                Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-900 dark:text-gray-100">{error}</p>
            </CardContent>
          </Card>
        </div>
      );
  }

  if (!roadmap) {
    return null; // or a not found component
  }
  
  const completedConceptNames = roadmap.completedConcepts?.map(c => c.name) || [];
  const progress = calculateProgress(roadmap);
  const totalConcepts = roadmap.roadmap?.flatMap(module => module.concepts || []).length || 0;

  return (
    <div className="flex flex-col gap-8 p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 min-h-screen">
      <ReviewQuizDialog />
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            {roadmap.goals}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Created on: {roadmap.createdAt?.toDate().toLocaleDateString()}
          </p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-md">
              <Trash2 className="mr-2 h-4 w-4" /> Delete Roadmap
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-white dark:bg-gray-800 border-0 rounded-xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-gray-900 dark:text-gray-100">Are you sure?</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
                This action cannot be undone. This will permanently delete your roadmap and all its associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-gray-300 bg-white hover:bg-gray-50 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-600">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteRoadmap}
                className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>

      {/* Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg rounded-xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              Progress Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Progress</span>
                <span className="text-sm font-bold text-blue-600">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Total Concepts</span>
                </div>
                <p className="text-2xl font-bold mt-1">{totalConcepts}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Completed</span>
                </div>
                <p className="text-2xl font-bold mt-1">{completedConceptNames.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg rounded-xl overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                    <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  Learning Modules
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Click a concept to get an explanation. Mark concepts as complete as you master them.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {Array.isArray(roadmap.roadmap) && roadmap.roadmap.map((item, index) => (
                    <AccordionItem value={`item-${index}`} key={index} className="border-b border-gray-200 dark:border-gray-700">
                      <AccordionTrigger className="text-lg font-semibold text-gray-900 dark:text-gray-100 hover:no-underline py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                            <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          {item.title}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-4">
                        <Accordion type="single" collapsible className="w-full pl-4">
                          {Array.isArray(item.concepts) && item.concepts.map((concept, conceptIndex) => {
                            const isCompleted = completedConceptNames.includes(concept);
                            const conceptKey = `${roadmap.id}-${concept}`;

                            return (
                              <AccordionItem value={`concept-${conceptIndex}`} key={conceptIndex} className="border-b border-gray-100 dark:border-gray-800 last:border-b-0">
                                <div className="flex items-center gap-2 py-3">
                                  <AccordionTrigger 
                                    className="text-base flex-1 hover:no-underline py-0"
                                    onClick={() => handleConceptClick(concept, roadmap)}
                                  >
                                    <div className="flex items-center gap-2">
                                      {isCompleted ? (
                                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                                      ) : (
                                        <div className="h-5 w-5 rounded-full border-2 border-gray-300 dark:border-gray-600 flex-shrink-0" />
                                      )}
                                      <span className="text-gray-900 dark:text-gray-100">{concept}</span>
                                    </div>
                                  </AccordionTrigger>
                                  <Button
                                    variant={isCompleted ? "secondary" : "outline"}
                                    size="sm"
                                    onClick={() => handleToggleComplete(concept, isCompleted)}
                                    title={isCompleted ? "Mark as Incomplete" : "Mark as Complete"}
                                    className={isCompleted ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50" : "border-gray-300"}
                                  >
                                    <CheckSquare className="mr-2 h-3 w-3"/>
                                    {isCompleted ? "Completed" : "Complete"}
                                  </Button>
                                </div>
                                <AccordionContent className="pl-7">
                                  {activeConcept === conceptKey && (
                                    <motion.div 
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 mt-2"
                                    >
                                      {isLoadingExplanation && (
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                          <Loader2 className="h-4 w-4 animate-spin"/>
                                          <span>Generating explanation...</span>
                                        </div>
                                      )}
                                      {explanation && (
                                        <>
                                          <div className="prose prose-sm dark:prose-invert max-w-none text-gray-900 dark:text-gray-100"
                                            dangerouslySetInnerHTML={{ __html: markdownToHtml(explanation.explanation) }}
                                          />
                                          <ConceptQuiz concept={concept}/>
                                        </>
                                      )}
                                    </motion.div>
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
          </motion.div>
        </div>

        <div className="lg:col-span-1 space-y-8 sticky top-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg rounded-xl overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                    <BrainCircuit className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  Review Quiz
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Test your knowledge on all completed concepts.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-md"
                  disabled={completedConceptNames.length === 0} 
                  onClick={() => {
                      setIsReviewQuizOpen(true);
                      handleStartReviewQuiz();
                  }}
                >
                  Start Review Quiz
                </Button>
                {completedConceptNames.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Complete some lessons to unlock the review quiz.
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg rounded-xl overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-amber-500 to-orange-500"></div>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                    <Bookmark className="h-5 w-5 text-amber-600 dark:bg-amber-400" />
                  </div>
                  Related Resources
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  External resources to supplement your learning.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoadingResources && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin"/>
                    <span>Finding resources...</span>
                  </div>
                )}
                {resources && resources.length > 0 ? (
                  resources.map((resource, index) => (
                    <motion.a 
                      key={index}
                      href={resource.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="block p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {resource.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {resource.description}
                          </p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0 ml-2 mt-1 group-hover:text-blue-600 transition-colors"/>
                      </div>
                    </motion.a>
                  ))
                ) : !isLoadingResources && (
                  <p className="text-sm text-muted-foreground text-center py-4">No resources found.</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
     </div>
    </div>
  );
}
