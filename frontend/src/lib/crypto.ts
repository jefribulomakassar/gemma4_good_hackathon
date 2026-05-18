// frontend/lib/crypto.ts

const HMAC_SECRET = process.env.NEXT_PUBLIC_HMAC_SECRET ?? ''

async function getKey(): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  return await crypto.subtle.importKey(
    'raw',
    encoder.encode(HMAC_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
}

export async function signRequest(body: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await getKey()
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(body)
  )
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function verifySignature(
  body: string,
  signature: string
): Promise<boolean> {
  const expected = await signRequest(body)
  return expected === signature
}