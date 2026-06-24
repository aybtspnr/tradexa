import { useState, useCallback } from 'react';
import { groqChat } from '@/services/groq';

export function useGroq() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ask = useCallback(async (
    question: string,
    systemPrompt?: string,
    options?: { temperature?: number; max_tokens?: number }
  ): Promise<string> => {
    setLoading(true);
    setError(null);
    try {
      const result = await groqChat([
        {
          role: 'system',
          content: systemPrompt || 'Você é um assistente especialista em comércio exterior brasileiro. Responda em português.'
        },
        { role: 'user', content: question }
      ], options);
      setLoading(false);
      return result;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, []);

  const analyze = useCallback(async (data: any, question: string): Promise<string> => {
    setLoading(true);
    setError(null);
    try {
      const result = await groqChat([
        {
          role: 'system',
          content: 'Analista de dados COMEXSTAT. Responda em português com Markdown.'
        },
        {
          role: 'user',
          content: `Dados:\n${JSON.stringify(data, null, 2)}\n\nPergunta: ${question}`
        }
      ]);
      setLoading(false);
      return result;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, []);

  return { ask, analyze, loading, error };
}
