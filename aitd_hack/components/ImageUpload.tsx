"use client"

import { useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, UploadCloud } from "lucide-react"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export function ImageUpload({ onUploadSuccess }: { onUploadSuccess: (url: string) => void }) {
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      if (!e.target.files || e.target.files.length === 0) return

      const file = e.target.files[0]
      const fileExt = file.name.split(".").pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `item-images/${fileName}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("items")
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get Public URL
      const { data } = supabase.storage.from("items").getPublicUrl(filePath)
      
      onUploadSuccess(data.publicUrl)
    } catch (error) {
      console.error("Error uploading image:", error)
      alert("Error uploading image!")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
        className="cursor-pointer"
      />
      {uploading && (
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /> Uploading to Supabase...
        </p>
      )}
    </div>
  )
}