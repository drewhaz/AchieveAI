import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const HF_TOKEN = process.env.HF_TOKEN;
if (!HF_TOKEN) throw new Error("HF_TOKEN missing in .env");

// List of files to update
const filesToUpdate = [
  "src/screens/HomeScreen.tsx",
  "src/components/ChatInput.tsx",
  "src/components/ChatOutput.tsx",
  "src/ai/AIMain.ts",
  "src/ai/AISafety.ts",
  "src/ai/AIUtils.ts",
  "src/utils/Constants.ts",
  "src/utils/Helpers.ts",
];

// Function to generate new code from the AI
async function generateCode(fileContent, filePath) {
  const prompt = `
You are an AI assistant. Update the following file content if needed:
File: ${filePath}
Current content:
${fileContent}

Return only valid code for this file.
`;
  
  const response = await fetch("https://api-inference.huggingface.co/routers/text-generation", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${HF_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "tiiuae/falcon-7b-instruct",
      inputs: prompt,
      max_new_tokens: 200,
      temperature: 0.2
    })
  });

  const data = await response.json();
  if (!data || !data[0]?.generated_text) {
    throw new Error("HF API returned invalid response");
  }
  return data[0].generated_text;
}

// Main update loop
(async () => {
  for (const filePath of filesToUpdate) {
    try {
      const fullPath = path.resolve(filePath);
      const content = fs.readFileSync(fullPath, "utf-8");
      const updatedContent = await generateCode(content, filePath);

      fs.writeFileSync(fullPath, updatedContent);
      console.log(`✅ Updated: ${filePath}`);
    } catch (err) {
      console.log(`❌ Error updating ${filePath}:`, err.message);
    }
  }

  // Auto git commit & push
  const { execSync } = await import("child_process");
  try {
    execSync('git add .', { stdio: "inherit" });
    execSync('git commit -m "Auto-update by AI script"', { stdio: "inherit" });
    execSync('git push', { stdio: "inherit" });
    console.log("✅ Changes committed and pushed to GitHub.");
  } catch (err) {
    console.log("❌ Git error:", err.message);
  }
})();

