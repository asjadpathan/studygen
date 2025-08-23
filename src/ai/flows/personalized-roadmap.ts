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
  learningStyle: z
    .array(z.string())
    .optional()
    .describe('The user\'s preferred learning style(s), e.g., "Visual", "Auditory", "Kinesthetic".'),
  preferredResourceTypes: z
    .array(z.string())
    .optional()
    .describe('The user\'s preferred types of learning resources, e.g., "Videos", "Articles", "Interactive Labs".'),
  specificTopics: z
    .string()
    .optional()
    .describe('Any specific topics the user wants to ensure are included or excluded from the roadmap.'),
});
export type PersonalizedRoadmapInput = z.infer<typeof PersonalizedRoadmapInputSchema>;

const PersonalizedRoadmapOutputSchema = z.object({
  roadmap: z
    .array(
      z.object({
        title: z.string().describe('The title of the module.'),
        concepts: z.array(z.string()).describe('A list of key concepts, skills, or units that make up this module.'),
      })
    )
    .describe('A personalized learning roadmap tailored to the user goals, expertise, and available study time. It should be broken down into a series of modules, each containing sub-concepts.'),
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
  Consider the user's preferred learning style and resource types when structuring the plan.
  The roadmap should be highly detailed, broken down into weekly modules. Each module must contain a list of specific, granular concepts to learn.

  Goals: {{{goals}}}
  Expertise: {{{expertise}}}
  Available Study Time: {{{availableStudyTime}}}
  Learning Style: {{#if learningStyle}}{{#each learningStyle}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}Not specified{{/if}}
  Preferred Resource Types: {{#if preferredResourceTypes}}{{#each preferredResourceTypes}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}Not specified{{/if}}
  Specific Topics to Include/Exclude: {{{specificTopics}}}

  Generate the roadmap as a JSON object containing a 'roadmap' array. Each element in the array should be a module with a 'title' and a 'concepts' array of strings.
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
