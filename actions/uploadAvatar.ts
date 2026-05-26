'use server'

import { getUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { supabase } from "@/lib/supabase"
import crypto from "crypto"
import { revalidatePath } from "next/cache"

/**
 * Uploads a user avatar to Supabase Storage (bucket: 'avatars'),
 * then persists the public URL to the User record in the database.
 *
 * Returns the public URL on success so the client can update local state immediately.
 */
export async function uploadAvatar(
  formData: FormData
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const { isAuthenticatedAndLogedIn, userId } = await getUser()

    if (!isAuthenticatedAndLogedIn || !userId) {
      return { success: false, error: "Unauthorized" }
    }

    const file = formData.get("file") as File | null

    if (!file) {
      return { success: false, error: "No file provided" }
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!validTypes.includes(file.type)) {
      return { success: false, error: "Invalid file type. Use JPEG, PNG, WebP or GIF." }
    }

    // Validate file size (max 2 MB)
    const MAX_SIZE = 2 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      return { success: false, error: "File too large. Maximum size is 2 MB." }
    }

    const fileExtension = file.name.split(".").pop()
    // Use userId as a stable prefix so old avatars are overwritten (upsert: true)
    const filename = `${userId}/${crypto.randomUUID()}.${fileExtension}`

    // Upload to Supabase Storage  bucket 'avatars' must be public
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filename, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type,
      })

    if (uploadError) {
      console.error("[SUPABASE_AVATAR_UPLOAD_ERROR]", uploadError)
      return { success: false, error: "Failed to upload avatar to storage." }
    }

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filename)

    // Persist URL to database
    await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: publicUrl },
    })

    // Revalidate dashboard layout so SSR picks up new avatar
    revalidatePath("/", "layout")

    return { success: true, url: publicUrl }
  } catch (error) {
    console.error("[UPLOAD_AVATAR_ERROR]", error)
    return { success: false, error: "Failed to upload avatar." }
  }
}
