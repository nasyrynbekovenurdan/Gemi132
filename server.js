const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Define the 3 Types of AI Thinking (System Prompts)
const personas = {
    study: "You are a study helper. Explain hard concepts using simple, easy-to-understand words. Summarize information into clear, bulleted notes.",
    friend_boy: "You are a supportive, empathetic male friend. Act as an informal psychologist. Help the user find a way out of difficult emotional situations with practical, friendly, and comforting advice. Speak like a caring bro.",
    friend_girl: "You are a supportive, empathetic female friend. Act as an informal psychologist. Help the user navigate difficult emotional situations with warmth, emotional intelligence, and comforting advice. Speak like a caring bestie.",
    genius: "You are a hyper-logical, brilliant analytical AI. You think deeply, analyze all variables, and provide highly structured, logically sound, and complex answers. You prioritize pure logic over emotion."
};

app.post('/api/chat', async (req, res) => {
    const { message, personaId, chatHistory } = req.body;
    
    // Get the correct system prompt
    const systemPrompt = personas[personaId] || personas['study'];

    // Format messages for Ollama (or any standard LLM API)
    // We add the system prompt as the first message
    const messages = [
        { role: 'system', content: systemPrompt },
        ...chatHistory,
        { role: 'user', content: message }
    ];

    try {
        console.log(`[+] Sending request to local Ollama (Persona: ${personaId})...`);
        // Calling your local, FREE, unlimited AI (Ollama)
        const response = await axios.post('http://localhost:11434/api/chat', {
            model: 'llama3.2', // Changed to llama3.2 which runs much faster on Codespaces and laptops!
            messages: messages,
            stream: false
        });

        res.json({ reply: response.data.message.content });
    } catch (error) {
        console.error("[-] AI Error:", error.message);
        res.status(500).json({ error: "Failed to connect to local AI. Is Ollama running?" });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`=======================================`);
    console.log(`🚀 Backend running on http://localhost:${PORT}`);
    console.log(`🤖 Waiting for Ollama connections...`);
    console.log(`=======================================`);
});