import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { initJapaneseVoice } from '@/utils/speech'

function RootApp() {
  useEffect(() => {
    initJapaneseVoice()
  }, [])

  return (
    <StrictMode>
      <App />
    </StrictMode>
  )
}

createRoot(document.getElementById('root')!).render(<RootApp />)
