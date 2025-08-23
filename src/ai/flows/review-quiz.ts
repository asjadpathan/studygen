'use server';
/**
 * @fileOverview Flow for generating a review quiz based on multiple completed concepts.
 *
 * - generateReviewQuiz - A function that generates a quiz from a list of topics.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { ReviewQuizInputSchema, ReviewQuizOutputSchema, type ReviewQuizInput, type ReviewQuizOutput } from '@/ai/schemas/review-quiz';


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

  Based on the following list of topics, generate a review quiz with a minimum of 10 multiple-choice questions. Each question should have 4 options.
  
  If the number of topics provided is less than 10, you must generate multiple questions for some of the topics to ensure the quiz has at least 10 questions in total.

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
