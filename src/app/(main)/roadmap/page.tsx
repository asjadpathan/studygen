'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generatePersonalizedRoadmap, PersonalizedRoadmapOutput } from '@/ai/flows/personalized-roadmap';
import { generateQuizAndExplanation, QuizAndExplanationOutput } from '@/ai/flows/active-feedback';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, AlertTriangle, Map, HelpCircle, Bot } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp, collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  goals: z.string().min(10, { message: 'Please describe your goals in more detail.' }),
  expertise: z.string().min(10, { message: 'Please describe your expertise in more detail.' }),
  availableStudyTime: z.string().min(2, { message: 'Please specify your available study time.' }),
});

type FormValues = z.infer<typeof formSchema>;
type QuizAnswers = { [question: string]: string };

export default function RoadmapPage() {
  const [step, setStep] = useState<'initial' | 'quiz' | 'result'>('initial');
  const [formValues, setFormValues] = useState<FormValues | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizAndExplanationOutput[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers>({});
  const [roadmap, setRoadmap] = useState<PersonalizedRoadmapOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      goals: '',
      expertise: '',
      availableStudyTime: '',
    },
  });

  async function onInitialSubmit(values: FormValues) {
    setIsLoading(true);
    setError(null);
    setFormValues(values);

    const user = auth.currentUser;
    if (!user) {
      setError('You must be logged in to generate a roadmap.');
      setIsLoading(false);
      return;
    }

    try {
      // Generate 3 quiz questions based on the user's goals
      const questionPromises = Array(3).fill(null).map(() => 
        generateQuizAndExplanation({ topic: values.goals })
      );
      const questions = await Promise.all(questionPromises);
      setQuizQuestions(questions);
      setStep('quiz');
    } catch (e) {
      setError('Failed to generate assessment questions. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  const handleQuizAnswerChange = (question: string, answer: string) => {
    setQuizAnswers(prev => ({...prev, [question]: answer}));
  }

  async function onQuizSubmit() {
    setIsLoading(true);
    setError(null);
    const user = auth.currentUser;
    if (!user || !formValues) {
      setError('An unexpected error occurred. Please start over.');
      setIsLoading(false);
      return;
    }

    // Format quiz results to be included in expertise
    const quizSummary = quizQuestions.map(q => 
        `Question: "${q.question}"\nUser Answer: "${quizAnswers[q.question] || 'Not answered'}"\nCorrect Answer: "${q.correctAnswer}"`
    ).join('\n\n');

    const enhancedExpertise = `
      ${formValues.expertise}

      ## Skill Assessment Results
      Based on a quick quiz, here are the user's responses:
      ${quizSummary}
    `;

    try {
      const result = await generatePersonalizedRoadmap({
        ...formValues,
        expertise: enhancedExpertise,
      });
      setRoadmap(result);
      setStep('result');

      const roadmapRef = doc(collection(db, 'users', user.uid, 'roadmaps'));
      await setDoc(roadmapRef, {
        ...formValues,
        quizSummary,
        ...result,
        createdAt: serverTimestamp(),
      });
      
      toast({
        title: "Roadmap Saved",
        description: "Your new roadmap has been saved to your profile.",
      });

    } catch (e) {
      setError('Failed to generate roadmap. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  const renderInitialStep = () => (
     <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle className="font-headline">Create Your Roadmap</CardTitle>
          <CardDescription>Tell us about your learning journey, and we&apos;ll create a plan for you.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onInitialSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="goals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Learning Goals</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Pass the AP Calculus Exam" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expertise"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Expertise</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Some experience with Calculus" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="availableStudyTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Available Study Time</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 1 hour per day for 3 months" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Start Assessment
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
  );

  const renderQuizStep = () => (
    <Card className="md:col-span-3">
        <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><Bot /> Quick Assessment</CardTitle>
            <CardDescription>Answer these questions to help us tailor your roadmap.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
            {isLoading ? (
                 <div className="flex justify-center items-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                 </div>
            ) : (
              quizQuestions.map((q, i) => (
                <div key={i} className="space-y-4">
                    <p className="font-semibold flex items-start gap-2"><HelpCircle className="h-5 w-5 mt-0.5 text-primary shrink-0"/>{q.question}</p>
                    <RadioGroup 
                        onValueChange={(value) => handleQuizAnswerChange(q.question, value)}
                        value={quizAnswers[q.question]}
                        className="pl-7 space-y-2"
                    >
                        {q.options.map((option, j) => (
                            <div key={j} className="flex items-center space-x-3 space-y-0">
                                <RadioGroupItem value={option} id={`q${i}-option${j}`} />
                                <Label htmlFor={`q${i}-option${j}`} className="font-normal">{option}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>
              ))
            )}
        </CardContent>
        <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setStep('initial')}>Back</Button>
            <Button onClick={onQuizSubmit} disabled={isLoading || Object.keys(quizAnswers).length < quizQuestions.length}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate My Roadmap
            </Button>
        </CardFooter>
    </Card>
  );

  const renderResultView = () => (
     <div className="md:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Map className="text-primary"/>
              Your Learning Path
              </CardTitle>
            <CardDescription>Your generated roadmap will appear here.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
               <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            )}
            {error && (
              <div className="text-destructive flex items-center gap-2">
                <AlertTriangle /> {error}
              </div>
            )}
            {roadmap && (
               <Accordion type="single" collapsible className="w-full">
                  {roadmap.roadmap.map((item, index) => (
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
            )}
             {!isLoading && !roadmap && !error && (
              <div className="text-center text-muted-foreground py-16">
                  <Map size={48} className="mx-auto mb-4"/>
                  <p>Your personalized roadmap is waiting to be discovered.</p>
              </div>
             )}
          </CardContent>
           {roadmap && (
            <CardFooter>
                <Button onClick={() => {
                    setStep('initial');
                    setRoadmap(null);
                    setQuizQuestions([]);
                    setQuizAnswers({});
                    form.reset();
                }}>
                    Create Another Roadmap
                </Button>
            </CardFooter>
           )}
        </Card>
      </div>
  )

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Personalized Roadmap</h1>
        <p className="text-muted-foreground">Chart your course to mastery with an AI-generated learning plan.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        {step === 'initial' && renderInitialStep()}
        {step === 'quiz' && renderQuizStep()}
        {step === 'result' && (
            <>
                {/* To keep layout consistent, show a summary card */}
                <Card className="md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="font-headline">Your Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                       <div>
                            <p className="font-semibold">Learning Goal</p>
                            <p className="text-muted-foreground">{formValues?.goals}</p>
                       </div>
                        <div>
                            <p className="font-semibold">Current Expertise</p>
                            <p className="text-muted-foreground">{formValues?.expertise}</p>
                       </div>
                        <div>
                            <p className="font-semibold">Available Time</p>
                            <p className="text-muted-foreground">{formValues?.availableStudyTime}</p>
                       </div>
                    </CardContent>
                </Card>
                {renderResultView()}
            </>
        )}
        
        {step !== 'result' && (
            <div className="md:col-span-2">
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2">
                        <Map className="text-primary"/>
                        Your Learning Path
                        </CardTitle>
                        <CardDescription>Your generated roadmap will appear here.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="text-center text-muted-foreground py-16">
                            <Bot size={48} className="mx-auto mb-4"/>
                            <p>Complete the form and the assessment to generate your personalized roadmap.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )}
      </div>
    </div>
  );
}
