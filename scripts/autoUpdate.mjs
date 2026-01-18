import fs from "fs";
import fetch from "node-fetch";
import { HF_API_KEY, MODEL_ID, FILES_TO_UPDATE } from "../src/utils/Constants.js";
import 'dotenv/config';

async function updateFile(filePath) {
  const code = fs.readFileSync(filePath, "utf-8");

  const prompt = `
Update this TypeScript/React code safely.
- Keep all existing imports intact.
- Fill any TODOs with functioning placeholders.
- Improve efficiency where possible.
- Maintain TypeScript type safety.

Current code:
${code}
`;

  const res = await fetch(`https://api-inference.huggingface.co/models/${MODEL_ID}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HF_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: prompt }),
  });

  const data = await res.json();

  if (data && data[0]?.generated_text) {
    fs.writeFileSync(filePath, data[0].generated_text, "utf-8");
    console.log(`✅ Updated: ${filePath}`);
  } else {
    console.log(`⚠️ Failed to update: ${filePath}`);
  }
}

(async () => {
  for (const file of FILES_TO_UPDATE) {
    await updateFile(file);
  }
  console.log("All updates complete!");
})();

