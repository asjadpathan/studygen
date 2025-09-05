'use server';
/**
 * @fileOverview Flow for generating quizzes and providing simplified explanations for incorrect answers.
 *
 * - generateQuizAndExplanation - A function that generates a quiz and explanations.
 * - QuizAndExplanationInput - The input type for the generateQuizAndExplanation function.
 * - QuizAndExplanationOutput - The return type for the generateQuizAndExplanation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const QuizAndExplanationInputSchema = z.object({
  topic: z.string().describe('The topic for which to generate a quiz.'),
  userAnswer: z.string().optional().describe("The user's answer to the quiz question, if available."),
  correctAnswer: z.string().optional().describe('The correct answer to the quiz question, if available.'),
  context: z.string().optional().describe('Additional context for the question generation, e.g. "Question 1 of 3" or "Ask a different kind of question".'),
});
export type QuizAndExplanationInput = z.infer<typeof QuizAndExplanationInputSchema>;

const QuizAndExplanationOutputSchema = z.object({
  question: z.string().describe('The generated quiz question.'),
  options: z.array(z.string()).describe('The possible answers for the quiz question.'),
  correctAnswer: z.string().describe('The correct answer to the quiz question.'),
  explanation: z.string().describe('A simplified explanation of the correct answer.'),
});
export type QuizAndExplanationOutput = z.infer<typeof QuizAndExplanationOutputSchema>;

export async function generateQuizAndExplanation(
  input: QuizAndExplanationInput
): Promise<QuizAndExplanationOutput> {
  return generateQuizAndExplanationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'quizAndExplanationPrompt',
  input: {schema: QuizAndExplanationInputSchema},
  output: {schema: QuizAndExplanationOutputSchema},
  prompt: `You are an AI-powered quiz generator and explainer.
  {{#if context}}
  Context for this question: {{{context}}}
  {{/if}}
  Generate a quiz question on the topic: {{{topic}}}.
  Provide 4 possible options, one of which is the correct answer.
  If the user provided an answer ({{{userAnswer}}}) that was incorrect, and the correct answer is ({{{correctAnswer}}}), provide a simplified explanation of why the correct answer is correct and why the user's answer was incorrect.
  Otherwise, just generate a new quiz question and options.

  Make sure the quiz question and explanation are clear and concise.
  `,
});

const generateQuizAndExplanationFlow = ai.defineFlow(
  {
    name: 'generateQuizAndExplanationFlow',
    inputSchema: QuizAndExplanationInputSchema,
    outputSchema: QuizAndExplanationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
