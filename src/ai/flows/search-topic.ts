'use server';
/**
 * @fileOverview Flow for searching a topic and getting an explanation, quiz, and resources.
 *
 * - searchTopic - A function that searches for a topic.
 * - SearchTopicInput - The input type for the searchTopic function.
 * - SearchTopicOutput - The return type for the searchTopic function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SearchTopicInputSchema = z.object({
  topic: z.string().describe('The topic to search for.'),
});
export type SearchTopicInput = z.infer<typeof SearchTopicInputSchema>;

const SearchTopicOutputSchema = z.object({
  explanation: z
    .string()
    .describe('A detailed explanation of the topic in Markdown format.'),
  quizTitle: z.string().describe('A title for a quiz on this topic.'),
  resources: z
    .array(
      z.object({
        title: z.string().describe('The title of the resource.'),
        description: z.string().describe('A short description of the resource.'),
        url: z.string().url().describe('The URL of the resource.'),
      })
    )
    .describe('A list of external resources for further learning.'),
});
export type SearchTopicOutput = z.infer<typeof SearchTopicOutputSchema>;

export async function searchTopic(
  input: SearchTopicInput
): Promise<SearchTopicOutput> {
  return searchTopicFlow(input);
}

const prompt = ai.definePrompt({
  name: 'searchTopicPrompt',
  input: {schema: SearchTopicInputSchema},
  output: {schema: SearchTopicOutputSchema},
  prompt: `You are an expert educator and content curator. The user has searched for a topic.

Topic: {{{topic}}}

Your task is to provide a comprehensive response that includes:
1. A detailed but easy-to-understand explanation of the topic. Format this in Markdown.
2. A catchy and relevant title for a quiz on this topic.
3. A list of 3-5 external resources (like articles, videos, or interactive websites) that would be helpful for further learning. For each resource, provide a title, a brief description, and a valid URL.

Generate the response in the specified JSON format.`,
});

const searchTopicFlow = ai.defineFlow(
  {
    name: 'searchTopicFlow',
    inputSchema: SearchTopicInputSchema,
    outputSchema: SearchTopicOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
