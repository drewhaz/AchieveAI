export const HF_API_KEY = process.env.HF_API_KEY || "";
export const MODEL_ID = process.env.MODEL_ID || "gpt-4-code";

export const FILES_TO_UPDATE = [
  "src/screens/HomeScreen.tsx",
  "src/components/ChatInput.tsx",
  "src/components/ChatOutput.tsx",
  "src/ai/AIMain.ts",
  "src/ai/AISafety.ts",
  "src/ai/AIUtils.ts",
  "src/utils/Constants.ts",
  "src/utils/Helpers.ts",
];

