
'use server';
/**
 * @fileOverview A flow to parse receipt images and extract transaction data.
 */

import { ai } from '@/ai';
import { z } from 'zod';

const ParseReceiptInputSchema = z.object({
  receiptDataUri: z.string().describe(
    "A photo of a receipt, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
});
export type ParseReceiptInput = z.infer<typeof ParseReceiptInputSchema>;

const ParseReceiptOutputSchema = z.object({
  vendorName: z.string().optional().describe('The name of the vendor or store.'),
  transactionDate: z.string().optional().describe('The date of the transaction in YYYY-MM-DD format.'),
  totalAmount: z.number().optional().describe('The total amount of the transaction.'),
});
export type ParseReceiptOutput = z.infer<typeof ParseReceiptOutputSchema>;

const parseReceiptPrompt = ai.definePrompt({
  name: 'parseReceiptPrompt',
  input: { schema: ParseReceiptInputSchema },
  output: { schema: ParseReceiptOutputSchema },
  prompt: `You are an expert receipt processing agent. Analyze the provided receipt image and extract the following information:
- Vendor Name: The name of the store or business.
- Transaction Date: The date the transaction occurred. Return it in YYYY-MM-DD format.
- Total Amount: The final total amount paid.

Here is the receipt image:
{{media url=receiptDataUri}}

Provide the output in a structured JSON format.`,
});

export const parseReceiptFlow = ai.defineFlow(
  {
    name: 'parseReceiptFlow',
    inputSchema: ParseReceiptInputSchema,
    outputSchema: ParseReceiptOutputSchema,
  },
  async (input) => {
    const { output } = await parseReceiptPrompt(input);
    return output!;
  }
);

export async function parseReceipt(input: ParseReceiptInput): Promise<ParseReceiptOutput> {
  return parseReceiptFlow(input);
}
