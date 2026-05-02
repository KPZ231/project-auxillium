'use server'

import { getUser } from "@/lib/session"
import crypto from "crypto"
import { supabase } from "@/lib/supabase"

export async function uploadImage(formData: FormData) {
  try {
    const { isAuthenticatedAndLogedIn } = await getUser()

    if (!isAuthenticatedAndLogedIn) {
      return { success: false, error: "Unauthorized" }
    }

    const file = formData.get("file") as File | null

    if (!file) {
      return { success: false, error: "No file provided" }
    }

    const fileExtension = file.name.split(".").pop()
    const filename = `${crypto.randomUUID()}.${fileExtension}`
    
    // Wrzucanie pliku do bucketu 'project-images' w Supabase
    const { data, error } = await supabase.storage
      .from('project-images')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error("[SUPABASE_UPLOAD_ERROR]", error)
      return { success: false, error: "Failed to upload image to Supabase" }
    }

    // Pobranie publicznego adresu URL nowo dodanego pliku
    const { data: { publicUrl } } = supabase.storage
      .from('project-images')
      .getPublicUrl(filename)

    return { 
      success: true, 
      url: publicUrl 
    }
  } catch (error) {
    console.error("[UPLOAD_IMAGE_ERROR]", error)
    return { success: false, error: "Failed to upload image" }
  }
}
