import Fastify from 'fastify'
import cors from '@fastify/cors'
import Anthropic from '@anthropic-ai/sdk'

const fastify = Fastify({ logger: true })
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

await fastify.register(cors, { origin: true })

fastify.post('/chat', async (request, reply) => {
  const { message } = request.body

  if (!message || typeof message !== 'string') {
    return reply.status(400).send({ error: 'message string required' })
  }

  const conversationHistory = []
  conversationHistory.push({ role: 'user', content: message })

  console.log('conversationHistory:', JSON.stringify(conversationHistory))
  console.log('N8N_MCP_URL:', process.env.N8N_MCP_URL)
  console.log('mcp_servers:', JSON.stringify(process.env.N8N_MCP_URL ? [{ type: 'url', url: process.env.N8N_MCP_URL, name: 'n8n-mcp' }] : undefined))

  try {
    const response = await anthropic.beta.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 4096,
      messages: conversationHistory,
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

    return reply.send({ response: response.content[0]?.text ?? '' })
  } catch (error) {
    return reply.status(500).send({
      error: error.message || 'Erro ao processar comando'
    })
  }
})

fastify.get('/health', async () => ({ status: 'ok' }))

const port = Number(process.env.PORT) || 3001
await fastify.listen({ port, host: '0.0.0.0' })
