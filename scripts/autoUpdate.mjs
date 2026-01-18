import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import 'dotenv/config';

const HF_TOKEN = process.env.HF_TOKEN;
const MODEL_ID = process.env.MODEL_ID;

if (!HF_TOKEN) throw new Error("HF_TOKEN missing in .env");
if (!MODEL_ID) throw new Error("MODEL_ID missing in .env");

// List of files to auto-update
const filesToUpdate = [
  'src/screens/HomeScreen.tsx',
  'src/components/ChatInput.tsx',
  'src/components/ChatOutput.tsx',
  'src/ai/AIMain.ts',
  'src/ai/AISafety.ts',
  'src/ai/AIUtils.ts',
  'src/utils/Constants.ts',
  'src/utils/Helpers.ts'
];

async function updateFile(filePath) {
  const absolutePath = path.resolve(filePath);
  let content = fs.readFileSync(absolutePath, 'utf-8');

  try {
    const response = await fetch(`https://api-inference.huggingface.co/models/${MODEL_ID}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: `Update this code intelligently: ${content}`
      })
    });

    const result = await response.json();

    if (!result || !result[0] || !result[0].generated_text) {
      console.log(`❌ Error updating ${filePath}:`, JSON.stringify(result));
      return;
    }

    const updated = result[0].generated_text;
    fs.writeFileSync(absolutePath, `// AUTO-UPDATED: ${new Date().toISOString()}\n${updated}`);
    console.log(`✅ Updated: ${filePath}`);
  } catch (err) {
    console.log(`❌ Error updating ${filePath}:`, err.message);
  }
}

(async () => {
  for (const file of filesToUpdate) {
    await updateFile(file);
  }

  // Auto git commit + push
  const { execSync } = await import('child_process');
  try {
    execSync('git add .', { stdio: 'inherit' });
    execSync('git commit -m "Auto-update by AI script"', { stdio: 'inherit' });
    execSync('git push', { stdio: 'inherit' });
    console.log('✅ Changes committed and pushed to GitHub.');
  } catch (err) {
    console.log('⚠️ Git push failed:', err.message);
  }
})();

