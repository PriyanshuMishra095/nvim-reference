import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn('WARNING: GEMINI_API_KEY is not defined in the environment. AI explanations will fail.');
}

// Initialize the Google Gen AI client
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// API Endpoint for Concept or Code Explanations
app.post('/api/explain', async (req, res) => {
  const { prompt, context, messages } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required.' });
  }

  try {
    const systemInstruction = 
      "You are an elite Neovim config architect and modal editor wizard. " +
      "Explain the concept or Lua code block provided in a clear, concise, and engaging way. " +
      "Organize the explanation into structured monospaced handbook sections. " +
      "Keep the tone sharp and content-focused. Use markdown formats.";

    let contents;
    if (messages && Array.isArray(messages)) {
      contents = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));
      contents.push({
        role: 'user',
        parts: [{ text: prompt }]
      });
    } else {
      contents = context 
        ? `Context (Chapter/Section): ${context}\n\nConcept/Code to explain:\n${prompt}`
        : prompt;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2,
      }
    });

    res.json({ text: response.text });
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ error: 'Failed to generate explanation from Gemini API.' });
  }
});

// Serve static assets in production
app.use(express.static(path.join(__dirname, 'dist')));

// SPA Fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
