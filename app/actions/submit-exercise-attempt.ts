'use server'

import { auth } from "@/lib/auth";
import {
  checkAndAwardFirstExerciseBadge,
  checkAndAwardStreakBadges,
  checkAndAwardVolumeBadges,
  getNewlyEarnedBadges,
  isValidExerciseForBadge,
  updateStreakData,
} from "@/lib/badges";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { SubmitExerciseAttemptSchema } from "@/lib/schemas/exercise";
import type { UserBadgeWithProgress } from "@/lib/types/badge";
import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export async function submitExerciseAttempt(input: unknown) {
  try {
    // 1. Validate input with Zod
    const validated = SubmitExerciseAttemptSchema.parse(input);

    // 2. Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Vous devez être connecté pour soumettre une tentative",
      };
    }

    // 3. Create exercise attempt in database
    const attempt = await prisma.exerciseAttempt.create({
      data: {
        exerciseSlug: validated.exerciseSlug,
        userId: session.user.id,
        score: validated.score,
        duration: validated.duration,
        data: validated.data as Prisma.InputJsonValue | undefined,
      },
    });

    // 4. Check and award badges if exercise is valid
    const isValidForBadge = isValidExerciseForBadge(
      validated.score,
      validated.duration
    );
    let newBadges: UserBadgeWithProgress[] = [];

    if (isValidForBadge) {
      // Award first exercise badge
      await checkAndAwardFirstExerciseBadge(session.user.id);

      // Update streak data
      await updateStreakData(session.user.id);

      // Get current streak for streak badges
      const streakData = await prisma.streakData.findUnique({
        where: { userId: session.user.id },
        select: { currentStreak: true },
      });
      const currentStreak = streakData?.currentStreak || 0;

      // Award streak badges
      await checkAndAwardStreakBadges(session.user.id, currentStreak);

      // Count total valid exercises for volume badges
      const totalExercises = await prisma.exerciseAttempt.count({
        where: {
          userId: session.user.id,
          score: { gt: 0 },
          duration: { gt: 30 },
        },
      });

      // Award volume badges
      await checkAndAwardVolumeBadges(session.user.id, totalExercises);

      // Get newly earned badges for response
      newBadges = await getNewlyEarnedBadges(session.user.id);
    }

    // 5. Revalidate relevant paths
    revalidatePath("/dashboard");
    revalidatePath("/neuro");
    revalidatePath("/ortho");
    revalidatePath("/badges");

    return {
      success: true,
      attemptId: attempt.id,
      newBadges,
    };
  } catch (error) {
    logger.error(error, 'Error submitting exercise attempt')

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue',
    }
  }
}
