import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
  // For local development, you can use the Genkit Developer UI to inspect your flows.
  // To do so, uncomment the following line and run `npm run genkit:watch`
  // devUi: {
  //   port: 4001
  // }
});
