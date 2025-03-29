// lib/llm.js
import { GroqClient } from '@groq/groq-sdk';

const groqClient = new GroqClient({
  apiKey: process.env.GROQ_API_KEY,
});

export async function analyzeTasks(request) {
  const prompt = `
    You are an AI orchestrator that decides which data processing tasks to run.
    Based on the following request, determine which tasks should be executed and in what order.
    Return a JSON array of task names from this list: ["data-cleaning", "sentiment-analysis", "data-visualization"]
    
    User Request: "${request}"
    
    Response format example:
    {
      "tasks": ["data-cleaning", "sentiment-analysis"],
      "explanation": "The request requires cleaning data first, then analyzing sentiment."
    }
  `;

  try {
    const response = await groqClient.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama3-70b-8192',
    });

    const content = response.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('LLM Error:', error);
    throw new Error('Failed to analyze tasks with LLM');
  }
}