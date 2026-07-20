import Fastify from 'fastify'
import cors from '@fastify/cors'
import Anthropic from '@anthropic-ai/sdk'

const fastify = Fastify({ logger: true })
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

await fastify.register(cors, { origin: true })

const SYSTEM_PROMPT = `Você é o n8n Commander, um assistente especializado em criar e gerenciar automações no n8n.

Você tem acesso às ferramentas MCP do n8n. Sempre que o usuário pedir para criar, editar, listar ou executar workflows, use essas ferramentas diretamente — não apenas descreva o que faria.

Regras:
- Prefira ação a explicação: execute a ferramenta e confirme o resultado.
- Se precisar de mais informações para completar uma tarefa, pergunte de forma objetiva.
- Responda sempre em português.`

fastify.post('/chat', async (request, reply) => {
  const { message, history } = request.body

  if (!message || typeof message !== 'string') {
    return reply.status(400).send({ error: 'message string required' })
  }

  if (!process.env.N8N_MCP_URL) {
    return reply.status(500).send({ error: 'N8N_MCP_URL não configurado no servidor' })
  }

  const conversationHistory = [
    ...(Array.isArray(history) ? history : []),
    { role: 'user', content: message },
  ]

  console.log('conversationHistory:', JSON.stringify(conversationHistory))
  console.log('N8N_MCP_URL:', process.env.N8N_MCP_URL)

  try {
    const response = await anthropic.beta.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: conversationHistory,
      mcp_servers: [
        {
          type: 'url',
          url: process.env.N8N_MCP_URL,
          name: 'n8n-mcp',
          ...(process.env.N8N_MCP_TOKEN && {
            authorization_token: process.env.N8N_MCP_TOKEN,
          }),
        },
      ],
      betas: ['mcp-client-2025-04-04'],
    })

    console.log('response content:', JSON.stringify(response.content))

    const assistantMessage = response.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('\n')

    console.log('assistantMessage:', assistantMessage)

    return reply.send({ response: assistantMessage })
  } catch (error) {
    console.error('Anthropic error:', error)
    return reply.status(500).send({
      error: error.message || 'Erro ao processar comando',
    })
  }
})

fastify.get('/health', async () => ({ status: 'ok' }))

const port = Number(process.env.PORT) || 3001
await fastify.listen({ port, host: '0.0.0.0' })
