"use client"

import { QRCodeSVG } from "qrcode.react"
import { Download, QrCode, Printer, Sparkles, ShieldCheck, Share2 } from "lucide-react"

export function QRCodeSection({ userId, domainUrl }: { userId: string, domainUrl: string }) {
  const qrUrl = `${domainUrl}/scan?u=${userId}`

  const downloadQR = () => {
    const svg = document.getElementById("user-qr-code")
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      // High-quality export with generous padding
      const size = 600 
      canvas.width = size
      canvas.height = size
      
      if (ctx) {
        ctx.fillStyle = "white"
        ctx.roundRect(0, 0, size, size, 40) // Modern rounded corners for the export
        ctx.fill()
        
        // Center the QR code
        const qrSize = 440
        const offset = (size - qrSize) / 2
        ctx.drawImage(img, offset, offset, qrSize, qrSize)
        
        const pngFile = canvas.toDataURL("image/png", 1.0)
        const downloadLink = document.createElement("a")
        downloadLink.download = `FoundIt_SmartTag_${userId.slice(0, 5)}.png`
        downloadLink.href = pngFile
        downloadLink.click()
      }
    }
    
    // Ensure cross-origin safety and proper encoding
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)))
  }

  const printQR = () => {
    const svg = document.getElementById("user-qr-code")
    if (!svg) return

    const printWindow = window.open("", "_blank", "width=600,height=600")
    if (!printWindow) return

    const svgData = new XMLSerializer().serializeToString(svg)
    
    printWindow.document.write(`
      <html>
        <head>
          <title>FoundIt! Smart Tag</title>
          <style>
            body { 
              display: flex; justify-content: center; align-items: center; 
              height: 100vh; margin: 0; font-family: 'Inter', sans-serif;
              background: #fff;
            }
            .tag-card {
              border: 3px solid #000;
              padding: 40px;
              text-align: center;
              border-radius: 40px;
              width: 300px;
            }
            .brand { font-weight: 900; font-size: 24px; margin-bottom: 20px; letter-spacing: -1px; }
            .instr { margin-top: 20px; font-weight: 800; text-transform: uppercase; font-size: 14px; letter-spacing: 2px; }
          </style>
        </head>
        <body>
          <div class="tag-card">
            <div class="brand">FoundIt!</div>
            ${svgData}
            <div class="instr">Scan to Return</div>
          </div>
          <script>window.onload = () => { window.print(); window.close(); }</script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <section className="relative overflow-hidden group bg-white p-8 lg:p-12 rounded-[2.5rem] ring-1 ring-slate-200/60 shadow-[0_20px_50px_rgba(0,0,0,0.02)] flex flex-col lg:flex-row gap-12 items-center">
      
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-indigo-50/50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

      <div className="flex-1 space-y-6 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600">
          <Sparkles className="w-3.5 h-3.5" />
          <span className="text-[10px] font-black uppercase tracking-widest">Ownership Protection</span>
        </div>

        <div className="space-y-2">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">
            Your Personal <span className="text-indigo-600">Smart Tag</span>
          </h2>
          <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-xl">
            Physical meets digital. Attach this tag to your valuables to create an anonymous recovery bridge.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
          <div className="flex items-start gap-3">
            <div className="mt-1 p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <p className="text-xs text-slate-500 leading-tight">
              <strong className="text-slate-700 block mb-0.5">Privacy First</strong>
              Your phone number and email remain hidden until you choose to connect.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-1 p-1.5 bg-blue-50 rounded-lg text-blue-600">
              <Share2 className="w-4 h-4" />
            </div>
            <p className="text-xs text-slate-500 leading-tight">
              <strong className="text-slate-700 block mb-0.5">Instant Alerts</strong>
              Get a push notification the moment someone scans your physical tag.
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 pt-4">
          <button 
            onClick={downloadQR}
            className="group flex items-center gap-3 px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-indigo-600 transition-all active:scale-95 shadow-xl shadow-slate-200"
          >
            <Download className="w-5 h-5 group-hover:-translate-y-1 transition-transform" /> 
            Export PNG
          </button>
          <button 
            onClick={printQR}
            className="flex items-center gap-3 px-8 py-4 bg-slate-50 text-slate-700 font-bold rounded-2xl hover:bg-slate-100 transition-all border border-slate-200"
          >
            <Printer className="w-5 h-5" /> Print Tag
          </button>
        </div>
      </div>

      {/* The Visual "Product" Preview */}
      <div className="relative shrink-0">
        <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-100 to-purple-100 rounded-[3rem] blur-2xl opacity-30 group-hover:opacity-50 transition-opacity" />
        
        <div className="relative bg-white p-8 rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 flex flex-col items-center">
          <div className="mb-6 flex items-center justify-center w-full">
            <div className="h-1.5 w-12 bg-slate-100 rounded-full" />
          </div>
          
          <div className="p-4 bg-slate-50 rounded-[2rem] border border-slate-100 group-hover:bg-white transition-colors duration-500">
            <QRCodeSVG 
              id="user-qr-code"
              value={qrUrl} 
              size={200}
              level="H"
              includeMargin={true}
              // Added a subtle indigo tint to the QR squares via the library's props if needed, 
              // but keeping it standard black for maximum scannability.
            />
          </div>

          <div className="mt-8 text-center space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500">FOUNDIT ID</p>
            <p className="text-xs font-mono text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
              {userId.toUpperCase().slice(0, 12)}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}