'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadCloud, File, X, Loader2, AlertTriangle, BookText, HelpCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { processMaterial, ProcessMaterialOutput } from '@/ai/flows/process-material';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ProcessMaterialOutput | null>(null);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prevFiles => [...prevFiles, ...acceptedFiles]);
    setResults(null);
    setError(null);
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
                </CardHeader>
                <CardContent>
                   <Accordion type="single" collapsible className="w-full">
                    {Array.isArray(results.quiz) && results.quiz.map((item, index) => (
                        <AccordionItem value={`item-${index}`} key={index}>
                        <AccordionTrigger>{item.question}</AccordionTrigger>
                        <AccordionContent>
                            <ul className="space-y-2 pl-4">
                            {item.options.map((option, i) => (
                                <li key={i} className={`text-muted-foreground ${option === item.correctAnswer ? 'font-bold text-primary' : ''}`}>
                                    {option}
                                </li>
                            ))}
                            </ul>
                        </AccordionContent>
                        </AccordionItem>
                    ))}
                    </Accordion>
                </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
}
