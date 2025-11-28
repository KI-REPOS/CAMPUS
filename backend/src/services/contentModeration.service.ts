import { GoogleGenerativeAI } from '@google/generative-ai';
import { ModerationLog } from '../models/mongoModels';
import { getMySQLPool } from '../config/database';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export async function moderateAndPossiblySuspend(
  content: string,
  userId: string,
  userName: string,
  contentType: 'chat' | 'forum_post',
  contentId: string
) {
  const prompt = `
Analyze the following text for use in an academic campus portal (students & faculty):

Text: """${content}"""

Return ONLY JSON:
{
  "isAppropriate": boolean,
  "flags": string[],
  "severity": "low" | "medium" | "high",
  "reason": "short explanation"
}
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(text);

    const isAppropriate = parsed.isAppropriate !== false;
    const flags: string[] = parsed.flags || [];
    const severity: 'low' | 'medium' | 'high' = parsed.severity || 'low';

    let action: 'none' | 'warning' | 'suspension' | 'content_removed' = 'none';
    if (!isAppropriate) {
      if (severity === 'high') action = 'suspension';
      else if (severity === 'medium') action = 'content_removed';
      else action = 'warning';

      await ModerationLog.create({
        userId,
        userName,
        contentType,
        contentId,
        reason: parsed.reason || 'Inappropriate content',
        flaggedContent: content,
        action
      });

      if (action === 'suspension') {
        const pool = getMySQLPool();
        const suspensionEnd = new Date();
        suspensionEnd.setDate(suspensionEnd.getDate() + 7);
        await pool.query(
          `UPDATE users SET is_suspended = TRUE, suspension_reason = ?, suspension_end = ? WHERE id = ?`,
          [parsed.reason || 'Policy violation', suspensionEnd, userId]
        );
      }
    }

    return { isAppropriate, flags, action };
  } catch (err) {
    console.error('Gemini moderation error', err);
    return { isAppropriate: true, flags: [], action: 'none' as const };
  }
}
