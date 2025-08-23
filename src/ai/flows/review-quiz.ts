'use server';
/**
 * @fileOverview Flow for generating a review quiz based on multiple completed concepts.
 *
 * - generateReviewQuiz - A function that generates a quiz from a list of topics.
 * - ReviewQuizInput - The input type for the generateReviewQuiz function.
 * - ReviewQuizOutput - The return type for the generateReviewQuiz function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const ReviewQuizInputSchema = z.object({
  topics: z.array(z.string()).describe('A list of topics or concepts to generate quiz questions for.'),
});
export type ReviewQuizInput = z.infer<typeof ReviewQuizInputSchema>;

export const ReviewQuizOutputSchema = z.object({
  quiz: z
    .array(
      z.object({
        question: z.string().describe('The quiz question.'),
        options: z.array(z.string()).describe('The multiple-choice options (should be 4).'),
        correctAnswer: z.string().describe('The correct answer.'),
      })
    )
    .describe('A list of quiz questions based on the provided topics.'),
});
export type ReviewQuizOutput = z.infer<typeof ReviewQuizOutputSchema>;


export async function generateReviewQuiz(
  input: ReviewQuizInput
): Promise<ReviewQuizOutput> {
  return generateReviewQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'reviewQuizPrompt',
  input: {schema: ReviewQuizInputSchema},
  output: {schema: ReviewQuizOutputSchema},
  prompt: `You are an AI assistant that generates quizzes to help users review concepts they have learned.

  Based on the following list of topics, generate one multiple-choice question for each topic. Each question should have 4 options.

  Topics:
  {{#each topics}}
  - {{{this}}}
  {{/each}}

  Generate the response in the specified JSON format.
  `,
});

const generateReviewQuizFlow = ai.defineFlow(
  {
    name: 'generateReviewQuizFlow',
    inputSchema: ReviewQuizInputSchema,
    outputSchema: ReviewQuizOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
