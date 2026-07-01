import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  // CORS headers for cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, context, messages } = req.body || {};

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required.' });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENAI_API_KEY;

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'AI key configuration missing on server. Please configure GEMINI_API_KEY in Vercel Environment Variables.' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const systemInstruction = 
      "You are an elite Neovim config architect and modal editor wizard. " +
      "Explain the concept or Lua code block provided in a clear, concise, and engaging way. " +
      "Organize the explanation into structured handbook sections. " +
      "Keep the tone sharp and content-focused. Use markdown formats.";

    let contents;
    if (messages && Array.isArray(messages) && messages.length > 0) {
      contents = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));
      contents.push({
        role: 'user',
        parts: [{ text: prompt }]
      });
    } else {
      const fullPrompt = context 
        ? `Context (Chapter/Section): ${context}\n\nConcept/Code to explain:\n${prompt}`
        : prompt;
      contents = [{ role: 'user', parts: [{ text: fullPrompt }] }];
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2,
      }
    });

    // response.text is a property getter in @google/genai
    const text = response.text;
    
    if (!text) {
      return res.status(500).json({ error: 'Gemini returned an empty response.' });
    }

    res.status(200).json({ text });
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: `Failed to generate explanation: ${errorMessage}` });
  }
}
