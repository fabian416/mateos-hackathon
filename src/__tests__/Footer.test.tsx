import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "@/components/Footer";

describe("Footer", () => {
  it("should render the MateOS brand name", () => {
    render(<Footer />);

    expect(screen.getByText("MateOS")).toBeInTheDocument();
  });

  it("should render the tagline", () => {
    render(<Footer />);

    expect(screen.getByText("Agentes de IA para empresas argentinas.")).toBeInTheDocument();
  });

  it("should render product links", () => {
    render(<Footer />);

    expect(screen.getByText("Agentes")).toBeInTheDocument();
    expect(screen.getByText("Proceso")).toBeInTheDocument();
    expect(screen.getByText("Precios")).toBeInTheDocument();
    expect(screen.getByText("FAQ")).toBeInTheDocument();
  });

  it("should render the contact email", () => {
    render(<Footer />);

    const emailLink = screen.getByText("contacto@mateos.ar");
    expect(emailLink).toBeInTheDocument();
    expect(emailLink.closest("a")).toHaveAttribute("href", "mailto:contacto@mateos.ar");
  });

  it("should render the location", () => {
    render(<Footer />);

    expect(screen.getByText("Buenos Aires, Argentina")).toBeInTheDocument();
  });

  it("should render copyright text", () => {
    render(<Footer />);

    expect(screen.getByText("2026 MateOS. Todos los derechos reservados.")).toBeInTheDocument();
  });

  it("should show coming soon badges", () => {
    render(<Footer />);

    const badges = screen.getAllByText("próximamente");
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });
});
