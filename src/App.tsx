// app/src/App.tsx
import { Buffer } from 'buffer'
;(window as any).Buffer = Buffer

import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { TonConnectButton, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react'
import { Address, beginCell } from '@ton/core'

function useContractAddress(): string | null {
  const [addr, setAddr] = useState<string | null>(null)
  useEffect(() => {
    fetch('/contract.json')
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => setAddr(j?.address ?? null))
      .catch(() => setAddr(null))
  }, [])
  return addr
}

async function callGetValue(address: string): Promise<number | null> {
  try {
    const url = (import.meta as any).env?.VITE_TON_RPC_URL?.replace(/\/$/, '') || 'https://testnet.toncenter.com/api'
    const res = await fetch(`${url}/v2/runGetMethod`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, method: 'value', stack: [] })
    })
    const j = await res.json()
    const stack = j?.result?.stack
    if (j?.ok && Array.isArray(stack) && stack.length > 0) {
      const top = stack[0]
      const val = BigInt(top[1])
      return Number(val)
    }
    return null
  } catch {
    return null
  }
}

export default function App() {
  const wallet = useTonWallet()
  const [tcui] = useTonConnectUI()
  const contractAddress = useContractAddress()
  const [counter, setCounter] = useState<number | null>(null)
  const userFriendly = useMemo(() => wallet?.account?.address ?? null, [wallet])

  useEffect(() => {
    if (contractAddress) callGetValue(contractAddress).then(setCounter)
  }, [contractAddress])

  const increment = async () => {
    if (!wallet) return alert('Connect wallet first')
    if (!contractAddress) return alert('Contract address not found')

    const to = Address.parse(contractAddress)
    const body = beginCell().storeUint(0, 32).storeStringTail('increment').endCell()

    try {
      await tcui.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 300,
        messages: [
          {
            address: to.toString({ testOnly: true }),
            amount: String(100_000_000),
            payload: body.toBoc().toString('base64'),
          },
        ],
      })
      setTimeout(() => {
        if (contractAddress) callGetValue(contractAddress).then(setCounter)
      }, 3000)
    } catch (e) {
      console.error(e)
      alert('Transaction rejected or failed')
    }
  }

  return (
    <div style={{ padding: 16, maxWidth: 640, margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>TON Counter dApp (Testnet)</h2>
        <TonConnectButton />
      </div>

      <div style={{ marginTop: 12, lineHeight: 1.6 }}>
        <div><b>Wallet:</b> {userFriendly ?? 'not connected'}</div>
        <div><b>Contract:</b> {contractAddress ?? 'not set'}</div>
        <div><b>Counter:</b> {counter ?? '—'}</div>
      </div>

      <div style={{ marginTop: 16 }}>
        <button onClick={increment} disabled={!wallet || !contractAddress}>increment</button>
      </div>
    </div>
  )
}
