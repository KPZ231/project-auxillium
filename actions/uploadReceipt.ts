'use server'

import { getUser } from "@/lib/session"
import crypto from "crypto"
import { supabase } from "@/lib/supabase"

export async function uploadReceipt(formData: FormData) {
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
    
    // Upload file to 'finance-receipts' bucket in Supabase
    const { data, error } = await supabase.storage
      .from('finance-receipts')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error("[SUPABASE_UPLOAD_RECEIPT_ERROR]", error)
      return { success: false, error: "Failed to upload receipt to Supabase" }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('finance-receipts')
      .getPublicUrl(filename)

    return { 
      success: true, 
      url: publicUrl 
    }
  } catch (error) {
    console.error("[UPLOAD_RECEIPT_ERROR]", error)
    return { success: false, error: "Failed to upload receipt" }
  }
}
