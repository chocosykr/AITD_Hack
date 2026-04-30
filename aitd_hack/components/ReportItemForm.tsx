"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createItem } from "@/app/actions/item-actions"
import { ImageUpload } from "@/components/ImageUpload"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner" 
import { QRScannerModal } from "@/components/QRScannerModal"

export function ReportItemForm() {
  const router = useRouter()
  const [imageUrl, setImageUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [type, setType] = useState("lost")

  const handleQRScan = (url: string) => {
    // Check if it's a valid FoundIt scan URL
    try {
      const parsedUrl = new URL(url)
      if (parsedUrl.pathname === "/scan" && parsedUrl.searchParams.get("u")) {
        toast.success("Tag recognized! Redirecting to owner...")
        router.push(parsedUrl.pathname + parsedUrl.search)
      } else {
        toast.error("This doesn't look like a valid FoundIt QR tag.")
      }
    } catch {
      toast.error("Invalid QR code.")
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const description = formData.get("description") as string
    
    // Require at least a description or an image
    if (!imageUrl && !description?.trim()) {
      return toast.error("Please upload an image or provide a description")
    }

    setIsSubmitting(true)

    const result = await createItem({
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      locationName: formData.get("location") as string,
      type: formData.get("type") as string,
      imageUrl: imageUrl || undefined,
    })

    if (result.success) {
      toast.success("Item reported!")
      router.push("/") // Redirect to feed
    }
    setIsSubmitting(false)
  }

  return (
    <Card className="max-w-2xl mx-auto mt-10 border-0 shadow-xl ring-1 ring-slate-200/50 rounded-3xl overflow-hidden">
      <CardHeader className="bg-slate-50 border-b border-slate-100 pb-8 pt-8">
        <CardTitle className="text-2xl font-extrabold text-slate-900 text-center">Report an Item</CardTitle>
      </CardHeader>
      <CardContent className="p-8">
        <div className="mb-8">
          <QRScannerModal onScan={handleQRScan} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-7">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700">Item Image <span className="text-slate-400 font-normal">(optional)</span></label>
            <ImageUpload onUploadSuccess={(url) => setImageUrl(url)} />
            {imageUrl && <div className="rounded-2xl overflow-hidden ring-1 ring-slate-200 shadow-sm"><img src={imageUrl} alt="Preview" className="w-full h-56 object-cover" /></div>}
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700">Title</label>
            <Input name="title" placeholder="e.g. Black Leather Wallet" required className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-colors" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700">Type</label>
              <Select name="type" defaultValue="lost">
                <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-colors">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lost">I Lost It</SelectItem>
                  <SelectItem value="found">I Found It</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700">Location</label>
              <Input name="location" placeholder="e.g. Library, Canteen" required className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-colors" />
            </div>
          </div>
          
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700">Description <span className="text-red-500">*</span></label>
            <Textarea name="description" placeholder="Any specific details? (color, brand, etc.) — used for AI matching" required className="min-h-[120px] rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-colors resize-none p-4" />
          </div>

          <Button type="submit" className="w-full h-14 rounded-xl text-lg font-bold bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}