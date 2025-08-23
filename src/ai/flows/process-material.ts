'use server';
/**
 * @fileOverview Flow for processing uploaded study materials.
 *
 * - processMaterial - A function that processes a file to generate a summary and quiz.
 * - ProcessMaterialInput - The input type for the processMaterial function.
 * - ProcessMaterialOutput - The return type for the processMaterial function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProcessMaterialInputSchema = z.object({
  fileDataUri: z
    .string()
    .describe(
      "The uploaded study material as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ProcessMaterialInput = z.infer<typeof ProcessMaterialInputSchema>;

const ProcessMaterialOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the provided material.'),
  quiz: z.array(
    z.object({
      question: z.string().describe('The quiz question.'),
      options: z.array(z.string()).describe('The multiple-choice options.'),
      correctAnswer: z.string().describe('The correct answer.'),
    })
  ).describe('A multiple-choice quiz based on the material.'),
});
export type ProcessMaterialOutput = z.infer<typeof ProcessMaterialOutputSchema>;

export async function processMaterial(
  input: ProcessMaterialInput
): Promise<ProcessMaterialOutput> {
  return processMaterialFlow(input);
}

const prompt = ai.definePrompt({
  name: 'processMaterialPrompt',
  input: {schema: ProcessMaterialInputSchema},
  output: {schema: ProcessMaterialOutputSchema},
  prompt: `You are an AI assistant that processes study materials.
  
  A user has uploaded a document. Your tasks are:
  1. Extract the text content from the document.
  2. Generate a concise summary of the content.
  3. Create a multiple-choice quiz with 5-10 questions based on the key concepts in the material. For each question, provide 4 options and indicate the correct answer.

  File: {{media url=fileDataUri}}

  Generate the response in the specified JSON format.
  `,
});

const processMaterialFlow = ai.defineFlow(
  {
    name: 'processMaterialFlow',
    inputSchema: ProcessMaterialInputSchema,
    outputSchema: ProcessMaterialOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
