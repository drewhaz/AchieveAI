// scripts/autoUpdate.mjs
import fs from 'fs';
import { execSync } from 'child_process';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
const HF_TOKEN = process.env.HF_TOKEN;

// List all files your AI should update
const files = [
  'src/screens/HomeScreen.tsx',
  'src/components/ChatInput.tsx',
  'src/components/ChatOutput.tsx',
  'src/ai/AIMain.ts',
  'src/ai/AISafety.ts',
  'src/ai/AIUtils.ts',
  'src/utils/Constants.ts',
  'src/utils/Helpers.ts'
];

// Read user instructions from a single notes file
const notesFile = 'NOTES.md';
const prompt = fs.existsSync(notesFile)
  ? fs.readFileSync(notesFile, 'utf8')
  : 'No instructions provided.';

async function updateFile(filePath) {
  const absolutePath = path.resolve(filePath);
  if (!fs.existsSync(absolutePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  const code = fs.readFileSync(absolutePath, 'utf8');

  console.log(`⏳ Updating: ${filePath}`);

  // Call Hugging Face API to generate updated code
  const response = await fetch('https://api-inference.huggingface.co/models/gpt-4-code', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${HF_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      inputs: `Update the following code according to these instructions:\n\n${prompt}\n\n${code}`,
      options: { wait_for_model: true }
    })
  });

  const data = await response.json();

  if (data.error) {
    console.error(`❌ Error updating ${filePath}:`, data.error);
    return;
  }

  const newCode = `// AUTO-UPDATED: ${new Date().toISOString()}\n${data.generated_text}`;

  fs.writeFileSync(absolutePath, newCode, 'utf8');
  console.log(`✅ Updated: ${filePath}`);
}

// Run updates for all files
async function main() {
  for (const file of files) {
    await updateFile(file);
  }

  console.log('All updates complete!');

  // Auto Git commit & push
  try {
    execSync('git add .', { stdio: 'inherit' });
    execSync('git commit -m "Auto-update by AI script"', { stdio: 'inherit' });
    execSync('git push', { stdio: 'inherit' });
    console.log('✅ Changes committed and pushed to GitHub.');
  } catch (err) {
    console.error('⚠️ Git commit/push failed:', err.message);
  }
}

main();

