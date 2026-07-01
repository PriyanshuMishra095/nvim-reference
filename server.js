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

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENAI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn('WARNING: GEMINI_API_KEY is not defined in the environment. AI explanations will fail.');
}

// Initialize the Google Gen AI client
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY || 'dummy_key' });

// API Endpoint for Concept or Code Explanations
app.post('/api/explain', async (req, res) => {
  const { prompt, context, messages } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required.' });
  }

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'AI key configuration missing on server. Please configure GEMINI_API_KEY.' });
  }

  try {
    const systemInstruction = 
      "You are an elite Neovim config architect and modal editor wizard. " +
      "Explain the concept or Lua code block provided in a clear, extremely short, and engaging way. " +
      "Provide a highly concise response (maximum 3-4 sentences total). Never write long descriptions. " +
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

    const text = response.text;
    
    if (!text) {
      return res.status(500).json({ error: 'Gemini returned an empty response.' });
    }

    res.json({ text });
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: `Failed to generate explanation: ${errorMessage}` });
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
