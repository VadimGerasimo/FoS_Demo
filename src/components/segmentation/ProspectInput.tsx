'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'

interface ProspectInputProps {
  onProspect: (volume: number, price: number) => void
  floorPrice: number
}

export function ProspectInput({ onProspect, floorPrice }: ProspectInputProps) {
  const [volume, setVolume] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const vol = parseFloat(volume)
    if (!vol || vol <= 0) return
    // Compute implied floor price for this volume (slight curve: higher volume = lower floor)
    const impliedFloor = floorPrice * Math.pow(vol / 320, -0.04)
    onProspect(vol, parseFloat(impliedFloor.toFixed(2)))
    setVolume('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <span className="text-xs text-text-muted font-medium">New prospect volume:</span>
      <input
        type="number"
        value={volume}
        onChange={e => setVolume(e.target.value)}
        placeholder="e.g. 500"
        className="w-24 text-sm border border-border-default rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-pwc-orange transition-colors"
      />
      <span className="text-xs text-text-muted">kg/mo</span>
      <button
        type="submit"
        className="flex items-center gap-1.5 px-3 py-1.5 bg-pwc-orange text-white text-xs font-medium rounded-lg hover:bg-pwc-orange-dark transition-colors"
      >
        <Search size={12} />
        Plot
      </button>
    </form>
  )
}
