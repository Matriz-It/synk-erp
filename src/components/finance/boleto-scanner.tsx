'use client'

import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader, type IScannerControls } from '@zxing/browser'
import { BarcodeFormat, DecodeHintType } from '@zxing/library'
import { AlertCircle } from 'lucide-react'

interface BoletoScannerProps {
  onDetected: (codigoBarras: string) => void
}

export function BoletoScanner({ onDetected }: BoletoScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsRef = useRef<IScannerControls | null>(null)
  const onDetectedRef = useRef(onDetected)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { onDetectedRef.current = onDetected }, [onDetected])

  useEffect(() => {
    let cancelled = false
    const hints = new Map<DecodeHintType, unknown>()
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.ITF, BarcodeFormat.CODE_128])
    hints.set(DecodeHintType.TRY_HARDER, true)
    const reader = new BrowserMultiFormatReader(hints)

    reader
      .decodeFromConstraints(
        { video: { facingMode: 'environment' } },
        videoRef.current ?? undefined,
        (result, _err, controls) => {
          if (cancelled) return
          controlsRef.current = controls
          if (!result) return
          const digits = result.getText().replace(/\D/g, '')
          if (digits.length === 44) {
            controls.stop()
            onDetectedRef.current(digits)
          }
        },
      )
      .catch((err: unknown) => {
        if (cancelled) return
        const name = err instanceof Error ? err.name : ''
        setError(
          name === 'NotAllowedError'
            ? 'Permita o acesso à câmera para escanear o boleto.'
            : 'Não foi possível acessar a câmera neste dispositivo.',
        )
      })

    return () => {
      cancelled = true
      controlsRef.current?.stop()
    }
  }, [])

  if (error) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-md border border-synk-danger/30 bg-[#fee2e2] p-6 text-center">
        <AlertCircle className="size-5 text-synk-danger" strokeWidth={1.5} />
        <p className="text-[13px] text-synk-danger">{error}</p>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-md border border-[#E2E8F0] bg-black">
      <video ref={videoRef} className="aspect-video w-full object-cover" muted playsInline />
      <div className="pointer-events-none absolute inset-x-8 top-1/2 h-16 -translate-y-1/2 rounded-md border-2 border-white/70" />
    </div>
  )
}
