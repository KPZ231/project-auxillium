"use client"

import { useState, useEffect, useRef } from "react"
import { Bell, X, Check } from "lucide-react"
import { getNotifications, markAsRead, deleteNotification, markAllAsRead } from "@/actions/notifications"
import { useRouter, usePathname } from "next/navigation"

type Notification = {
  id: string
  title: string
  message: string | null
  link: string | null
  isRead: boolean
  createdAt: Date
}

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true)
        const data = await getNotifications()
        setNotifications(data as Notification[])
      } catch (error) {
        console.error("Failed to fetch notifications", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()

    // Opcjonalnie: można dodać interwał do odświeżania powiadomień co jakiś czas
    // const interval = setInterval(fetchNotifications, 60000)
    // return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const unreadCount = notifications.filter(n => !n.isRead).length

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      // Optimistic update
      setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n))
      await markAsRead(notification.id)
    }
    
    setIsOpen(false)
    
    if (notification.link) {
      // Obsługa lokalizacji w linku, jeśli link nie ma prefixu to zakładamy /pl/ jako domyślny lub używamy aktualnego
      const locale = pathname.split("/")[1] || "en"
      const prefix = `/${locale}`
      const url = notification.link.startsWith('/') ? `${prefix}${notification.link}` : `${prefix}/${notification.link}`
      router.push(url)
    }
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    // Optimistic update
    setNotifications(prev => prev.filter(n => n.id !== id))
    await deleteNotification(id)
  }

  const handleMarkAllRead = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    await markAllAsRead()
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-400 hover:text-black transition relative p-2"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-none border border-white"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-black z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#F4F4F5]">
            <h3 className="text-sm font-bold text-[#0A0A0A]">Powiadomienia</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="text-xs text-[#71717A] hover:text-[#0A0A0A] flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                Oznacz jako przeczytane
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-[#71717A]">Ładowanie...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-[#71717A]">Brak nowych powiadomień</div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`relative p-4 border-b border-[#F4F4F5] last:border-b-0 cursor-pointer transition-colors group ${
                    notification.isRead ? 'bg-white hover:bg-[#F4F4F5]' : 'bg-[#FAFAFA] hover:bg-[#F4F4F5]'
                  }`}
                >
                  <div className="pr-6">
                    <h4 className={`text-sm ${notification.isRead ? 'font-normal text-[#0A0A0A]' : 'font-semibold text-[#0A0A0A]'}`}>
                      {notification.title}
                    </h4>
                    {notification.message && (
                      <p className="text-xs text-[#71717A] mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                    )}
                    <span className="text-[10px] text-[#A1A1AA] mt-2 block">
                      {new Date(notification.createdAt).toLocaleDateString()} {new Date(notification.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  
                  <button 
                    onClick={(e) => handleDelete(e, notification.id)}
                    className="absolute top-4 right-4 text-[#A1A1AA] opacity-0 group-hover:opacity-100 hover:text-[#DC2626] transition-opacity"
                    title="Usuń powiadomienie"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  
                  {!notification.isRead && (
                    <div className="absolute top-1/2 left-2 w-1.5 h-1.5 bg-black -translate-y-1/2" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
