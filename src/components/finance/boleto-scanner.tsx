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
    // TRY_HARDER faz o OneDReader tentar rotacionar o frame via <canvas> quando a
    // primeira leitura falha, e essa rotação está quebrada no @zxing/library atual
    // (lança "Could not create a Canvas element" em todo frame, travando a leitura).
    // Sem o hint, o reader já tenta a linha normal e invertida (código de cabeça pra
    // baixo) sem precisar rotacionar — suficiente para escaneamento contínuo por vídeo.
    const reader = new BrowserMultiFormatReader(hints)

    reader
      .decodeFromConstraints(
        {
          video: {
            facingMode: 'environment',
            // Resolução baixa (padrão de muitos webcams/celulares) não tem pixels
            // suficientes por barra para ler um código 1D — força alta resolução e
            // foco contínuo (essencial pra ler de perto). "ideal" é best-effort, não
            // quebra em dispositivos que não suportam.
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            advanced: [{ focusMode: 'continuous' } as MediaTrackConstraintSet],
          },
        },
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
