// TypeScript: Using environment variables for sensitive data in a Next.js API route
import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const apiKey = process.env.NEXT_PUBLIC_API_KEY
  // API logic using apiKey
}

// Generated by gpt-4-0125-preview
