'use client'

import { getPatientMessages } from '@/app/actions/patient/get-patient-messages'
import { sendPatientMessage } from '@/app/actions/patient/send-patient-message'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { MessageSquare, Send } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

interface Message {
  id: string
  content: string
  createdAt: Date
  senderId: string
  sender: {
    id: string
    name: string | null
    role: string
  }
}

interface PatientMessagingCardProps {
  associationId: string
  providerName: string
}

export function PatientMessagingCard({ associationId, providerName }: PatientMessagingCardProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadMessages = async () => {
      setIsLoading(true)
      try {
        const fetchedMessages = await getPatientMessages({ associationId })
        setMessages(fetchedMessages)
      } catch {
        toast.error('Erreur lors du chargement des messages')
      } finally {
        setIsLoading(false)
      }
    }
    
    loadMessages()
  }, [associationId])

  // Auto-scroll vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) {
      toast.error('Le message ne peut pas être vide')
      return
    }

    setIsSending(true)
    try {
      const result = await sendPatientMessage(new FormData(e.currentTarget as HTMLFormElement))
      if (result.success) {
        setNewMessage('')
        toast.success('Message envoyé')
        // Reload messages to show the new one and update read status
        const updatedMessages = await getPatientMessages({ associationId })
        setMessages(updatedMessages)
      } else {
        toast.error(result.error || 'Erreur lors de l\'envoi du message')
      }
    } catch (error) {
      toast.error(
        error instanceof Error 
          ? error.message 
          : "Erreur lors de l'envoi du message"
      )
    } finally {
      setIsSending(false)
    }
  }

  const formatMessageDate = (date: Date) => {
    const today = new Date()
    const messageDate = new Date(date)
    
    if (messageDate.toDateString() === today.toDateString()) {
      return "Aujourd'hui"
    }
    
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Hier"
    }

    return messageDate.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    })
  }

  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Messages avec {providerName}
        </CardTitle>
        <CardDescription>
          Échangez des messages avec votre soignant.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Zone des messages */}
        <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
          {isLoading && messages.length === 0 ? (
            <div className="text-center text-muted-foreground">Chargement des messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-muted-foreground">Aucun message pour le moment. Envoyez le premier !</div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const isPatientSender = message.sender.role === 'USER'
                const senderName = isPatientSender ? 'Vous' : providerName
                const senderInitials = getInitials(senderName || message.sender.name || 'U')

                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${isPatientSender ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <Avatar>
                      <AvatarFallback>{senderInitials}</AvatarFallback>
                    </Avatar>
                    <div className={`flex-1 max-w-[80%] ${isPatientSender ? 'text-right' : 'text-left'}`}>
                      <div
                        className={`inline-block rounded-lg p-3 ${
                          isPatientSender
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <div className={`text-xs text-muted-foreground mt-1 ${isPatientSender ? 'text-right' : 'text-left'}`}>
                        {formatMessageDate(message.createdAt)} à {formatMessageTime(message.createdAt)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>

        {/* Formulaire d'envoi */}
        <form onSubmit={handleSendMessage} className="border-t p-4 flex items-center gap-2">
          <input type="hidden" name="associationId" value={associationId} />
          <Textarea
            placeholder="Écrivez un message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 resize-none"
            rows={1}
            name="content"
            disabled={isSending}
          />
          <Button type="submit" disabled={isSending}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Envoyer</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
