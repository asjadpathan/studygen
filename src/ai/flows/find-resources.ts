'use server';
/**
 * @fileOverview Flow for finding resources based on user interests.
 *
 * - findResources - A function that finds learning resources, competitions, and news.
 * - FindResourcesInput - The input type for the findResources function.
 * - FindResourcesOutput - The return type for the findResources function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FindResourcesInputSchema = z.object({
  interests: z.array(z.string()).describe('A list of industries the user is interested in.'),
});
export type FindResourcesInput = z.infer<typeof FindResourcesInputSchema>;

const ResourceSchema = z.object({
    title: z.string().describe('The title of the resource.'),
    description: z.string().describe('A short description of the resource.'),
    url: z.string().url().describe('The URL of the resource.'),
});

const FindResourcesOutputSchema = z.object({
  learningResources: z.array(ResourceSchema).describe('A list of learning resources like articles, videos, or courses.'),
  competitions: z.array(ResourceSchema).describe('A list of relevant competitions, hackathons, or challenges.'),
  news: z.array(ResourceSchema).describe('A list of recent news articles or blog posts related to the interests.'),
});
export type FindResourcesOutput = z.infer<typeof FindResourcesOutputSchema>;

export async function findResources(
  input: FindResourcesInput
): Promise<FindResourcesOutput> {
  return findResourcesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'findResourcesPrompt',
  input: {schema: FindResourcesInputSchema},
  output: {schema: FindResourcesOutputSchema},
  prompt: `You are a helpful assistant that curates resources for students and professionals.
  
  Based on the user's selected interests, find a variety of resources. For each category (learning resources, competitions, news), please find 3-5 items. Ensure all URLs are valid and working.

  User Interests: {{{interests}}}

  Generate the response in the specified JSON format.
  `,
});

const findResourcesFlow = ai.defineFlow(
  {
    name: 'findResourcesFlow',
    inputSchema: FindResourcesInputSchema,
    outputSchema: FindResourcesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
