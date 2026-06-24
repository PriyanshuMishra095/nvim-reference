import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, context } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required.' });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'AI key configuration missing on server.' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const systemInstruction = 
      "You are an elite Neovim config architect and modal editor wizard. " +
      "Explain the concept or Lua code block provided in a clear, concise, and engaging way. " +
      "Organize the explanation into structured handbook sections. " +
      "Keep the tone sharp and content-focused. Use markdown formats.";

    const contents = context 
      ? `Context (Chapter/Section): ${context}\n\nConcept/Code to explain:\n${prompt}`
      : prompt;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2,
      }
    });

    res.status(200).json({ text: response.text });
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ error: 'Failed to generate explanation from Gemini API.' });
  }
}
