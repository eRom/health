import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { UserBadgeWithProgress } from "@/lib/types/badge";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { BadgeShareButton } from "./badge-share-button";

interface BadgeNotificationProps {
  badges: UserBadgeWithProgress[];
  onClose: () => void;
  onViewBadges?: () => void;
}

export function BadgeNotification({
  badges,
  onClose,
  onViewBadges,
}: BadgeNotificationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentBadgeIndex, setCurrentBadgeIndex] = useState(0);

  useEffect(() => {
    if (badges.length > 0) {
      setIsOpen(true);
    }
  }, [badges]);

  const currentBadge = badges[currentBadgeIndex];
  const hasNextBadge = currentBadgeIndex < badges.length - 1;

  const handleNext = () => {
    if (hasNextBadge) {
      setCurrentBadgeIndex(currentBadgeIndex + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setCurrentBadgeIndex(0);
    onClose();
  };

  const handleViewBadges = () => {
    handleClose();
    onViewBadges?.();
  };

  if (!currentBadge) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">🎉 Nouveau Badge !</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Confetti animation */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping",
                    "opacity-75"
                  )}
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${1 + Math.random() * 2}s`,
                  }}
                />
              ))}
            </div>

            {/* Badge display */}
            <Card className="relative z-10 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
              <CardContent className="p-6 text-center">
                <div className="text-6xl mb-4 animate-bounce">
                  {currentBadge.definition.emoji}
                </div>
                <h3 className="font-bold text-xl mb-2">
                  {currentBadge.definition.name}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {currentBadge.definition.message}
                </p>
                <div className="text-sm text-muted-foreground">
                  Obtenu le {currentBadge.earnedAt.toLocaleDateString("fr-FR")}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress indicator */}
          {badges.length > 1 && (
            <div className="text-center text-sm text-muted-foreground">
              Badge {currentBadgeIndex + 1} sur {badges.length}
            </div>
          )}

          {/* Actions */}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <div className="flex gap-2 w-full">
              <BadgeShareButton badge={currentBadge} disabled={true} />
              {onViewBadges && (
                <Button
                  variant="outline"
                  onClick={handleViewBadges}
                  className="flex-1"
                >
                  Voir mes badges
                </Button>
              )}
              <Button onClick={handleNext} className="flex-1">
                {hasNextBadge ? "Suivant" : "Fermer"}
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// CSS animations for confetti
const confettiStyles = `
@keyframes confetti-fall {
  0% {
    transform: translateY(-100vh) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}

.confetti {
  animation: confetti-fall 3s linear infinite;
}
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = confettiStyles;
  document.head.appendChild(styleSheet);
}
