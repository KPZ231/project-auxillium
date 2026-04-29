'use server'

import { getUser } from "@/lib/session"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"
import crypto from "crypto"

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

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const fileExtension = file.name.split(".").pop()
    const filename = `${crypto.randomUUID()}.${fileExtension}`
    
    // Zapisz do folderu tymczasowego
    const uploadDir = join(process.cwd(), "public", "temp_uploads")
    
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    const filePath = join(uploadDir, filename)
    await writeFile(filePath, buffer)

    return { 
      success: true, 
      url: `/temp_uploads/${filename}` 
    }
  } catch (error) {
    console.error("[UPLOAD_IMAGE_ERROR]", error)
    return { success: false, error: "Failed to upload image" }
  }
}
