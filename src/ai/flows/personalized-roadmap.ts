// This file is machine-generated - edit at your own risk.

'use server';

/**
 * @fileOverview Generates a personalized learning roadmap based on user goals, expertise, and available study time.
 *
 * - generatePersonalizedRoadmap - A function that generates a personalized learning roadmap.
 * - PersonalizedRoadmapInput - The input type for the generatePersonalizedRoadmap function.
 * - PersonalizedRoadmapOutput - The return type for the generatePersonalizedRoadmap function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedRoadmapInputSchema = z.object({
  goals: z
    .string()
    .describe('The user specified goals for learning, e.g. "Pass the AP Calculus Exam".'),
  expertise: z
    .string()
    .describe('The users current expertise level, e.g. "Some experience with Calculus already". This may also contain results from a pre-assessment quiz.'),
  availableStudyTime: z
    .string()
    .describe('The amount of time the user has available to study, e.g. "1 hour per day for 3 months".'),
});
export type PersonalizedRoadmapInput = z.infer<typeof PersonalizedRoadmapInputSchema>;

const PersonalizedRoadmapOutputSchema = z.object({
  roadmap: z
    .string()
    .describe('A personalized learning roadmap tailored to the user goals, expertise, and available study time. It should be interactive and detailed, broken down into sections.'),
});
export type PersonalizedRoadmapOutput = z.infer<typeof PersonalizedRoadmapOutputSchema>;

export async function generatePersonalizedRoadmap(
  input: PersonalizedRoadmapInput
): Promise<PersonalizedRoadmapOutput> {
  return personalizedRoadmapFlow(input);
}

const personalizedRoadmapPrompt = ai.definePrompt({
  name: 'personalizedRoadmapPrompt',
  input: {schema: PersonalizedRoadmapInputSchema},
  output: {schema: PersonalizedRoadmapOutputSchema},
  prompt: `You are an expert learning roadmap generator.

  Based on the user's goals, expertise, and available study time, generate a personalized learning roadmap.
  If the user's expertise contains results from a skill assessment, use that to identify knowledge gaps and tailor the roadmap to address them specifically.
  The roadmap should be highly detailed, broken down into weekly modules, and include suggestions for projects, quizzes, and resources. Make it engaging and encouraging.

  Goals: {{{goals}}}
  Expertise: {{{expertise}}}
  Available Study Time: {{{availableStudyTime}}}

  Generate the roadmap in Markdown format.
  `,
});

const personalizedRoadmapFlow = ai.defineFlow(
  {
    name: 'personalizedRoadmapFlow',
    inputSchema: PersonalizedRoadmapInputSchema,
    outputSchema: PersonalizedRoadmapOutputSchema,
  },
  async input => {
    const {output} = await personalizedRoadmapPrompt(input);
    return output!;
  }
);
