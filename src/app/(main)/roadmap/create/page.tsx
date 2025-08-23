
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { generatePersonalizedRoadmap } from '@/ai/flows/personalized-roadmap';
import { generateQuizAndExplanation, QuizAndExplanationOutput } from '@/ai/flows/active-feedback';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, AlertTriangle, Map, HelpCircle, Bot, Sparkles, ArrowLeft } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp, collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { motion } from 'framer-motion';

const learningStyles = [
  { id: 'visual', label: 'Visual' },
  { id: 'auditory', label: 'Auditory' },
  { id: 'kinesthetic', label: 'Kinesthetic (Hands-on)' },
  { id: 'reading_writing', label: 'Reading/Writing' },
];

const resourceTypes = [
  { id: 'videos', label: 'Videos', icon: '🎬' },
  { id: 'articles', label: 'Articles', icon: '📝' },
  { id: 'interactive_labs', label: 'Interactive Labs', icon: '🔬' },
  { id: 'books', label: 'Books', icon: '📚' },
  { id: 'projects', label: 'Projects', icon: '🚀' },
];

const formSchema = z.object({
  goals: z.string().min(10, { message: 'Please describe your goals in more detail.' }),
  expertise: z.string().min(10, { message: 'Please describe your expertise in more detail.' }),
  availableStudyTime: z.string().min(2, { message: 'Please specify your available study time.' }),
  learningStyle: z.array(z.string()).optional(),
  preferredResourceTypes: z.array(z.string()).optional(),
  specificTopics: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;
type QuizAnswers = { [question: string]: string };

export default function CreateRoadmapPage() {
  const [step, setStep] = useState<'initial' | 'quiz' | 'result'>('initial');
  const [formValues, setFormValues] = useState<FormValues | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizAndExplanationOutput[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      goals: '',
      expertise: '',
      availableStudyTime: '',
      learningStyle: [],
      preferredResourceTypes: [],
      specificTopics: '',
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

      const roadmapRef = doc(collection(db, 'users', user.uid, 'roadmaps'));
      await setDoc(roadmapRef, {
        ...formValues,
        quizSummary,
        ...result,
        createdAt: serverTimestamp(),
      });
      
      toast({
        title: "Roadmap Created!",
        description: "Your personalized learning roadmap has been saved.",
      });

      router.push(`/roadmap/${roadmapRef.id}`);

    } catch (e) {
      setError('Failed to generate roadmap. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  const renderInitialStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto w-full"
    >
      <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg rounded-xl overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
        <CardHeader className="pb-3">
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-indigo-600" />
            Create a New Roadmap
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Tell us about your learning journey, and we'll create a personalized plan for you.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onInitialSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="goals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-900 dark:text-gray-100">Learning Goals</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Pass the AP Calculus Exam" 
                        {...field} 
                        className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                      />
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
                    <FormLabel className="text-gray-900 dark:text-gray-100">Current Expertise</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="e.g., Some experience with Calculus, basic understanding of derivatives." 
                        {...field} 
                        className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 min-h-[100px]"
                      />
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
                    <FormLabel className="text-gray-900 dark:text-gray-100">Available Study Time</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., 5 hours a week for 3 months" 
                        {...field} 
                        className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="learningStyle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-900 dark:text-gray-100">Preferred Learning Style(s)</FormLabel>
                    <FormDescription className="text-gray-600 dark:text-gray-400">
                      Select one or more styles that work best for you.
                    </FormDescription>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {learningStyles.map((item) => (
                        <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(item.id)}
                              onCheckedChange={(checked) => {
                                const currentValue = field.value || [];
                                if (checked) {
                                  field.onChange([...currentValue, item.id]);
                                } else {
                                  field.onChange(currentValue.filter((value) => value !== item.id));
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {item.label}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferredResourceTypes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-900 dark:text-gray-100">Preferred Resource Types</FormLabel>
                    <FormDescription className="text-gray-600 dark:text-gray-400">
                      What kind of materials do you prefer?
                    </FormDescription>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {resourceTypes.map((item) => (
                        <FormItem key={item.id} className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(item.id)}
                              onCheckedChange={(checked) => {
                                const currentValue = field.value || [];
                                if (checked) {
                                  field.onChange([...currentValue, item.id]);
                                } else {
                                  field.onChange(currentValue.filter((value) => value !== item.id));
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal flex items-center gap-2">
                            <span className="text-lg">{item.icon}</span> {item.label}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="specificTopics"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-900 dark:text-gray-100">Specific Topics to Include/Exclude</FormLabel>
                    <FormDescription className="text-gray-600 dark:text-gray-400">
                      Are there any topics you definitely want to focus on or skip? (Optional)
                    </FormDescription>
                    <FormControl>
                      <Textarea 
                        placeholder="e.g., Focus on integration techniques, skip related rates." 
                        {...field} 
                        className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md"
                size="lg"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Start Assessment
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </motion.div>
  );

  const renderQuizStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto w-full"
    >
      <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg rounded-xl overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-purple-600 to-pink-600"></div>
        <CardHeader className="pb-3">
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Bot className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            Quick Assessment
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Answer these questions to help us tailor your roadmap.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              <p className="text-gray-600 dark:text-gray-400">Generating your assessment...</p>
            </div>
          ) : (
            quizQuestions.map((q, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="space-y-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50"
              >
                <p className="font-semibold text-gray-900 dark:text-gray-100 flex items-start gap-2">
                  <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30 mt-0.5">
                    <HelpCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0"/>
                  </div>
                  {q.question}
                </p>
                <RadioGroup 
                  onValueChange={(value) => handleQuizAnswerChange(q.question, value)}
                  value={quizAnswers[q.question]}
                  className="pl-7 space-y-3"
                >
                  {q.options.map((option, j) => (
                    <div key={j} className="flex items-center space-x-3">
                      <RadioGroupItem 
                        value={option} 
                        id={`q${i}-option${j}`} 
                        className="text-blue-600 border-gray-300"
                      />
                      <Label 
                        htmlFor={`q${i}-option${j}`} 
                        className="font-normal text-gray-800 dark:text-gray-200 cursor-pointer"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </motion.div>
            ))
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => setStep('initial')} 
            className="border-gray-300 shadow-sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button 
            onClick={onQuizSubmit} 
            disabled={isLoading || Object.keys(quizAnswers).length < quizQuestions.length}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate My Roadmap
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );

  return (
    <div className="flex flex-col gap-8 p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          New Learning Roadmap
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Chart your course to mastery with an AI-generated learning plan.</p>
      </motion.div>
      
      {step === 'initial' && renderInitialStep()}
      {step === 'quiz' && renderQuizStep()}
      
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
              <p className="text-gray-900 dark:text-gray-100">{error}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
