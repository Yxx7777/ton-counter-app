import { Buffer } from 'buffer'
;(globalThis as any).Buffer = Buffer

import React from 'react'
import ReactDOM from 'react-dom/client'
import { TonConnectUIProvider } from '@tonconnect/ui-react'
import './index.css'

const manifestUrl = 'https://yxx7777.github.io/tonconnect-manifest.json'

async function bootstrap() {
  const App = (await import('./App')).default
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <TonConnectUIProvider manifestUrl={manifestUrl}>
        <App />
      </TonConnectUIProvider>
    </React.StrictMode>,
  )
}

bootstrap()
