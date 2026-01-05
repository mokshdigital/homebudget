import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
    try {
        // Check multiple common variable names
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;

        // DEBUG: Check what keys are loaded (omitting values for security)
        const relevantKeys = Object.keys(process.env).filter(k => k.includes('GOOGLE') || k.includes('GEMINI'));
        console.log("[Scan API] Loaded Env Keys:", relevantKeys);

        if (!apiKey) {
            console.error("API Error: Missing GOOGLE_GENERATIVE_AI_API_KEY (or GOOGLE_API_KEY / GEMINI_API_KEY)");
            return NextResponse.json({ error: "Server Configuration Error: Missing API Key", availableKeys: relevantKeys }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        // User requested specific model
        const modelName = "gemini-3-flash-preview";

        console.log(`[Scan API] Initializing model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });

        const body = await req.json();
        const { imageUrl, base64 } = body;

        if (!imageUrl && !base64) {
            return NextResponse.json({ error: "No image provided" }, { status: 400 });
        }

        let imagePart;

        if (base64) {
            // Handle Base64
            // Expected: "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
            // Or just raw base64
            let data = base64;
            let mimeType = "image/jpeg";

            if (base64.includes(",")) {
                const parts = base64.split(",");
                data = parts[1];
                const mimeMatch = parts[0].match(/:(.*?);/);
                if (mimeMatch) {
                    mimeType = mimeMatch[1];
                }
            }

            imagePart = {
                inlineData: {
                    data,
                    mimeType
                }
            };
            console.log(`[Scan API] Processing base64 image (Mime: ${mimeType}, Length: ${data.length})`);

        } else {
            // Handle URL
            console.log(`[Scan API] Fetching image from URL: ${imageUrl}`);
            const response = await fetch(imageUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const data = buffer.toString("base64");
            const mimeType = response.headers.get("content-type") || "image/jpeg";

            imagePart = {
                inlineData: {
                    data,
                    mimeType
                }
            };
            console.log(`[Scan API] Fetched image (Mime: ${mimeType}, Length: ${data.length})`);
        }

        const prompt = `
      Analyze this receipt image. 
      Extract the following information in strict JSON format:
      {
        "vendor": "Store Name",
        "date": "YYYY-MM-DD",
        "amount": 0.00,
        "description": "Short description of items purchased (e.g. 'Groceries', 'Coffee', 'Office Supplies')",
        "category_guess": "Food | Transport | Utilities | Shopping | Health | Entertainment | Housing"
      }
      Rules:
      1. If the date is missing or unreadable, use today's date: ${new Date().toISOString().split('T')[0]}.
      2. If the total amount is unclear, make your best guess or use 0.00.
      3. If the image is NOT a receipt, return { "error": "Image does not appear to be a receipt" }.
      4. RETURN ONLY RAW JSON. NO MARKDOWN. NO \`\`\`json WRAPPERS.
    `;

        console.log("[Scan API] Sending request to Gemini...");
        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();
        console.log("[Scan API] Received response:", text.substring(0, 100) + "..."); // Log first 100 chars

        // Clean markdown just in case user prompt instructions are ignored
        const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();

        try {
            const data = JSON.parse(cleanText);
            return NextResponse.json(data);
        } catch (e) {
            console.error("[Scan API] JSON Parse Error. Raw Text:", text);
            return NextResponse.json({ error: "Failed to parse AI response", raw: text }, { status: 500 });
        }

    } catch (error: any) {
        console.error("[Scan API] Critical Error:", error);
        return NextResponse.json({
            error: error.message || "Internal Server Error",
            details: error.toString()
        }, { status: 500 });
    }
}
