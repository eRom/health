import { GoogleButton } from "@/components/auth/google-button"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { vi } from "vitest"

// Mock the auth client
vi.mock("@/lib/auth-client", () => ({
  authClient: {
    signIn: {
      social: vi.fn(),
    },
  },
}))

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      "common.loading": "Loading...",
      "auth.continueWithGoogle": "Continue with Google",
    }
    return translations[key] || key
  },
}))

describe("GoogleButton", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders correctly with default props", () => {
    render(<GoogleButton />)
    
    const button = screen.getByRole("button")
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent("Continue with Google")
  })

  it("renders with custom variant and size", () => {
    render(<GoogleButton variant="outline" size="lg" />)
    
    const button = screen.getByRole("button")
    expect(button).toBeInTheDocument()
  })

  it("shows loading state when clicked", async () => {
    const { authClient } = await import("@/lib/auth-client")
    vi.mocked(authClient.signIn.social).mockImplementation(() => new Promise(() => {})) // Never resolves

    render(<GoogleButton />)
    
    const button = screen.getByRole("button")
    fireEvent.click(button)

    await waitFor(() => {
      expect(button).toHaveTextContent("Loading...")
      expect(button).toBeDisabled()
    })
  })

  it("calls authClient.signIn.social with google provider", async () => {
    const { authClient } = await import("@/lib/auth-client")
    vi.mocked(authClient.signIn.social).mockResolvedValue(undefined)

    render(<GoogleButton />)
    
    const button = screen.getByRole("button")
    fireEvent.click(button)

    await waitFor(() => {
      expect(authClient.signIn.social).toHaveBeenCalledWith({
        provider: "google",
      })
    })
  })

  it("handles errors gracefully", async () => {
    const { authClient } = await import("@/lib/auth-client")
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})
    vi.mocked(authClient.signIn.social).mockRejectedValue(new Error("OAuth error"))

    render(<GoogleButton />)
    
    const button = screen.getByRole("button")
    fireEvent.click(button)

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Google sign in error:", expect.any(Error))
    })

    consoleSpy.mockRestore()
  })

  it("is disabled when disabled prop is true", () => {
    render(<GoogleButton disabled={true} />)
    
    const button = screen.getByRole("button")
    expect(button).toBeDisabled()
  })

  it("applies custom className", () => {
    render(<GoogleButton className="custom-class" />)
    
    const button = screen.getByRole("button")
    expect(button).toHaveClass("custom-class")
  })
})
