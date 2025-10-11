'use client'

import { getMessages } from '@/app/actions/healthcare/get-messages'
import { sendMessage } from '@/app/actions/healthcare/send-message'
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
  read: boolean
  createdAt: Date
  sender: {
    id: string
    name: string
    role: string
  }
}

interface PatientMessagesProps {
  associationId: string
  patientName: string
  providerName: string
}

export function PatientMessages({ associationId, patientName, providerName }: PatientMessagesProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadMessages = async () => {
      setIsLoading(true)
      try {
        const fetchedMessages = await getMessages({ associationId })
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
      const sentMessage = await sendMessage({
        associationId,
        content: newMessage.trim()
      })
      
      setMessages(prev => [sentMessage.message, ...prev])
      setNewMessage('')
      toast.success('Message envoyé')
    } catch (error) {
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Erreur lors de l&apos;envoi du message'
      )
    } finally {
      setIsSending(false)
    }
  }

  const formatTime = (date: Date) => {
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
      .slice(0, 2)
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Messages avec {patientName}
        </CardTitle>
        <CardDescription>
          Échangez des messages avec votre patient pour le suivre et l&apos;accompagner.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Zone des messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-sm text-muted-foreground">Chargement des messages...</div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Aucun message pour le moment
              </p>
              <p className="text-xs text-muted-foreground">
                Envoyez votre premier message pour commencer la conversation
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const isProvider = message.sender.role === 'HEALTHCARE_PROVIDER'
                
                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${isProvider ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {isProvider ? getInitials(providerName) : getInitials(patientName)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className={`flex-1 max-w-[80%] ${isProvider ? 'text-right' : 'text-left'}`}>
                      <div
                        className={`inline-block p-3 rounded-lg ${
                          isProvider
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                      
                      <div className={`text-xs text-muted-foreground mt-1 ${isProvider ? 'text-right' : 'text-left'}`}>
                        {formatTime(message.createdAt)}
                        {!message.read && !isProvider && (
                          <span className="ml-2 text-primary">• Non lu</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>

        {/* Formulaire d'envoi */}
        <div className="border-t p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Tapez votre message..."
              className="flex-1 min-h-[60px] max-h-[120px] resize-none"
              disabled={isSending}
              maxLength={1000}
            />
            <Button 
              type="submit" 
              size="sm" 
              disabled={isSending || !newMessage.trim()}
              className="self-end"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          
          <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
            <span>{newMessage.length}/1000 caractères</span>
            <span>Appuyez sur Entrée pour envoyer</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
