import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL_PRIMARY = "gemini-2.0-flash";
const MODEL_FALLBACK = "gemini-1.5-flash";

// Prefer vite.config `define` + loadEnv (see __CYNDA_GEMINI_KEY__), then import.meta.env
const API_KEY = (
  (typeof __CYNDA_GEMINI_KEY__ !== "undefined" ? __CYNDA_GEMINI_KEY__ : "") ||
  import.meta.env.VITE_GEMINI_API_KEY ||
  import.meta.env.GEMINI_API_KEY ||
  ""
).trim();

let genAI: GoogleGenerativeAI | null = null;

if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
} else {
  console.warn("Gemini API key missing. Set VITE_GEMINI_API_KEY or GEMINI_API_KEY in .env and restart the dev server.");
}

/**
 * Build Gemini chat history + the next user turn. Handles trailing user messages
 * (e.g. failed prior request) without breaking the user/model alternation rule.
 */
export function buildCyndiGeminiPayload(
  priorMessages: { role: string; content: string }[],
  workspaceContext: unknown,
  newUserText: string
): { history: { role: string; parts: { text: string }[] }[]; userContent: string } {
  const tail = priorMessages.map((m) => ({
    role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
    content: m.content,
  }));
  let orphanUser = "";
  if (tail.length > 0 && tail[tail.length - 1].role === "user") {
    orphanUser = tail.pop()!.content;
  }

  const history: { role: string; parts: { text: string }[] }[] = [];
  for (let i = 0; i < tail.length; i += 2) {
    const u = tail[i];
    const a = tail[i + 1];
    if (u?.role === "user" && a?.role === "assistant") {
      history.push({ role: "user", parts: [{ text: u.content }] });
      history.push({ role: "model", parts: [{ text: a.content }] });
    }
  }

  const ws = `[WORKSPACE_CONTEXT]\n${JSON.stringify(workspaceContext, null, 2)}`;
  const instruction = `[INSTRUCTION]
Follow the Cyndi playbook in your system instructions. Reply with **only** a single JSON object (no markdown fences, no text before or after).
Always include "text" (string, user-visible reply; light markdown like **bold** is allowed per playbook).
Include "actions" only when appropriate: array of { "type": string, "payload": object }.
Supported action types:
- CREATE_TASK { title, project?, due?, priority?, description? }
- CREATE_INVOICE { client, amount, date? }
- LOG_EXPENSE { category, amount, date? }
- SET_REMINDER { message, time? }
- ONBOARD_STAFF { name, email, role, department? }
- UPDATE_TASK { id, status }

Shape:
{ "text": "...", "actions": [] }`;

  const queryBlock = `[USER_QUERY]\n${newUserText}`;
  const userContent = [orphanUser && `[PRIOR_USER_TURN]\n${orphanUser}`, ws, instruction, queryBlock]
    .filter(Boolean)
    .join("\n\n");

  return { history, userContent };
}

/**
 * Strips markdown fences, trims whitespace, returns clean text
 */
function parseGeminiResponse(text: string): string {
  return text
    .replace(/```[a-z]*\n?/gi, '') // Remove opening code blocks
    .replace(/```/g, '')           // Remove closing code blocks
    .trim();
}

/** Pull a JSON object from model output (bare JSON or fenced ```json). */
function extractJsonObject(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1);
  return trimmed;
}

/**
 * Single callGemini(prompt, context) function
 * Takes a prompt string and a context object, returns the model's text response
 */
/**
 * Single callGemini(prompt, context) function
 * Takes a prompt string and a context object, returns the model's text response
 */
export async function callGemini(prompt: string, context: any = {}): Promise<string> {
  if (!genAI) {
    console.error("Gemini AI not initialized. Check API Key.");
    return "AI service is currently unavailable. Please check your configuration.";
  }

  try {
    const model = genAI.getGenerativeModel({ model: MODEL_PRIMARY });
    
    // Construct the full prompt with context
    const contextString = JSON.stringify(context, null, 2);
    const fullPrompt = `
      Context:
      ${contextString}
      
      Instructions:
      ${prompt}
      
      Response (Text only, no markdown):
    `;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();
    
    return parseGeminiResponse(text);
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Graceful fallback response. Never surface a raw API error to the user.
    return "I encountered an error while processing that request. Please try again shortly.";
  }
}

/**
 * Dedicated callCyndi function for conversational AI.
 * @param priorMessages  thread before this turn (exclude the message you are sending now)
 * @param newUserText  current user message only
 */
export async function callCyndi(
  priorMessages: { role: string; content: string }[],
  workspaceContext: unknown,
  systemPrompt: string,
  newUserText: string
): Promise<{ text: string; actions?: unknown[]; formatting?: unknown }> {
  if (!genAI) {
    console.error("Gemini AI not initialized. Check VITE_GEMINI_API_KEY or GEMINI_API_KEY in .env and restart Vite.");
    return {
      text: "Cyndi can’t reach the AI service yet. Add **VITE_GEMINI_API_KEY** (or **GEMINI_API_KEY**) to your `.env` file and restart the dev server (`npm run dev`).",
    };
  }

  const { history, userContent } = buildCyndiGeminiPayload(
    priorMessages,
    workspaceContext,
    newUserText
  );

  const run = async (modelName: string) => {
    const model = genAI!.getGenerativeModel({
      model: modelName,
      systemInstruction: systemPrompt,
    });
    const chat = model.startChat({ history });
    return chat.sendMessage(userContent);
  };

  let result;
  try {
    result = await run(MODEL_PRIMARY);
  } catch (primaryErr) {
    console.warn("Cyndi: primary model failed, trying fallback:", primaryErr);
    try {
      result = await run(MODEL_FALLBACK);
    } catch (fallbackErr) {
      console.error("Cyndi Gemini Error:", fallbackErr);
      const hint =
        fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
      return {
        text: `Cyndi couldn’t complete that request. Check your API key and billing in Google AI Studio.\n\n_Technical detail:_ ${hint}`,
      };
    }
  }

  try {
    const response = result.response;
    const rawText = response.text();
    try {
      const cleanedText = extractJsonObject(rawText);
      const parsed = JSON.parse(cleanedText) as {
        text?: string;
        actions?: unknown[];
        formatting?: unknown;
      };
      return {
        text: parsed.text || cleanedText,
        actions: parsed.actions || [],
        formatting: parsed.formatting,
      };
    } catch {
      return { text: rawText };
    }
  } catch (err) {
    console.error("Cyndi: empty or blocked response", err);
    return {
      text: "Cyndi didn’t get a usable reply from the model (empty or blocked). Try rephrasing, or check API quotas.",
    };
  }
}
