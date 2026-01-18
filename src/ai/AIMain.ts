// AUTO-UPDATED: 2026-01-18T20:48:23.916Z
// AUTO-UPDATED: 2026-01-18T20:46:46.914Z
// Auto-updated on 2026-01-18T20:42:22.192Z
// [AUTOUPDATE] File updated by automation script
import { generateResponse } from './AIUtils';
import { checkSafety } from './AISafety';

export class AIMain {
  async askQuestion(question: string): Promise<string> {
    if (!checkSafety(question)) {
      return "Sorry, this question is unsafe.";
    }
    const answer = await generateResponse(question);
    return answer;
  }
}

