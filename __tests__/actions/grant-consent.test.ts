import { grantConsent } from "@/app/actions/grant-consent"
import { beforeEach, describe, expect, it, vi } from "vitest"

// Mock dependencies
vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}))

vi.mock("@/lib/prisma", () => ({
  prisma: {
    consentHistory: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    user: {
      update: vi.fn(),
    },
  },
}))

vi.mock("next/headers", () => ({
  headers: vi.fn(),
}))

describe("grantConsent", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should grant consent successfully", async () => {
    const mockSession = {
      user: { id: "user-123" },
    }

    const mockHeaders = {
      get: vi.fn((key: string) => {
        if (key === "x-forwarded-for") return "192.168.1.1"
        if (key === "user-agent") return "Mozilla/5.0"
        return null
      }),
    }

    const { auth } = await import("@/lib/auth")
    const { prisma } = await import("@/lib/prisma")
    const { headers } = await import("next/headers")

    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as any)
    vi.mocked(headers).mockResolvedValue(mockHeaders as any)
    vi.mocked(prisma.consentHistory.findFirst).mockResolvedValue(null) // No existing consent
    vi.mocked(prisma.consentHistory.create).mockResolvedValue({} as any)
    vi.mocked(prisma.user.update).mockResolvedValue({} as any)

    const result = await grantConsent()

    expect(result).toEqual({ success: true })
    expect(prisma.consentHistory.create).toHaveBeenCalledWith({
      data: {
        userId: "user-123",
        consentType: "HEALTH_DATA",
        granted: true,
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
      },
    })
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-123" },
      data: { healthDataConsentGrantedAt: expect.any(Date) },
    })
  })

  it("should throw error if user is not authenticated", async () => {
    const { auth } = await import("@/lib/auth")
    vi.mocked(auth.api.getSession).mockResolvedValue(null)

    await expect(grantConsent()).rejects.toThrow("Utilisateur non authentifié")
  })

  it("should throw error if consent already granted", async () => {
    const mockSession = {
      user: { id: "user-123" },
    }

    const { auth } = await import("@/lib/auth")
    const { prisma } = await import("@/lib/prisma")
    const { headers } = await import("next/headers")

    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as any)
    vi.mocked(headers).mockResolvedValue({ get: vi.fn(() => null) } as any)
    vi.mocked(prisma.consentHistory.findFirst).mockResolvedValue({
      id: "consent-123",
      granted: true,
    } as any)

    await expect(grantConsent()).rejects.toThrow("Consentement déjà accordé")
  })

  it("should handle database errors gracefully", async () => {
    const mockSession = {
      user: { id: "user-123" },
    }

    const { auth } = await import("@/lib/auth")
    const { prisma } = await import("@/lib/prisma")
    const { headers } = await import("next/headers")

    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as any)
    vi.mocked(headers).mockResolvedValue({ get: vi.fn(() => null) } as any)
    vi.mocked(prisma.consentHistory.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.consentHistory.create).mockRejectedValue(new Error("Database error"))

    await expect(grantConsent()).rejects.toThrow("Erreur lors de l'octroi du consentement")
  })

  it("should capture IP address from x-real-ip header", async () => {
    const mockSession = {
      user: { id: "user-123" },
    }

    const mockHeaders = {
      get: vi.fn((key: string) => {
        if (key === "x-real-ip") return "10.0.0.1"
        if (key === "user-agent") return "Mozilla/5.0"
        return null
      }),
    }

    const { auth } = await import("@/lib/auth")
    const { prisma } = await import("@/lib/prisma")
    const { headers } = await import("next/headers")

    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as any)
    vi.mocked(headers).mockResolvedValue(mockHeaders as any)
    vi.mocked(prisma.consentHistory.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.consentHistory.create).mockResolvedValue({} as any)
    vi.mocked(prisma.user.update).mockResolvedValue({} as any)

    await grantConsent()

    expect(prisma.consentHistory.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        ipAddress: "10.0.0.1",
      }),
    })
  })
})
