import { Pool } from 'pg'

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY
const DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1'

// DB pool for logging
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatOptions {
  temperature?: number
  maxTokens?: number
  model?: string
}

export interface ChatResult {
  content: string
  tokensIn: number
  tokensOut: number
}

/**
 * Логирование AI-вызова в БД (ai_inference_logs)
 */
async function logInference(params: {
  prompt: string
  response?: string
  tokensIn?: number
  tokensOut?: number
  latencyMs: number
  success: boolean
  provider?: string
  model?: string
  error?: string
  fallback?: boolean
  ip?: string
  userAgent?: string
  userId?: number
}) {
  try {
    await pool.query(
      `INSERT INTO public.ai_inference_logs 
       (user_id, provider, model, prompt, response, tokens_input, tokens_output, tokens_total, latency_ms, success, error_message, ip, user_agent, fallback_used)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        params.userId || null,
        params.provider || 'deepseek',
        params.model || 'deepseek-chat',
        params.prompt.slice(0, 5000),
        params.response?.slice(0, 5000) || null,
        params.tokensIn || 0,
        params.tokensOut || 0,
        (params.tokensIn || 0) + (params.tokensOut || 0),
        params.latencyMs,
        params.success,
        params.error || null,
        params.ip || null,
        params.userAgent ? params.userAgent.slice(0, 500) : null,
        params.fallback || false,
      ]
    )
  } catch (err) {
    console.error('[ai-deepseek] Failed to log inference:', err)
  }
}

/**
 * Chat with DeepSeek API
 */
export async function chatWithAI(
  messages: ChatMessage[],
  options: ChatOptions = {}
): Promise<ChatResult> {
  const startTime = Date.now()
  const model = options.model || 'deepseek-chat'
  const userPrompt = messages.find(m => m.role === 'user')?.content || ''
  
  if (!DEEPSEEK_API_KEY) {
    await logInference({
      prompt: userPrompt,
      latencyMs: Date.now() - startTime,
      success: false,
      error: 'DEEPSEEK_API_KEY not configured',
      fallback: true,
    })
    throw new Error('DEEPSEEK_API_KEY not configured')
  }

  try {
    const res = await fetch(`${DEEPSEEK_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options.temperature ?? 0.6,
        max_tokens: options.maxTokens ?? 512,
      }),
    })

    if (!res.ok) {
      const errorText = await res.text()
      await logInference({
        prompt: userPrompt,
        latencyMs: Date.now() - startTime,
        success: false,
        error: `DeepSeek API ${res.status}: ${errorText.slice(0, 200)}`,
        model,
      })
      throw new Error(`DeepSeek API error: ${res.status}`)
    }

    const data = await res.json()
    const content = data.choices?.[0]?.message?.content || ''
    const tokensIn = data.usage?.prompt_tokens || 0
    const tokensOut = data.usage?.completion_tokens || 0
    const latencyMs = Date.now() - startTime

    // Log successful inference
    await logInference({
      prompt: userPrompt,
      response: content,
      tokensIn,
      tokensOut,
      latencyMs,
      success: true,
      model,
    })

    return {
      content,
      tokensIn,
      tokensOut,
    }
  } catch (error: any) {
    const latencyMs = Date.now() - startTime
    await logInference({
      prompt: userPrompt,
      latencyMs,
      success: false,
      error: error.message,
      model,
      fallback: true,
    })
    throw error
  }
}

/**
 * Проверка доступности DeepSeek API
 */
export async function checkDeepSeekHealth(): Promise<boolean> {
  try {
    if (!DEEPSEEK_API_KEY) return false
    const res = await fetch(`${DEEPSEEK_API_URL}/models`, {
      headers: { 'Authorization': `Bearer ${DEEPSEEK_API_KEY}` },
    })
    return res.ok
  } catch {
    return false
  }
}
