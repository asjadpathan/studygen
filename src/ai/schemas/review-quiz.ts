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
