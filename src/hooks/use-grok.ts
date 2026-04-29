import { useState, useCallback } from "react"

interface GrokRecommendation {
  success: boolean
  recommendation?: string
  error?: string
  query: string
  occasion?: string
  budget?: number
}

interface UseGrokOptions {
  query: string
  occasion?: string
  budget?: number
}

export function useGrok() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getRecommendations = useCallback(
    async (options: UseGrokOptions): Promise<string | null> => {
      setLoading(true)
      setError(null)

      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
        const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

        if (!supabaseUrl || !anonKey) {
          throw new Error("Supabase configuration missing")
        }

        const functionUrl = `${supabaseUrl}/functions/v1/grok-recommendations`

        const response = await fetch(functionUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${anonKey}`,
            "X-Client-Info": "giftnest-web",
          },
          body: JSON.stringify({
            query: options.query,
            occasion: options.occasion,
            budget: options.budget,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || `HTTP ${response.status}`)
        }

        const data: GrokRecommendation = await response.json()

        if (!data.success) {
          throw new Error(data.error || "Failed to get recommendations")
        }

        return data.recommendation || null
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error"
        setError(errorMsg)
        console.error("Grok recommendation error:", err)
        return null
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { getRecommendations, loading, error }
}
