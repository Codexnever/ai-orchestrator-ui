// lib/docker.js
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execPromise = promisify(exec);

export async function runContainer(taskName, input) {
  const containerDir = path.join(process.cwd(), 'containers', taskName);
  const inputFile = path.join(containerDir, 'input.json');
  const outputFile = path.join(containerDir, 'output.json');

  // Write input to file for container to access
  fs.writeFileSync(inputFile, JSON.stringify(input));

  // Run the container
  const dockerCommand = `docker run --rm \
    -v ${inputFile}:/app/input.json \
    -v ${outputFile}:/app/output.json \
    ai-orchestrator-${taskName}`;

  try {
    const { stdout, stderr } = await execPromise(dockerCommand);
    console.log(`Container stdout: ${stdout}`);
    
    if (stderr) {
      console.error(`Container stderr: ${stderr}`);
    }

    // Read the output
    if (fs.existsSync(outputFile)) {
      const output = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
      return { success: true, output, logs: stdout.split('\n') };
    } else {
      throw new Error('Container did not produce expected output file');
    }
  } catch (error) {
    console.error(`Error running container: ${error.message}`);
    return { success: false, error: error.message, logs: [error.message] };
  }
}

export async function buildContainers() {
  const containersDir = path.join(process.cwd(), 'containers');
  const containerFolders = fs.readdirSync(containersDir);
  
  const logs = [];
  
  for (const folder of containerFolders) {
    const containerPath = path.join(containersDir, folder);
    if (fs.statSync(containerPath).isDirectory()) {
      logs.push(`Building container for ${folder}...`);
      try {
        const { stdout, stderr } = await execPromise(
          `docker build -t ai-orchestrator-${folder} ${containerPath}`
        );
        logs.push(`Built container for ${folder}: ${stdout}`);
        if (stderr) logs.push(`Warning: ${stderr}`);
      } catch (error) {
        logs.push(`Error building container for ${folder}: ${error.message}`);
      }
    }
  }
  
  return logs;
}