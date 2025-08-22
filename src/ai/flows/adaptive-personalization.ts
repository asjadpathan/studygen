'use server';

/**
 * @fileOverview An AI agent that personalizes the learning experience based on user performance.
 *
 * - adaptLearning - A function that handles the adaptive learning process.
 * - AdaptLearningInput - The input type for the adaptLearning function.
 * - AdaptLearningOutput - The return type for the adaptLearning function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdaptLearningInputSchema = z.object({
  currentContent: z
    .string()
    .describe('The content currently being presented to the user.'),
  userPerformance: z
    .string()
    .describe(
      'A summary of the user performance on the current content, including areas of strength and weakness.'
    ),
  learningGoals: z
    .string()
    .describe('The overall learning goals of the user.'),
});
export type AdaptLearningInput = z.infer<typeof AdaptLearningInputSchema>;

const AdaptLearningOutputSchema = z.object({
  adaptedContent: z
    .string()
    .describe('The adapted content to be presented to the user.'),
  pacingRecommendation: z
    .string()
    .describe('A recommendation for the pacing of the learning experience.'),
  remedialActions: z
    .string()
    .describe(
      'Specific remedial actions to address areas where the user is struggling.'
    ),
});
export type AdaptLearningOutput = z.infer<typeof AdaptLearningOutputSchema>;

export async function adaptLearning(input: AdaptLearningInput): Promise<AdaptLearningOutput> {
  return adaptLearningFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adaptLearningPrompt',
  input: {schema: AdaptLearningInputSchema},
  output: {schema: AdaptLearningOutputSchema},
  prompt: `You are an AI learning assistant that personalizes the learning experience for the user based on their performance.

You will take into account the user's current performance, their overall learning goals, and the content currently being presented to them.

Based on this information, you will adapt the content, recommend a pacing, and suggest remedial actions.

Current Content: {{{currentContent}}}
User Performance: {{{userPerformance}}}
Learning Goals: {{{learningGoals}}}

Adapt the content, recommend a pacing, and suggest remedial actions to help the user learn at their own pace and focus on areas where they need the most help.

Adapted Content:
Pacing Recommendation:
Remedial Actions:`,
});

const adaptLearningFlow = ai.defineFlow(
  {
    name: 'adaptLearningFlow',
    inputSchema: AdaptLearningInputSchema,
    outputSchema: AdaptLearningOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
