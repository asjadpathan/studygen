// SkillAssessment flow
'use server';
/**
 * @fileOverview Assesses user's skill level and identifies knowledge gaps.
 *
 * - assessSkill - A function that handles the skill assessment process.
 * - AssessSkillInput - The input type for the assessSkill function.
 * - AssessSkillOutput - The return type for the assessSkill function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssessSkillInputSchema = z.object({
  topic: z.string().describe('The topic to assess the user on.'),
});
export type AssessSkillInput = z.infer<typeof AssessSkillInputSchema>;

const AssessSkillOutputSchema = z.object({
  skillLevel: z.string().describe('The skill level of the user (e.g., beginner, intermediate, advanced).'),
  knowledgeGaps: z.string().describe('The knowledge gaps of the user in the specified topic.'),
});
export type AssessSkillOutput = z.infer<typeof AssessSkillOutputSchema>;

export async function assessSkill(input: AssessSkillInput): Promise<AssessSkillOutput> {
  return assessSkillFlow(input);
}

const prompt = ai.definePrompt({
  name: 'assessSkillPrompt',
  input: {schema: AssessSkillInputSchema},
  output: {schema: AssessSkillOutputSchema},
  prompt: `You are an AI skill assessment tool. Assess the user's skill level in the following topic and identify knowledge gaps.

Topic: {{{topic}}}

Respond with the skill level and knowledge gaps in the following JSON format:
{
  "skillLevel": "<skill level>",
  "knowledgeGaps": "<knowledge gaps>"
}
`,
});

const assessSkillFlow = ai.defineFlow(
  {
    name: 'assessSkillFlow',
    inputSchema: AssessSkillInputSchema,
    outputSchema: AssessSkillOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
