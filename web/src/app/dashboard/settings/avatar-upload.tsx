'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, UploadCloud, Camera } from 'lucide-react'
import Image from 'next/image'

export function AvatarUpload({
  userId,
  initialUrl,
  fallbackInitials,
}: {
  userId: string
  initialUrl?: string | null
  fallbackInitials: string
}) {
  const [isUploading, setIsUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialUrl || null)
  const supabase = createClient()

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return

    const file = e.target.files[0]
    setIsUploading(true)

    try {
      const fileExt = file.name.split('.').pop()
      const filePath = `${userId}/avatar.${fileExt}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      // Get public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
      
      setAvatarUrl(data.publicUrl)

      // Update user record
      await supabase.from('users').update({ avatar_url: data.publicUrl }).eq('id', userId)
      await supabase.auth.updateUser({ data: { avatar_url: data.publicUrl } })
      
    } catch (error) {
      console.error('Error uploading avatar:', error)
      alert('Failed to upload avatar. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex items-center gap-6">
      <div className="relative group">
        <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-border flex items-center justify-center text-2xl font-bold text-primary overflow-hidden relative">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            fallbackInitials
          )}
          
          <label className="absolute inset-0 bg-black/50 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
            {isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Camera className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-medium uppercase tracking-wider">Change</span>
              </>
            )}
            <input
              type="file"
              className="hidden"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleUpload}
              disabled={isUploading}
            />
          </label>
        </div>
      </div>
    </div>
  )
}
