import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ContactForm from "@/components/ContactForm";

describe("ContactForm", () => {
  it("should render all form fields", () => {
    render(<ContactForm />);

    expect(screen.getByLabelText("Nombre completo")).toBeInTheDocument();
    expect(screen.getByLabelText("WhatsApp")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("¿Qué te gustaría automatizar?")).toBeInTheDocument();
  });

  it("should render the submit button", () => {
    render(<ContactForm />);

    expect(screen.getByRole("button", { name: "Quiero mi consulta gratis" })).toBeInTheDocument();
  });

  it("should show validation errors when submitting empty form", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.click(screen.getByRole("button", { name: "Quiero mi consulta gratis" }));

    await waitFor(() => {
      expect(screen.getByText("El nombre es obligatorio")).toBeInTheDocument();
      expect(screen.getByText("El WhatsApp es obligatorio")).toBeInTheDocument();
      expect(screen.getByText("El email es obligatorio")).toBeInTheDocument();
      expect(screen.getByText("Contanos qué te gustaría automatizar")).toBeInTheDocument();
    });
  });

  it("should not submit with invalid email", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(screen.getByLabelText("Nombre completo"), "Juan");
    await user.type(screen.getByLabelText("WhatsApp"), "+54 11 1234-5678");
    await user.type(screen.getByLabelText("Email"), "invalid-email");
    await user.type(screen.getByLabelText("¿Qué te gustaría automatizar?"), "Ventas");
    await user.click(screen.getByRole("button", { name: "Quiero mi consulta gratis" }));

    // Wait a tick for validation to run
    await waitFor(() => {
      // Form should still be visible (not replaced by success message)
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
      expect(screen.queryByText("Recibimos tu mensaje")).not.toBeInTheDocument();
    });
  });

  it("should show success message after valid submission", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(screen.getByLabelText("Nombre completo"), "Juan Pérez");
    await user.type(screen.getByLabelText("WhatsApp"), "+54 11 1234-5678");
    await user.type(screen.getByLabelText("Email"), "juan@example.com");
    await user.type(screen.getByLabelText("¿Qué te gustaría automatizar?"), "Atención al cliente");
    await user.click(screen.getByRole("button", { name: "Quiero mi consulta gratis" }));

    await waitFor(
      () => {
        expect(screen.getByText("Recibimos tu mensaje")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it("should show loading state during submission", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<ContactForm />);

    await user.type(screen.getByLabelText("Nombre completo"), "Juan");
    await user.type(screen.getByLabelText("WhatsApp"), "+54 11 1234-5678");
    await user.type(screen.getByLabelText("Email"), "juan@test.com");
    await user.type(screen.getByLabelText("¿Qué te gustaría automatizar?"), "Todo");
    await user.click(screen.getByRole("button", { name: "Quiero mi consulta gratis" }));

    await waitFor(() => {
      expect(screen.getByText("Enviando...")).toBeInTheDocument();
    });

    vi.useRealTimers();
  });

  it("should render benefit checkmarks", () => {
    render(<ContactForm />);

    expect(screen.getByText("Consulta 100% gratuita")).toBeInTheDocument();
    expect(screen.getByText("Sin compromiso de contratación")).toBeInTheDocument();
  });
});
