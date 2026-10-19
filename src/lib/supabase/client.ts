import { createBrowserClient } from '@supabase/ssr'

let cachedClient: ReturnType<typeof createClientInternal> | undefined

function createClientInternal() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sxfowiececnrqytbtpcb.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_T7Mq_vlz7S3VmWYQum4YOA_0KrqHB68'
  return createBrowserClient(url, key)
}

export function createClient() {
  if (!cachedClient) {
    cachedClient = createClientInternal()
  }
  return cachedClient
}
