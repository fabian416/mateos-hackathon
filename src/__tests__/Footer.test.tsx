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

    expect(screen.getByText("A self-sustaining network of AI-operated businesses.")).toBeInTheDocument();
  });

  it("should render product links", () => {
    render(<Footer />);

    expect(screen.getByText("Network")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Explore")).toBeInTheDocument();
    expect(screen.getByText("Deploy")).toBeInTheDocument();
  });

  it("should render the contact email", () => {
    render(<Footer />);

    const emailLink = screen.getByText("contacto@mateos.tech");
    expect(emailLink).toBeInTheDocument();
    expect(emailLink.closest("a")).toHaveAttribute("href", "mailto:contacto@mateos.tech");
  });

  it("should render the location", () => {
    render(<Footer />);

    expect(screen.getByText("Buenos Aires, Argentina")).toBeInTheDocument();
  });

  it("should render copyright text", () => {
    render(<Footer />);

    expect(screen.getByText("2026 MateOS. Built by 2 humans and 1 AI.")).toBeInTheDocument();
  });

  it("should show hackathon badges", () => {
    render(<Footer />);

    expect(screen.getByText("Synthesis 2026")).toBeInTheDocument();
    expect(screen.getByText("Base Mainnet")).toBeInTheDocument();
    expect(screen.getByText("ERC-8004")).toBeInTheDocument();
  });
});
