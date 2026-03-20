import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ErrorBoundary from "@/components/ErrorBoundary";

function BrokenComponent(): JSX.Element {
  throw new Error("Test error");
}

function WorkingComponent() {
  return <div>Everything is fine</div>;
}

describe("ErrorBoundary", () => {
  // Suppress console.error during intentional error tests
  const originalError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });
  afterEach(() => {
    console.error = originalError;
  });

  it("should render children when no error", () => {
    render(
      <ErrorBoundary>
        <WorkingComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Everything is fine")).toBeInTheDocument();
  });

  it("should render fallback UI when child throws", () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Algo salió mal")).toBeInTheDocument();
    expect(
      screen.getByText("Ocurrió un error inesperado. Recargá la página para volver a intentar."),
    ).toBeInTheDocument();
  });

  it("should render a reload button", () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByRole("button", { name: "Recargar página" })).toBeInTheDocument();
  });

  it("should render custom fallback when provided", () => {
    render(
      <ErrorBoundary fallback={<div>Custom error page</div>}>
        <BrokenComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Custom error page")).toBeInTheDocument();
  });

  it("should call console.error with error details", () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>,
    );

    expect(console.error).toHaveBeenCalled();
  });

  it("should call window.location.reload when clicking reload button", async () => {
    const user = userEvent.setup();

    const reloadMock = vi.fn();
    Object.defineProperty(window, "location", {
      value: { ...window.location, reload: reloadMock },
      writable: true,
    });

    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>,
    );

    await user.click(screen.getByRole("button", { name: "Recargar página" }));
    expect(reloadMock).toHaveBeenCalled();
  });
});
