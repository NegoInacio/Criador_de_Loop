import Fastify from 'fastify'
import cors from '@fastify/cors'
import Anthropic from '@anthropic-ai/sdk'

const fastify = Fastify({ logger: true })
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

await fastify.register(cors, { origin: true })

fastify.post('/chat', async (request, reply) => {
  const { messages } = request.body

  if (!messages || !Array.isArray(messages)) {
    return reply.status(400).send({ error: 'messages array required' })
  }

  const response = await anthropic.beta.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 4096,
    messages,
    mcp_servers: process.env.N8N_MCP_URL ? [
      {
        type: 'url',
        url: process.env.N8N_MCP_URL,
        name: 'n8n-mcp',
        ...(process.env.N8N_MCP_TOKEN && {
          authorization_token: process.env.N8N_MCP_TOKEN
        })
      }
    ] : undefined,
    betas: process.env.N8N_MCP_URL ? ['mcp-client-2025-04-04'] : [],
  })

  return reply.send({ message: response.content[0]?.text ?? '' })
})

fastify.get('/health', async () => ({ status: 'ok' }))

const port = Number(process.env.PORT) || 3001
await fastify.listen({ port, host: '0.0.0.0' })
