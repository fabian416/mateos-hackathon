import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FAQ from "@/components/FAQ";

describe("FAQ", () => {
  it("should render the section title", () => {
    render(<FAQ />);

    expect(screen.getByText("Preguntas que siempre nos hacen")).toBeInTheDocument();
  });

  it("should render all FAQ questions", () => {
    render(<FAQ />);

    expect(
      screen.getByText("¿Es esto un chatbot como los que hay en las páginas web?"),
    ).toBeInTheDocument();
    expect(screen.getByText("¿Mis datos están seguros?")).toBeInTheDocument();
    expect(screen.getByText("¿Quién está detrás de MateOS?")).toBeInTheDocument();
    expect(screen.getByText("¿Puedo cancelar en cualquier momento?")).toBeInTheDocument();
    expect(screen.getByText("¿Necesito saber de tecnología?")).toBeInTheDocument();
    expect(screen.getByText("¿Cuánto tarda en estar funcionando?")).toBeInTheDocument();
    expect(screen.getByText("¿Se integra con mis herramientas actuales?")).toBeInTheDocument();
    expect(screen.getByText("¿Qué pasa si responde algo mal?")).toBeInTheDocument();
    expect(screen.getByText("¿Los $500.000/mes incluyen todo?")).toBeInTheDocument();
  });

  it("should have all answers hidden initially", () => {
    render(<FAQ />);

    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => {
      expect(button).toHaveAttribute("aria-expanded", "false");
    });
  });

  it("should expand an answer when clicking a question", async () => {
    const user = userEvent.setup();
    render(<FAQ />);

    const firstQuestion = screen.getByText("¿Mis datos están seguros?");
    await user.click(firstQuestion);

    const button = firstQuestion.closest("button");
    expect(button).toHaveAttribute("aria-expanded", "true");
  });

  it("should collapse an answer when clicking the same question again", async () => {
    const user = userEvent.setup();
    render(<FAQ />);

    const question = screen.getByText("¿Mis datos están seguros?");
    await user.click(question);

    const button = question.closest("button");
    expect(button).toHaveAttribute("aria-expanded", "true");

    await user.click(question);
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("should only have one answer open at a time", async () => {
    const user = userEvent.setup();
    render(<FAQ />);

    const q1 = screen.getByText("¿Mis datos están seguros?");
    const q2 = screen.getByText("¿Puedo cancelar en cualquier momento?");

    await user.click(q1);
    expect(q1.closest("button")).toHaveAttribute("aria-expanded", "true");

    await user.click(q2);
    expect(q1.closest("button")).toHaveAttribute("aria-expanded", "false");
    expect(q2.closest("button")).toHaveAttribute("aria-expanded", "true");
  });
});
