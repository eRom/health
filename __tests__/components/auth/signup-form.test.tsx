import { signUpWithConsent } from "@/app/actions/signup-with-consent";
import { SignupForm } from "@/components/auth/signup-form";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock dependencies
vi.mock("@/app/actions/signup-with-consent", () => ({
  signUpWithConsent: vi.fn(),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      "auth.dialogSignin.nameLabel": "Nom",
      "auth.dialogSignin.emailLabel": "Email",
      "auth.dialogSignin.passwordLabel": "Mot de passe",
      "auth.dialogSignin.signIn": "S'inscrire",
      "auth.dialogSignin.cancel": "Annuler",
      "auth.consent.label":
        "J'accepte que mes données de santé soient collectées et traitées.",
      "auth.consent.required":
        "Vous devez accepter le traitement de vos données de santé pour créer un compte.",
      "common.loading": "Création...",
    };
    return translations[key] || key;
  },
}));

const mockPush = vi.fn();

vi.mock("@/i18n/routing", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("SignupForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render name, email and password fields", () => {
      render(<SignupForm />);

      expect(screen.getByLabelText(/nom/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
    });

    it("should render consent checkbox", () => {
      render(<SignupForm />);

      const consentCheckbox = screen.getByRole("checkbox", {
        name: /accepte que mes données de santé/i,
      });
      expect(consentCheckbox).toBeInTheDocument();
      expect(consentCheckbox).not.toBeChecked();
    });

    it("should render submit button", () => {
      render(<SignupForm />);

      const submitButton = screen.getByRole("button", { name: /s'inscrire/i });
      expect(submitButton).toBeInTheDocument();
    });

    it("should render cancel link", () => {
      render(<SignupForm />);

      const cancelLink = screen.getByRole("link", { name: /annuler/i });
      expect(cancelLink).toBeInTheDocument();
      expect(cancelLink).toHaveAttribute("href", "/");
    });
  });

  describe("form validation", () => {
    it("should have required name field", () => {
      render(<SignupForm />);

      const nameInput = screen.getByLabelText(/nom/i);
      expect(nameInput).toHaveAttribute("required");
      expect(nameInput).toHaveAttribute("type", "text");
    });

    it("should have required email field with email type", () => {
      render(<SignupForm />);

      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toHaveAttribute("required");
      expect(emailInput).toHaveAttribute("type", "email");
    });

    it("should have required password field with minimum length", () => {
      render(<SignupForm />);

      const passwordInput = screen.getByLabelText(/mot de passe/i);
      expect(passwordInput).toHaveAttribute("required");
      expect(passwordInput).toHaveAttribute("type", "password");
      expect(passwordInput).toHaveAttribute("minlength", "8");
    });
  });

  describe("consent validation", () => {
    it("should disable submit button when consent is not checked", () => {
      render(<SignupForm />);

      const submitButton = screen.getByRole("button", { name: /s'inscrire/i });
      expect(submitButton).toBeDisabled();
    });

    it("should enable submit button when consent is checked", () => {
      render(<SignupForm />);

      const consentCheckbox = screen.getByRole("checkbox", {
        name: /accepte que mes données de santé/i,
      });
      const submitButton = screen.getByRole("button", { name: /s'inscrire/i });

      fireEvent.click(consentCheckbox);

      expect(consentCheckbox).toBeChecked();
      expect(submitButton).not.toBeDisabled();
    });

    it("should show consent required message when unchecked", () => {
      render(<SignupForm />);

      expect(
        screen.getByText(/vous devez accepter le traitement/i)
      ).toBeInTheDocument();
    });

    it("should hide consent required message when checked", () => {
      render(<SignupForm />);

      const consentCheckbox = screen.getByRole("checkbox", {
        name: /accepte que mes données de santé/i,
      });
      fireEvent.click(consentCheckbox);

      expect(
        screen.queryByText(/vous devez accepter le traitement/i)
      ).not.toBeInTheDocument();
    });
  });

  describe("form submission", () => {
    it("should submit form with correct data including consent", async () => {
      vi.mocked(signUpWithConsent).mockResolvedValue({
        success: true,
        user: { id: "1" },
      } as any);

      render(<SignupForm />);

      const nameInput = screen.getByLabelText(/nom/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/mot de passe/i);
      const consentCheckbox = screen.getByRole("checkbox", {
        name: /accepte que mes données de santé/i,
      });
      const submitButton = screen.getByRole("button", { name: /s'inscrire/i });

      fireEvent.change(nameInput, { target: { value: "Test User" } });
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.click(consentCheckbox);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(signUpWithConsent).toHaveBeenCalledWith({
          name: "Test User",
          email: "test@example.com",
          password: "password123",
          healthDataConsent: true,
        });
      });
    });

    it("should redirect to verify-email on successful signup", async () => {
      vi.mocked(signUpWithConsent).mockResolvedValue({
        success: true,
        user: { id: "1" },
      } as any);

      render(<SignupForm />);

      const nameInput = screen.getByLabelText(/nom/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/mot de passe/i);
      const consentCheckbox = screen.getByRole("checkbox", {
        name: /accepte que mes données de santé/i,
      });
      const submitButton = screen.getByRole("button", { name: /s'inscrire/i });

      fireEvent.change(nameInput, { target: { value: "Test User" } });
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.click(consentCheckbox);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/verify-email");
      });
    });

    it("should show loading state during submission", async () => {
      vi.mocked(signUpWithConsent).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<SignupForm />);

      const nameInput = screen.getByLabelText(/nom/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/mot de passe/i);
      const consentCheckbox = screen.getByRole("checkbox", {
        name: /accepte que mes données de santé/i,
      });
      const submitButton = screen.getByRole("button", { name: /s'inscrire/i });

      fireEvent.change(nameInput, { target: { value: "Test User" } });
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.click(consentCheckbox);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/création\.\.\./i)).toBeInTheDocument();
      });
    });

    it("should disable form fields during submission", async () => {
      vi.mocked(signUpWithConsent).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<SignupForm />);

      const nameInput = screen.getByLabelText(/nom/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/mot de passe/i);
      const consentCheckbox = screen.getByRole("checkbox", {
        name: /accepte que mes données de santé/i,
      });
      const submitButton = screen.getByRole("button", { name: /s'inscrire/i });

      fireEvent.change(nameInput, { target: { value: "Test User" } });
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.click(consentCheckbox);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(nameInput).toBeDisabled();
        expect(emailInput).toBeDisabled();
        expect(passwordInput).toBeDisabled();
        expect(consentCheckbox).toBeDisabled();
        expect(submitButton).toBeDisabled();
      });
    });
  });

  describe("error handling", () => {
    it("should display error message on failed signup", async () => {
      vi.mocked(signUpWithConsent).mockRejectedValue(
        new Error("Email already exists")
      );

      render(<SignupForm />);

      const nameInput = screen.getByLabelText(/nom/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/mot de passe/i);
      const consentCheckbox = screen.getByRole("checkbox", {
        name: /accepte que mes données de santé/i,
      });
      const submitButton = screen.getByRole("button", { name: /s'inscrire/i });

      fireEvent.change(nameInput, { target: { value: "Test User" } });
      fireEvent.change(emailInput, {
        target: { value: "existing@example.com" },
      });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.click(consentCheckbox);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeInTheDocument();
        expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
      });
    });

    it("should clear error message on new submission", async () => {
      vi.mocked(signUpWithConsent)
        .mockRejectedValueOnce(new Error("Email already exists"))
        .mockResolvedValueOnce({ success: true, user: { id: "1" } } as any);

      render(<SignupForm />);

      const nameInput = screen.getByLabelText(/nom/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/mot de passe/i);
      const consentCheckbox = screen.getByRole("checkbox", {
        name: /accepte que mes données de santé/i,
      });
      const submitButton = screen.getByRole("button", { name: /s'inscrire/i });

      // First submission - should fail
      fireEvent.change(nameInput, { target: { value: "Test User" } });
      fireEvent.change(emailInput, {
        target: { value: "existing@example.com" },
      });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.click(consentCheckbox);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeInTheDocument();
      });

      // Second submission - should clear error
      fireEvent.change(emailInput, { target: { value: "new@example.com" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      });
    });

    it("should have accessible error message", async () => {
      vi.mocked(signUpWithConsent).mockRejectedValue(
        new Error("Signup failed")
      );

      render(<SignupForm />);

      const nameInput = screen.getByLabelText(/nom/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/mot de passe/i);
      const consentCheckbox = screen.getByRole("checkbox", {
        name: /accepte que mes données de santé/i,
      });
      const submitButton = screen.getByRole("button", { name: /s'inscrire/i });

      fireEvent.change(nameInput, { target: { value: "Test User" } });
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.click(consentCheckbox);
      fireEvent.click(submitButton);

      await waitFor(() => {
        const alert = screen.getByRole("alert");
        expect(alert).toHaveAttribute("aria-live", "polite");
      });
    });
  });
});
