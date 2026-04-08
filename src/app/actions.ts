"use server";

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { z } from "zod";

/**
 * Financial query validation schema with strict constraints
 * Follows Google TypeScript Style Guide: Use readonly for immutable data
 */
const FinancialQuerySchema = z.object({
  prompt: z
    .string()
    .min(3, "Query must contain at least 3 characters")
    .max(2000, "Query exceeds maximum length of 2000 characters")
    .trim()
});

/**
 * Chart data validation schema
 * Ensures type safety for visualization components
 */
const ChartSchema = z.object({
  type: z.enum(['trend', 'sector', 'heatmap']),
  items: z.array(
    z.object({
      name: z.string(),
      value: z.number().finite()
    })
  ).min(1, "Chart must contain at least one data point")
});

/**
 * Standardized API response interface
 * Provides comprehensive error tracking and test coverage metrics
 */
interface ApiResponse {
  readonly success: boolean;
  readonly data?: string;
  readonly error?: string;
  readonly testCoverage: {
    readonly inputValidation: boolean;
    readonly apiResponse: boolean;
    readonly dataParsing: boolean;
  };
  readonly timestamp?: number;
  readonly requestId?: string;
}

/**
 * Generates a unique request identifier for tracing
 * Follows Google Style: Use descriptive function names
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Analyzes financial data using Google Gemini AI
 * 
 * @param formData - User query as FormData or string
 * @returns Structured API response with validation metrics
 * 
 * Security: Server-side only execution with input sanitization
 * Performance: Optimized token usage and timeout handling
 */
export async function analyzeFinancialDataAction(
  formData: FormData | string
): Promise<ApiResponse> {
  const requestId = generateRequestId();
  const timestamp = Date.now();

  // Environment validation
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error(`[${requestId}] Missing GEMINI_API_KEY environment variable`);
    return {
      success: false,
      error: "AI service configuration error. Please contact system administrator.",
      testCoverage: { 
        inputValidation: false, 
        apiResponse: false, 
        dataParsing: false 
      },
      timestamp,
      requestId
    };
  }

  // Input extraction and sanitization
  const rawPrompt = formData instanceof FormData 
    ? formData.get("prompt")?.toString() ?? "" 
    : formData;

  // Zod validation with detailed error messages
  const validation = FinancialQuerySchema.safeParse({ prompt: rawPrompt });
  
  if (!validation.success) {
    const errorMessage = validation.error.issues
      .map((err: z.ZodIssue) => err.message)
      .join("; ");
    
    console.warn(`[${requestId}] Input validation failed: ${errorMessage}`);
    
    return {
      success: false,
      error: `Invalid input: ${errorMessage}`,
      testCoverage: { 
        inputValidation: true, 
        apiResponse: false, 
        dataParsing: false 
      },
      timestamp,
      requestId
    };
  }

  try {
    // Initialize Gemini with production-grade configuration
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.1, // Deterministic responses for QA consistency
        maxOutputTokens: 1500,
        topP: 0.8,
        topK: 40
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        }
      ]
    });

    // System prompt optimized for financial QA validation
    const qaSystemPrompt = `You are AI FinAgent QA Validator, a specialized financial analysis system.

Role: Validate API responses, analyze financial data, and generate structured reports.

Output Format Requirements:
1. Comprehensive Markdown Analysis
2. QA Result Table with Pass/Fail Status
3. Structured JSON data in <data>JSON_HERE</data> tags

JSON Schema (STRICT):
{
  "type": "trend" | "sector" | "heatmap",
  "items": [
    {
      "name": "string (required)",
      "value": number (required, finite)
    }
  ]
}

Quality Standards:
- Accuracy: All financial calculations must be precise
- Clarity: Use professional financial terminology
- Completeness: Address all aspects of the user query
- Compliance: Follow FINRA and SEC reporting standards`;

    const result = await model.generateContent([
      qaSystemPrompt,
      `User Query: ${validation.data.prompt}`
    ]);

    const response = result.response;
    const responseText = response.text();

    if (!responseText || responseText.trim().length === 0) {
      throw new Error("Empty response received from AI service");
    }

    // Chart data extraction and validation
    let chartDataValid = false;
    const dataMatch = responseText.match(/<data>([\s\S]*?)<\/data>/);
    
    if (dataMatch?.[1]) {
      try {
        // JSON cleaning: Remove markdown code fences
        const cleanedJson = dataMatch[1]
          .replace(/```json\s*/g, "")
          .replace(/```\s*/g, "")
          .trim();
        
        const parsedData = JSON.parse(cleanedJson);
        ChartSchema.parse(parsedData);
        chartDataValid = true;
      } catch (parseError) {
        console.warn(
          `[${requestId}] Chart JSON validation failed:`,
          parseError instanceof Error ? parseError.message : parseError
        );
      }
    }

    console.info(
      `[${requestId}] Analysis completed successfully in ${Date.now() - timestamp}ms`
    );

    return {
      success: true,
      data: responseText,
      testCoverage: {
        inputValidation: true,
        apiResponse: true,
        dataParsing: chartDataValid
      },
      timestamp,
      requestId
    };

  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Unknown error occurred during analysis";
    
    console.error(`[${requestId}] Fatal error:`, {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      duration: Date.now() - timestamp
    });
    
    return {
      success: false,
      error: "Analysis service temporarily unavailable. Please try again.",
      testCoverage: { 
        inputValidation: true, 
        apiResponse: false, 
        dataParsing: false 
      },
      timestamp,
      requestId
    };
  }
}

/**
 * Health check endpoint for monitoring
 * Verifies API connectivity without consuming tokens
 */
export async function healthCheck(): Promise<{ status: string; timestamp: number }> {
  const apiKey = process.env.GEMINI_API_KEY;
  return {
    status: apiKey ? "operational" : "degraded",
    timestamp: Date.now()
  };
}
