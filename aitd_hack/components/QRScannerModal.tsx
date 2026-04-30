"use client"

import { useState } from "react"
import { Scanner } from "@yudiel/react-qr-scanner"
import { QrCode, X } from "lucide-react"
import { Button } from "./ui/button"

export function QRScannerModal({ onScan }: { onScan: (url: string) => void }) {
  const [isOpen, setIsOpen] = useState(false)

  if (!isOpen) {
    return (
      <Button 
        type="button" 
        variant="outline" 
        className="w-full border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 flex gap-2 items-center"
        onClick={() => setIsOpen(true)}
      >
        <QrCode className="w-4 h-4" />
        Has a Smart QR Tag? Scan it!
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-primary" /> Scan Tag
          </h3>
          <button 
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="bg-black relative">
          <Scanner 
            onScan={(result) => {
              if (result && result.length > 0 && result[0].rawValue) {
                onScan(result[0].rawValue)
                setIsOpen(false)
              }
            }}
            components={{
              onOff: false,
              torch: true,
              zoom: false,
              finder: true,
            }}
            styles={{
              container: { paddingBottom: '100%' } // 1:1 aspect ratio
            }}
          />
        </div>
        
        <div className="p-4 text-center text-sm text-slate-500 bg-slate-50">
          Point your camera at the FoundIt QR Tag
        </div>
      </div>
    </div>
  )
}
