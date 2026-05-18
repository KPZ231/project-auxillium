"use server"

import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/session"
import { getActiveSpaceId } from "./space"

export async function createNotification({
  title,
  message,
  link,
  userId,
  spaceId
}: {
  title: string
  message?: string
  link?: string
  userId?: string // optional, defaults to current user
  spaceId?: string // optional, defaults to active space
}) {
  try {
    let targetUserId = userId
    if (!targetUserId) {
      const userResult = await getUser()
      if (!userResult.isAuthenticatedAndLogedIn || !userResult.userId) return null
      targetUserId = userResult.userId
    }

    let targetSpaceId = spaceId
    if (targetSpaceId === undefined) {
      const fetchedSpaceId = await getActiveSpaceId()
      targetSpaceId = fetchedSpaceId ?? undefined
    }

    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        link,
        userId: targetUserId,
        ...(targetSpaceId ? { spaceId: targetSpaceId } : {})
      }
    })

    return notification
  } catch (error) {
    console.error("[CREATE_NOTIFICATION_ERROR]", error)
    return null
  }
}

export async function getNotifications() {
  try {
    const { isAuthenticatedAndLogedIn, userId } = await getUser()
    if (!isAuthenticatedAndLogedIn || !userId) return []

    const spaceId = await getActiveSpaceId()

    const notifications = await prisma.notification.findMany({
      where: { 
        userId,
        ...(spaceId ? { spaceId } : {})
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    return notifications
  } catch (error) {
    console.error("[GET_NOTIFICATIONS_ERROR]", error)
    return []
  }
}

export async function markAsRead(id: string) {
  try {
    const { userId } = await getUser()
    if (!userId) return false

    await prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true }
    })
    return true
  } catch (error) {
    return false
  }
}

export async function markAllAsRead() {
  try {
    const { userId } = await getUser()
    if (!userId) return false

    const spaceId = await getActiveSpaceId()

    await prisma.notification.updateMany({
      where: { 
        userId,
        ...(spaceId ? { spaceId } : {})
      },
      data: { isRead: true }
    })
    return true
  } catch (error) {
    return false
  }
}

export async function deleteNotification(id: string) {
  try {
    const { userId } = await getUser()
    if (!userId) return false

    await prisma.notification.deleteMany({
      where: { id, userId }
    })
    return true
  } catch (error) {
    return false
  }
}
