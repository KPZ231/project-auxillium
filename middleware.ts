import { type NextRequest } from 'next/server'
import { proxy, config } from './proxy'

export async function middleware(request: NextRequest) {
  return await proxy(request)
}

export { config }
