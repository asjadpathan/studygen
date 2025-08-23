'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadCloud, File, X, Loader2, AlertTriangle, BookText, HelpCircle, Lightbulb, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { processMaterial, ProcessMaterialOutput } from '@/ai/flows/process-material';
import { generateQuizAndExplanation } from '@/ai/flows/active-feedback';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

type QuizItem = ProcessMaterialOutput['quiz'][0];

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ProcessMaterialOutput | null>(null);
  
  // State for interactive quiz
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({});
  const [explanations, setExplanations] = useState<Record<number, string>>({});
  const [loadingExplanation, setLoadingExplanation] = useState<Record<number, boolean>>({});

  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prevFiles => [acceptedFiles[0]]); // Only allow one file
    setResults(null);
    setError(null);
    setAnswers({});
    setSubmitted({});
    setExplanations({});
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
    },
    multiple: false,
  });

  const removeFile = (fileName: string) => {
    setFiles(files.filter(file => file.name !== fileName));
    setResults(null);
  };
  
  const handleProcess = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please upload a file to process.",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    setResults(null);

    const file = files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const fileDataUri = reader.result as string;
        const result = await processMaterial({ fileDataUri });
        setResults(result);
        toast({
          title: "Processing Complete",
          description: `Your materials have been converted.`,
        });
      } catch(e) {
        console.error(e);
        setError("Failed to process the material. Please try again with a different file.");
        toast({
            title: "Processing Failed",
            description: "There was an error processing your file.",
            variant: "destructive"
        });
      } finally {
        setIsProcessing(false);
      }
    };
    reader.onerror = () => {
        setError("Failed to read the file.");
        setIsProcessing(false);
    }
  };

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setAnswers(prev => ({...prev, [questionIndex]: answer}));
  }

  const handleQuizSubmit = async (questionIndex: number, question: QuizItem) => {
    const userAnswer = answers[questionIndex];
    if (!userAnswer) return;

    setSubmitted(prev => ({...prev, [questionIndex]: true}));
    
    const isCorrect = userAnswer === question.correctAnswer;
    if(!isCorrect) {
        setLoadingExplanation(prev => ({...prev, [questionIndex]: true}));
        try {
            const result = await generateQuizAndExplanation({
                topic: `the context of the question: "${question.question}"`,
                userAnswer: userAnswer,
                correctAnswer: question.correctAnswer,
            });
            setExplanations(prev => ({...prev, [questionIndex]: result.explanation}));
        } catch (e) {
            console.error("Failed to get explanation", e);
            setExplanations(prev => ({...prev, [questionIndex]: "Sorry, couldn't load an explanation."}));
        } finally {
            setLoadingExplanation(prev => ({...prev, [questionIndex]: false}));
        }
    }
  }

  return (
    <div className="flex flex-col gap-8">
       <div>
        <h1 className="text-3xl font-bold font-headline">Upload Material</h1>
        <p className="text-muted-foreground">Convert your study guides into interactive quizzes and flashcards.</p>
      </div>

      <Card className="max-w-3xl mx-auto w-full">
        <CardHeader>
          <CardTitle className="font-headline">Upload Your Study Guide</CardTitle>
          <CardDescription>Drag and drop your file here or click to browse. Supported formats: PDF, DOCX, TXT, PNG, JPG.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 font-semibold">
              {isDragActive ? 'Drop the file here...' : "Drag 'n' drop a file here, or click to select a file"}
            </p>
            <p className="text-sm text-muted-foreground">Max file size: 10MB</p>
          </div>

          {files.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Selected File:</h3>
              <ul className="space-y-2">
                {files.map(file => (
                  <li key={file.name} className="flex items-center justify-between p-2 bg-secondary rounded-md">
                    <div className="flex items-center gap-2">
                      <File className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm font-medium">{file.name}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeFile(file.name)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <Button onClick={handleProcess} disabled={files.length === 0 || isProcessing} className="w-full">
            {isProcessing ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
            ) : (
                'Process Material'
            )}
          </Button>
        </CardContent>
      </Card>
      
       {error && (
         <Card className="max-w-3xl mx-auto w-full border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive"><AlertTriangle/> Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {results && (
        <div className="max-w-3xl mx-auto w-full space-y-8 animate-in fade-in-50">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><BookText className="text-primary"/> Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">{results.summary}</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><HelpCircle className="text-primary"/> Generated Quiz</CardTitle>
                     <CardDescription>Test your knowledge based on the uploaded material.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {Array.isArray(results.quiz) && results.quiz.map((item, index) => {
                        const isSubmitted = submitted[index];
                        const userAnswer = answers[index];
                        const isCorrect = isSubmitted && userAnswer === item.correctAnswer;
                        const isIncorrect = isSubmitted && userAnswer !== item.correctAnswer;
                        
                        return (
                            <div key={index} className="border-t pt-6">
                                <p className="font-semibold mb-4">{index + 1}. {item.question}</p>
                                <RadioGroup
                                    value={userAnswer}
                                    onValueChange={(value) => handleAnswerChange(index, value)}
                                    disabled={isSubmitted}
                                    className="space-y-2"
                                >
                                    {item.options.map((option, i) => {
                                        const isCorrectOption = option === item.correctAnswer;
                                        const isSelectedOption = option === userAnswer;
                                        return (
                                             <Label key={i} htmlFor={`q${index}-option${i}`} className={`flex items-center gap-3 p-3 rounded-md border transition-all ${
                                                isSubmitted && isCorrectOption ? 'border-green-500 bg-green-500/10' : ''
                                             } ${
                                                isSubmitted && isSelectedOption && !isCorrectOption ? 'border-destructive bg-destructive/10' : ''
                                             }`}>
                                                <RadioGroupItem value={option} id={`q${index}-option${i}`} disabled={isSubmitted} />
                                                <span>{option}</span>
                                            </Label>
                                        )
                                    })}
                                </RadioGroup>
                                <div className="mt-4">
                                     {!isSubmitted && (
                                        <Button 
                                            size="sm"
                                            onClick={() => handleQuizSubmit(index, item)}
                                            disabled={!userAnswer}
                                        >
                                            Submit
                                        </Button>
                                    )}

                                    {isSubmitted && (
                                        isCorrect ? (
                                             <Alert variant="default" className="border-green-500 text-green-700">
                                                <CheckCircle2 className="h-4 w-4" />
                                                <AlertTitle>Correct!</AlertTitle>
                                            </Alert>
                                        ) : (
                                            <Alert variant="destructive">
                                                <XCircle className="h-4 w-4" />
                                                <AlertTitle>Incorrect!</AlertTitle>
                                                <AlertDescription>The correct answer is: <strong>{item.correctAnswer}</strong></AlertDescription>
                                            </Alert>
                                        )
                                    )}

                                    {loadingExplanation[index] && (
                                        <div className="flex items-center gap-2 mt-4 text-muted-foreground">
                                            <Loader2 className="h-4 w-4 animate-spin"/>
                                            <span>Generating explanation...</span>
                                        </div>
                                    )}

                                    {explanations[index] && (
                                        <Alert className="mt-4 animate-in fade-in-50">
                                            <Lightbulb className="h-4 w-4" />
                                            <AlertTitle>Explanation</AlertTitle>
                                            <AlertDescription className="whitespace-pre-wrap">{explanations[index]}</AlertDescription>
                                        </Alert>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                    </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
}
