'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadCloud, File, X, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prevFiles => [...prevFiles, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const removeFile = (fileName: string) => {
    setFiles(files.filter(file => file.name !== fileName));
  };
  
  const handleProcess = () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please upload a file to process.",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      setFiles([]);
      toast({
        title: "Processing Complete",
        description: `Your materials have been converted into flashcards and quizzes.`,
      });
    }, 2000);
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
          <CardDescription>Drag and drop your files here or click to browse. Supported formats: PDF, DOCX, TXT.</CardDescription>
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
              {isDragActive ? 'Drop the files here...' : "Drag 'n' drop some files here, or click to select files"}
            </p>
            <p className="text-sm text-muted-foreground">Max file size: 10MB</p>
          </div>

          {files.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Selected Files:</h3>
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
                'Process Materials'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
