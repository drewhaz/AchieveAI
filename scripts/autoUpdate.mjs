import fs from "fs";
import fetch from "node-fetch";
import dotenv from "dotenv";
import { execSync } from "child_process";

dotenv.config();

const HF_TOKEN = process.env.HF_API_KEY;
const MODEL_ID = process.env.MODEL_ID;

if (!HF_TOKEN) throw new Error("HF_API_KEY missing in .env");
if (!MODEL_ID) throw new Error("MODEL_ID missing in .env");

const ROUTER_URL = `https://router.huggingface.co/routers/${MODEL_ID}/default`;

async function queryHF(prompt) {
  const res = await fetch(ROUTER_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${HF_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ inputs: prompt })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HF API returned invalid response: ${text}`);
  }
  const data = await res.json();
  return data?.generated_text || data?.[0]?.generated_text || "No response";
}

const files = [
  "src/screens/HomeScreen.tsx",
  "src/components/ChatInput.tsx",
  "src/components/ChatOutput.tsx",
  "src/ai/AIMain.ts",
  "src/ai/AISafety.ts",
  "src/ai/AIUtils.ts",
  "src/utils/Constants.ts",
  "src/utils/Helpers.ts"
];

(async () => {
  for (const file of files) {
    try {
      const currentCode = fs.readFileSync(file, "utf-8");
      const updatedCode = await queryHF(currentCode + "\n// Update this code:");
      fs.writeFileSync(file, `// AUTO-UPDATED: ${new Date().toISOString()}\n${updatedCode}`);
      console.log(`✅ Updated: ${file}`);
    } catch (err) {
      console.error(`❌ Error updating ${file}:`, err.message);
    }
  }

  try {
    execSync("git add .");
    execSync(`git commit -m "Auto-update by AI script"`);
    execSync("git push");
    console.log("✅ Changes committed and pushed to GitHub.");
  } catch (err) {
    console.error("❌ Git failed:", err.message);
  }
})();

