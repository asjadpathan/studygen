'use client';

import { useState, useEffect, useCallback } from 'react';
import { generateQuizAndExplanation, QuizAndExplanationOutput } from '@/ai/flows/active-feedback';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle2, XCircle, Lightbulb } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type QuizState = 'loading' | 'ready' | 'answered';

export default function StudyPage() {
  const [quizData, setQuizData] = useState<QuizAndExplanationOutput | null>(null);
  const [state, setState] = useState<QuizState>('loading');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [topic, setTopic] = useState('High School Calculus');

  const fetchQuestion = useCallback(async (isRetry = false, userAnswer?: string, correctAnswer?: string) => {
    setState('loading');
    setFeedback(null);
    setSelectedAnswer(null);
    setIsCorrect(null);

    try {
      let result;
      if (isRetry && userAnswer && correctAnswer) {
        result = await generateQuizAndExplanation({
          topic,
          userAnswer,
          correctAnswer
        });
        setFeedback(result.explanation);
        // Keep the same question
      } else {
        result = await generateQuizAndExplanation({ topic });
        setQuizData(result);
      }
    } catch (error) {
      console.error('Failed to fetch quiz question:', error);
      setFeedback('Sorry, there was an error generating the question. Please try again.');
    } finally {
      setState('ready');
    }
  }, [topic]);

  useEffect(() => {
    fetchQuestion();
  }, [fetchQuestion]);

  const handleSubmit = async () => {
    if (!selectedAnswer || !quizData) return;

    setState('answered');
    const correct = selectedAnswer === quizData.correctAnswer;
    setIsCorrect(correct);

    if (!correct) {
      setState('loading');
      try {
        const result = await generateQuizAndExplanation({
          topic,
          userAnswer: selectedAnswer,
          correctAnswer: quizData.correctAnswer,
        });
        setFeedback(result.explanation);
      } catch (error) {
        console.error('Failed to fetch explanation:', error);
        setFeedback('Sorry, there was an error generating the explanation.');
      } finally {
        setState('answered');
      }
    }
  };

  const handleNext = () => {
    fetchQuestion();
  };

  return (
     <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Study Zone</h1>
        <p className="text-muted-foreground">Test your knowledge with AI-generated quizzes and get instant feedback.</p>
      </div>

      <Card className="max-w-3xl mx-auto w-full">
        <CardHeader>
          <CardTitle className="font-headline">Topic: {topic}</CardTitle>
          <CardDescription>Select the correct answer below.</CardDescription>
        </CardHeader>
        <CardContent>
          {state === 'loading' && !quizData ? (
            <div className="space-y-6">
              <Skeleton className="h-6 w-full" />
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ) : quizData && (
            <div className="space-y-6">
              <p className="text-lg font-semibold">{quizData.question}</p>
              <RadioGroup
                value={selectedAnswer ?? ''}
                onValueChange={setSelectedAnswer}
                disabled={state === 'answered' || state === 'loading'}
              >
                {quizData.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1">
                      <div className={`p-3 rounded-md border transition-all ${
                        state === 'answered' && option === quizData.correctAnswer ? 'border-green-500 bg-green-500/10' : ''
                      } ${
                        state === 'answered' && option === selectedAnswer && !isCorrect ? 'border-destructive bg-destructive/10' : ''
                      }`}>
                        {option}
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              
              {state === 'answered' && isCorrect !== null && (
                 <Alert variant={isCorrect ? "default" : "destructive"} className={isCorrect ? "border-green-500 text-green-700" : ""}>
                  {isCorrect ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  <AlertTitle>{isCorrect ? 'Correct!' : 'Not quite!'}</AlertTitle>
                  <AlertDescription>
                    {isCorrect ? 'Great job! You nailed it.' : "That's not the right answer. Keep trying!"}
                  </AlertDescription>
                </Alert>
              )}
              
              {state === 'loading' && feedback === null ? (
                <div className="flex justify-center items-center py-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : state !== 'loading' && (
                <div className="flex gap-4">
                  <Button onClick={handleSubmit} disabled={!selectedAnswer || state === 'answered' || state === 'loading'}>
                    Submit Answer
                  </Button>
                  {state === 'answered' && (
                    <Button onClick={handleNext}>
                      Next Question
                    </Button>
                  )}
                </div>
              )}

              {feedback && (
                <Alert className="mt-4 animate-in fade-in-50">
                  <Lightbulb className="h-4 w-4" />
                  <AlertTitle>Explanation</AlertTitle>
                  <AlertDescription className="whitespace-pre-wrap">{feedback}</AlertDescription>
                </Alert>
              )}

            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
