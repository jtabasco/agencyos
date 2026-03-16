import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Standalone output for Docker
  output: 'standalone',
  // Activa el MCP server en /_next/mcp (Next.js 16+)
  experimental: {
    mcpServer: true,
  },
}

export default nextConfig
