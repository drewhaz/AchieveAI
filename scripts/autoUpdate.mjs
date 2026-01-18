import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const HF_TOKEN = process.env.HF_TOKEN;
const FILES_TO_UPDATE = [
  "src/screens/HomeScreen.tsx",
  "src/components/ChatInput.tsx",
  "src/components/ChatOutput.tsx",
  "src/ai/AIMain.ts",
  "src/ai/AISafety.ts",
  "src/ai/AIUtils.ts",
  "src/utils/Constants.ts",
  "src/utils/Helpers.ts"
];

async function updateFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  console.log(`⏳ Updating: ${filePath}`);

  try {
    const response = await fetch("https://router.huggingface.co/api/models/your-model-name", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: `Update this code intelligently:\n\n${content}`,
        parameters: { max_new_tokens: 200 }
      })
    });

    const data = await response.json();

    if (!data || !data.generated_text) {
      console.error(`❌ Error updating ${filePath}: No text returned`);
      return;
    }

    fs.writeFileSync(filePath, data.generated_text, "utf-8");
    console.log(`✅ Updated: ${filePath}`);
  } catch (err) {
    console.error(`❌ Error updating ${filePath}:`, err.message);
  }
}

async function main() {
  for (const file of FILES_TO_UPDATE) {
    await updateFile(file);
  }

  // Git commit & push
  const { execSync } = await import("child_process");
  try {
    execSync("git add .");
    execSync(`git commit -m "Auto-update by AI script"`);
    execSync("git push");
    console.log("✅ Changes committed and pushed to GitHub.");
  } catch (err) {
    console.error("❌ Git error:", err.message);
  }
}

main();

