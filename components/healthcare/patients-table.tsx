'use client'

import { cancelInvitation } from '@/app/actions/healthcare/cancel-invitation'
import { removePatient as removePatientAction } from '@/app/actions/healthcare/remove-patient'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Activity,
    Clock,
    Eye,
    Filter,
    MessageSquare,
    Minus,
    Search,
    TrendingDown,
    TrendingUp,
    X
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { AssociationStatusBadge } from './association-status-badge'

type Patient = {
  id: string
  patientId: string
  patientName: string
  patientEmail: string
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED'
  createdAt: Date
  acceptedAt?: Date | null
  invitationSentAt?: Date | null
  stats: {
    totalAttempts: number
    averageScore: number
    lastActivity: Date
    unreadMessages: number
    totalMessages: number
  }
}

interface PatientsTableProps {
  patients: Patient[]
}

export function PatientsTable({ patients }: PatientsTableProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('lastActivity')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [actionLoading, setActionLoading] = useState<string | null>(null)


  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return "Aujourd&apos;hui"
    if (diffInDays === 1) return "Hier"
    if (diffInDays < 7) return `Il y a ${diffInDays} jours`
    if (diffInDays < 30) return `Il y a ${Math.floor(diffInDays / 7)} semaines`
    return `Il y a ${Math.floor(diffInDays / 30)} mois`
  }

  const getTrendIcon = (score: number) => {
    if (score >= 80) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (score >= 60) return <Minus className="h-4 w-4 text-yellow-600" />
    return <TrendingDown className="h-4 w-4 text-red-600" />
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const handleCancelInvitation = async (associationId: string, patientName: string) => {
    setActionLoading(associationId)
    try {
      await cancelInvitation({ associationId })
      toast.success(`Invitation annulée pour ${patientName}`)
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Erreur lors de l&apos;annulation'
      )
    } finally {
      setActionLoading(null)
    }
  }

  const handleRemovePatient = async (associationId: string, patientName: string) => {
    setActionLoading(associationId)
    try {
      await removePatientAction({ associationId })
      toast.success(`${patientName} retiré de vos patients`)
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Erreur lors de la suppression'
      )
    } finally {
      setActionLoading(null)
    }
  }

  const filteredAndSortedPatients = useMemo(() => {
    const filtered = patients.filter(patient => {
      // Filtre par recherche
      if (searchTerm && !patient.patientName.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !patient.patientEmail.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }

      // Filtre par status
      if (statusFilter !== 'all' && patient.status !== statusFilter) {
        return false
      }

      return true
    })

    // Tri
    filtered.sort((a, b) => {
      let aValue: string | number | Date, bValue: string | number | Date

      switch (sortBy) {
        case 'name':
          aValue = a.patientName.toLowerCase()
          bValue = b.patientName.toLowerCase()
          break
        case 'email':
          aValue = a.patientEmail.toLowerCase()
          bValue = b.patientEmail.toLowerCase()
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        case 'lastActivity':
          aValue = a.stats.lastActivity
          bValue = b.stats.lastActivity
          break
        case 'totalAttempts':
          aValue = a.stats.totalAttempts
          bValue = b.stats.totalAttempts
          break
        case 'averageScore':
          aValue = a.stats.averageScore
          bValue = b.stats.averageScore
          break
        default:
          aValue = a.stats.lastActivity
          bValue = b.stats.lastActivity
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [patients, searchTerm, statusFilter, sortBy, sortOrder])

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  return (
    <div className="space-y-4">
      {/* Filtres et recherche */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="PENDING">En attente</SelectItem>
              <SelectItem value="ACCEPTED">Accepté</SelectItem>
              <SelectItem value="DECLINED">Refusé</SelectItem>
              <SelectItem value="CANCELLED">Annulé</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={`${sortBy}-${sortOrder}`}
            onValueChange={(value) => {
              const [field, order] = value.split("-");
              setSortBy(field);
              setSortOrder(order as "asc" | "desc");
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Nom (A-Z)</SelectItem>
              <SelectItem value="name-desc">Nom (Z-A)</SelectItem>
              <SelectItem value="lastActivity-desc">
                Dernière activité (récent)
              </SelectItem>
              <SelectItem value="lastActivity-asc">
                Dernière activité (ancien)
              </SelectItem>
              <SelectItem value="totalAttempts-desc">
                Exercices (plus)
              </SelectItem>
              <SelectItem value="totalAttempts-asc">
                Exercices (moins)
              </SelectItem>
              <SelectItem value="averageScore-desc">
                Score (plus haut)
              </SelectItem>
              <SelectItem value="averageScore-asc">Score (plus bas)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tableau */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("name")}
              >
                Patient {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead>Statut</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("lastActivity")}
              >
                Dernière activité{" "}
                {sortBy === "lastActivity" && (sortOrder === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("totalAttempts")}
              >
                Exercices{" "}
                {sortBy === "totalAttempts" &&
                  (sortOrder === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("averageScore")}
              >
                Score moyen{" "}
                {sortBy === "averageScore" && (sortOrder === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead>Messages</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedPatients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{patient.patientName}</div>
                    <div className="text-sm text-muted-foreground">
                      {patient.patientEmail}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <AssociationStatusBadge status={patient.status} />
                </TableCell>
                <TableCell>
                  {patient.status === "ACCEPTED" ? (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {formatTimeAgo(patient.stats.lastActivity)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {patient.status === "ACCEPTED" ? (
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {patient.stats.totalAttempts}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {patient.status === "ACCEPTED" ? (
                    <div className="flex items-center gap-2">
                      {getTrendIcon(patient.stats.averageScore)}
                      <span
                        className={`font-medium ${getScoreColor(patient.stats.averageScore)}`}
                      >
                        {patient.stats.averageScore.toFixed(1)}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {patient.status === "ACCEPTED" ? (
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {patient.stats.totalMessages}
                      </span>
                      {patient.stats.unreadMessages > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {patient.stats.unreadMessages}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {patient.status === "ACCEPTED" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(
                              `/fr/healthcare/patients/${patient.patientId}`
                            )
                          }
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(
                              `/fr/healthcare/patients/${patient.patientId}?tab=messages`
                            )
                          }
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </>
                    )}

                    {patient.status === "PENDING" && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={actionLoading === patient.id}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Annuler l&apos;invitation
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Êtes-vous sûr de vouloir annuler l&apos;invitation
                              pour {patient.patientName} ? Cette action ne peut
                              pas être annulée.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                handleCancelInvitation(
                                  patient.id,
                                  patient.patientName
                                )
                              }
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Annuler l&apos;invitation
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}

                    {patient.status === "ACCEPTED" && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={actionLoading === patient.id}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Retirer le patient
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Êtes-vous sûr de vouloir retirer{" "}
                              {patient.patientName} de vos patients ? Vous ne
                              pourrez plus suivre sa progression ni échanger des
                              messages avec lui.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                handleRemovePatient(
                                  patient.id,
                                  patient.patientName
                                )
                              }
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Retirer le patient
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Compteur de résultats */}
      <div className="text-sm text-muted-foreground">
        {filteredAndSortedPatients.length} patient
        {filteredAndSortedPatients.length > 1 ? "s" : ""} trouvé
        {filteredAndSortedPatients.length > 1 ? "s" : ""}
        {searchTerm && ` pour "${searchTerm}"`}
        {statusFilter !== "all" && ` avec le statut "${statusFilter}"`}
      </div>
    </div>
  );
}
