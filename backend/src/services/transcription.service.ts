import { SpeechClient } from '@google-cloud/speech';

const speechClient = new SpeechClient({
  projectId: process.env.GOOGLE_PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

export interface CaptionSegment {
  start: number;
  end: number;
  text: string;
}

export async function transcribeAudioBuffer(
  audioBuffer: Buffer
): Promise<{ transcript: string; captions: CaptionSegment[] }> {
  const request = {
    audio: { content: audioBuffer.toString('base64') },
    config: {
      encoding: 'WEBM_OPUS' as const,
      sampleRateHertz: 48000,
      languageCode: 'en-US',
      enableAutomaticPunctuation: true
    }
  };

  const [response] = await speechClient.recognize(request);
  const results = response.results || [];
  const transcriptParts: string[] = [];
  const captions: CaptionSegment[] = [];

  let currentTime = 0;
  for (const r of results) {
    const alt = r.alternatives?.[0];
    if (!alt?.transcript) continue;
    transcriptParts.push(alt.transcript);

    // naive segmentation into ~5-second chunks
    const words = alt.words || [];
    const segmentText = alt.transcript;
    const start = words[0]?.startTime?.seconds ?? currentTime;
    const end = words[words.length - 1]?.endTime?.seconds ?? start + 5;

    captions.push({
      start: Number(start),
      end: Number(end),
      text: segmentText
    });
    currentTime = Number(end);
  }

  const transcript = transcriptParts.join(' ');
  return { transcript, captions };
}
