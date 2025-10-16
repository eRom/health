'use client'

import { deleteUser } from "@/app/actions/admin/delete-user";
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
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Shield, Trash2, User, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type User = {
  id: string;
  email: string;
  role: "USER" | "ADMIN" | "HEALTHCARE_PROVIDER";
  createdAt: Date;
  emailVerified: boolean;
  healthDataConsentGrantedAt: Date | null;
  _count: {
    exerciseAttempts: number;
    sessions: number;
  };
  consentHistory: Array<{
    consentType: string;
    granted: boolean;
    grantedAt: Date;
  }>;
  subscription: {
    status: "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "UNPAID" | "INCOMPLETE" | "INCOMPLETE_EXPIRED";
    currentPeriodEnd: Date;
    trialEnd: Date | null;
    cancelAtPeriodEnd: boolean;
  } | null;
};

interface UsersTableProps {
  users: User[];
}

export function UsersTable({ users }: UsersTableProps) {
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [searchEmail, setSearchEmail] = useState("");
  const [emailVerifiedFilter, setEmailVerifiedFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const router = useRouter();

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    try {
      setDeletingUserId(userId);
      await deleteUser(userId);
      toast.success(`Utilisateur ${userEmail} supprimé`);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de la suppression"
      );
    } finally {
      setDeletingUserId(null);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getConsentStatus = (user: User) => {
    if (user.healthDataConsentGrantedAt) {
      return {
        status: "granted",
        date: formatDate(user.healthDataConsentGrantedAt),
        color:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      };
    }

    const latestConsent = user.consentHistory[0];
    if (latestConsent) {
      return {
        status: latestConsent.granted ? "granted" : "not-granted",
        date: formatDate(latestConsent.grantedAt),
        color: latestConsent.granted
          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      };
    }

    return {
      status: "not-granted",
      date: null,
      color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
    };
  };

  const getSubscriptionStatus = (user: User) => {
    // Admins and healthcare providers are exempt
    if (user.role === "ADMIN" || user.role === "HEALTHCARE_PROVIDER") {
      return {
        label: "Gratuit",
        color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
        details: null,
      };
    }

    // No subscription
    if (!user.subscription) {
      return {
        label: "Aucun",
        color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
        details: null,
      };
    }

    const { status, trialEnd, currentPeriodEnd, cancelAtPeriodEnd } = user.subscription;

    // Trial period
    if (status === "TRIALING") {
      const daysLeft = trialEnd
        ? Math.ceil((new Date(trialEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : 0;
      return {
        label: "Essai gratuit",
        color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
        details: daysLeft > 0 ? `${daysLeft} jour${daysLeft > 1 ? 's' : ''} restant${daysLeft > 1 ? 's' : ''}` : "Expire bientôt",
      };
    }

    // Active subscription
    if (status === "ACTIVE") {
      if (cancelAtPeriodEnd) {
        return {
          label: "Actif (annulation prévue)",
          color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
          details: `Jusqu'au ${formatDate(currentPeriodEnd)}`,
        };
      }
      return {
        label: "Actif",
        color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        details: `Jusqu'au ${formatDate(currentPeriodEnd)}`,
      };
    }

    // Past due (payment failed, grace period)
    if (status === "PAST_DUE") {
      return {
        label: "Impayé",
        color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
        details: "Période de grâce",
      };
    }

    // Canceled
    if (status === "CANCELED") {
      return {
        label: "Annulé",
        color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
        details: null,
      };
    }

    // Unpaid (after grace period)
    if (status === "UNPAID") {
      return {
        label: "Impayé",
        color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
        details: "Accès suspendu",
      };
    }

    // Incomplete (checkout not completed)
    if (status === "INCOMPLETE" || status === "INCOMPLETE_EXPIRED") {
      return {
        label: "Incomplet",
        color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
        details: "Paiement non finalisé",
      };
    }

    return {
      label: "Inconnu",
      color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
      details: null,
    };
  };

  // Filtrage et tri des utilisateurs
  const filteredAndSortedUsers = useMemo(() => {
    const filtered = users.filter((user) => {
      // Filtre par email
      if (
        searchEmail &&
        !user.email.toLowerCase().includes(searchEmail.toLowerCase())
      ) {
        return false;
      }

      // Filtre par email vérifié
      if (emailVerifiedFilter === "verified" && !user.emailVerified) {
        return false;
      }
      if (emailVerifiedFilter === "not-verified" && user.emailVerified) {
        return false;
      }

      return true;
    });

    // Tri
    filtered.sort((a, b) => {
      let aValue: string | Date | number, bValue: string | Date | number;

      switch (sortBy) {
        case "email":
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case "createdAt":
          aValue = a.createdAt;
          bValue = b.createdAt;
          break;
        case "emailVerified":
          aValue = a.emailVerified ? 1 : 0;
          bValue = b.emailVerified ? 1 : 0;
          break;
        case "consentDate":
          aValue = a.healthDataConsentGrantedAt || new Date(0);
          bValue = b.healthDataConsentGrantedAt || new Date(0);
          break;
        default:
          aValue = a.createdAt;
          bValue = b.createdAt;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [users, searchEmail, emailVerifiedFilter, sortBy, sortOrder]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="space-y-4">
      {/* Contrôles de filtrage et tri */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <Input
            placeholder="Rechercher par email..."
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="flex gap-2">
          <Select
            value={emailVerifiedFilter}
            onValueChange={setEmailVerifiedFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Email vérifié" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="verified">Vérifiés</SelectItem>
              <SelectItem value="not-verified">Non vérifiés</SelectItem>
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
              <SelectItem value="email-asc">Email (A-Z)</SelectItem>
              <SelectItem value="email-desc">Email (Z-A)</SelectItem>
              <SelectItem value="createdAt-desc">
                Date création (récent)
              </SelectItem>
              <SelectItem value="createdAt-asc">
                Date création (ancien)
              </SelectItem>
              <SelectItem value="emailVerified-desc">
                Email vérifié (oui)
              </SelectItem>
              <SelectItem value="emailVerified-asc">
                Email vérifié (non)
              </SelectItem>
              <SelectItem value="consentDate-desc">
                Consentement (récent)
              </SelectItem>
              <SelectItem value="consentDate-asc">
                Consentement (ancien)
              </SelectItem>
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
                onClick={() => handleSort("email")}
              >
                Email {sortBy === "email" && (sortOrder === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("createdAt")}
              >
                Créé le{" "}
                {sortBy === "createdAt" && (sortOrder === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("emailVerified")}
              >
                Email vérifié{" "}
                {sortBy === "emailVerified" &&
                  (sortOrder === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("consentDate")}
              >
                Consentement RGPD{" "}
                {sortBy === "consentDate" && (sortOrder === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead>Abonnement</TableHead>
              <TableHead>Exercices</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedUsers.map((user) => {
              const consent = getConsentStatus(user);
              const subscription = getSubscriptionStatus(user);

              return (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.role === "ADMIN"
                          ? "default"
                          : user.role === "HEALTHCARE_PROVIDER"
                            ? "outline"
                            : "secondary"
                      }
                      className={
                        user.role === "HEALTHCARE_PROVIDER"
                          ? "bg-orange-600 text-white"
                          : ""
                      }
                    >
                      {user.role === "ADMIN" ? (
                        <>
                          <Shield className="mr-1 h-3 w-3" />
                          Administrateur
                        </>
                      ) : user.role === "HEALTHCARE_PROVIDER" ? (
                        <>
                          <Users className="mr-1 h-3 w-3" />
                          Soignant
                        </>
                      ) : (
                        <>
                          <User className="mr-1 h-3 w-3" />
                          Utilisateur
                        </>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={user.emailVerified ? "default" : "destructive"}
                    >
                      {user.emailVerified ? "Vérifié" : "Non vérifié"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={consent.color}>
                      {consent.status === "granted" ? "Accordé" : "Non accordé"}
                      {consent.date && ` le ${consent.date}`}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge className={subscription.color}>
                        {subscription.label}
                      </Badge>
                      {subscription.details && (
                        <span className="text-xs text-muted-foreground">
                          {subscription.details}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{user._count.exerciseAttempts}</TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          className="hover:bg-destructive/10"
                          size="sm"
                          disabled={deletingUserId === user.id}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Confirmer la suppression
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer {user.email} ?
                            Toutes ses données seront définitivement supprimées.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              handleDeleteUser(user.id, user.email)
                            }
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Compteur de résultats */}
      <div className="text-sm text-muted-foreground">
        {filteredAndSortedUsers.length} utilisateur
        {filteredAndSortedUsers.length > 1 ? "s" : ""} trouvé
        {filteredAndSortedUsers.length > 1 ? "s" : ""}
        {searchEmail && ` pour "${searchEmail}"`}
      </div>
    </div>
  );
}
