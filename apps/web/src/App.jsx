import { useState, useRef, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://criadordeloop-production.up.railway.app'

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    background: '#0d1117',
  },
  header: {
    padding: '12px 20px',
    borderBottom: '1px solid #30363d',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#58a6ff',
    fontSize: '1rem',
    fontWeight: 'bold',
    letterSpacing: '0.05em',
  },
  resetBtn: {
    background: 'transparent',
    border: '1px solid #30363d',
    color: '#8b949e',
    padding: '4px 12px',
    cursor: 'pointer',
    borderRadius: '4px',
    fontFamily: 'inherit',
    fontSize: '0.8rem',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  message: (role) => ({
    maxWidth: '80%',
    alignSelf: role === 'user' ? 'flex-end' : 'flex-start',
    padding: '10px 14px',
    borderRadius: '6px',
    background: role === 'user' ? '#1f6feb' : '#161b22',
    border: `1px solid ${role === 'user' ? '#388bfd' : '#30363d'}`,
    whiteSpace: 'pre-wrap',
    lineHeight: '1.5',
    fontSize: '0.9rem',
  }),
  label: (role) => ({
    fontSize: '0.7rem',
    color: role === 'user' ? '#79c0ff' : '#3fb950',
    marginBottom: '4px',
  }),
  loading: {
    color: '#3fb950',
    fontSize: '0.85rem',
    padding: '8px 0',
    animation: 'blink 1s step-end infinite',
  },
  inputRow: {
    display: 'flex',
    gap: '8px',
    padding: '16px 20px',
    borderTop: '1px solid #30363d',
  },
  input: {
    flex: 1,
    background: '#161b22',
    border: '1px solid #30363d',
    color: '#c9d1d9',
    padding: '10px 14px',
    fontFamily: 'inherit',
    fontSize: '0.9rem',
    borderRadius: '6px',
    outline: 'none',
  },
  sendBtn: {
    background: '#238636',
    border: 'none',
    color: '#fff',
    padding: '10px 20px',
    cursor: 'pointer',
    borderRadius: '6px',
    fontFamily: 'inherit',
    fontSize: '0.9rem',
  },
}

export default function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send() {
    const userMessage = input.trim()
    if (!userMessage || loading) return

    setMessages(prev => [...prev, { role: 'user', text: userMessage }])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      })
      const data = await res.json()
      console.log('resposta da api:', data)
      const text = data.response || data.error || JSON.stringify(data)
      setMessages(prev => [...prev, { role: 'assistant', text }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: '⚠ Erro ao conectar com a API.' }])
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>{'> n8n Commander'}</span>
        <button style={styles.resetBtn} onClick={() => setMessages([])}>
          Resetar conversa
        </button>
      </div>

      <div style={styles.messages}>
        {messages.map((m, i) => (
          <div key={i} style={message(m.role)}>
            <div style={styles.label(m.role)}>{m.role === 'user' ? 'você' : 'claude'}</div>
            {m.text}
          </div>
        ))}
        {loading && <div style={styles.loading}>claude está digitando...</div>}
        <div ref={bottomRef} />
      </div>

      <div style={styles.inputRow}>
        <input
          style={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Digite sua mensagem..."
          disabled={loading}
        />
        <button style={styles.sendBtn} onClick={send} disabled={loading}>
          Enviar
        </button>
      </div>
    </div>
  )
}

function message(role) {
  return styles.message(role)
}
