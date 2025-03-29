// pages/api/orchestrator.js
import { analyzeTasks } from '../../lib/llm';
import { runContainer, buildContainers } from '../../lib/docker';

// Build containers on server start (in a real app, you might want to do this differently)
let containersBuilt = false;
let buildLogs = [];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const logs = [];
  logs.push('Request received');

  try {
    // Build containers if not already built
    if (!containersBuilt) {
      logs.push('Building containers...');
      buildLogs = await buildContainers();
      logs.push(...buildLogs);
      containersBuilt = true;
    }

    const { request } = req.body;
    logs.push(`Analyzing request: "${request}"`);

    // Analyze the request with the LLM
    const analysis = await analyzeTasks(request);
    logs.push(`LLM determined tasks: ${analysis.tasks.join(', ')}`);
    logs.push(`Explanation: ${analysis.explanation}`);

    // Initialize results object
    let input = { rawRequest: request };
    let finalResult = {};

    // Execute each task in sequence
    for (const taskName of analysis.tasks) {
      logs.push(`Executing task: ${taskName}`);
      
      const result = await runContainer(taskName, input);
      logs.push(...(result.logs || []));
      
      if (!result.success) {
        logs.push(`Task ${taskName} failed: ${result.error}`);
        return res.status(500).json({ 
          error: `Task ${taskName} failed`, 
          logs 
        });
      }

      // Update input for next task
      input = { ...input, ...result.output };
      finalResult[taskName] = result.output;
      
      logs.push(`Task ${taskName} completed successfully`);
    }

    logs.push('All tasks completed successfully');
    return res.status(200).json({ 
      result: finalResult, 
      logs 
    });
  } catch (error) {
    console.error('Orchestrator Error:', error);
    logs.push(`Error: ${error.message}`);
    return res.status(500).json({ 
      error: error.message, 
      logs 
    });
  }
}