'use server';
/**
 * @fileOverview Flow for generating a detailed explanation for a specific concept.
 *
 * - getConceptExplanation - A function that generates a detailed explanation for a concept.
 * - GetConceptExplanationInput - The input type for the getConceptExplanation function.
 * - GetConceptExplanationOutput - The return type for the getConceptExplanation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetConceptExplanationInputSchema = z.object({
  concept: z.string().describe('The specific concept to explain.'),
  topic: z.string().describe('The broader topic or module the concept belongs to.'),
  expertise: z.string().describe('The user\'s current expertise level, which may include prior assessment results.'),
});
export type GetConceptExplanationInput = z.infer<typeof GetConceptExplanationInputSchema>;

const GetConceptExplanationOutputSchema = z.object({
  explanation: z
    .string()
    .describe('A detailed theoretical explanation of the concept, tailored to the user’s background and goals. Should be in Markdown format.'),
});
export type GetConceptExplanationOutput = z.infer<typeof GetConceptExplanationOutputSchema>;

export async function getConceptExplanation(
  input: GetConceptExplanationInput
): Promise<GetConceptExplanationOutput> {
  return getConceptExplanationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getConceptExplanationPrompt',
  input: {schema: GetConceptExplanationInputSchema},
  output: {schema: GetConceptExplanationOutputSchema},
  prompt: `You are an expert educator. A user wants to learn about a specific concept within a broader topic.

  Your task is to provide a detailed, theoretical explanation tailored to the user's background and goals.
  The explanation should be easy to understand and include definitions, core theory, and practical examples or applications relevant to their learning goals.
  
  Format the entire response in Markdown.

  User's Stated Expertise:
  "{{{expertise}}}"

  Overall Topic/Goal: "{{{topic}}}"

  Concept to Explain: "{{{concept}}}"
  
  Generate the detailed explanation now.
  `,
});

const getConceptExplanationFlow = ai.defineFlow(
  {
    name: 'getConceptExplanationFlow',
    inputSchema: GetConceptExplanationInputSchema,
    outputSchema: GetConceptExplanationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
