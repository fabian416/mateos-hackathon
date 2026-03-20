"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[MateOS Error]", error, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#08080F",
            color: "#FAF8F5",
            fontFamily: "system-ui, sans-serif",
            padding: "2rem",
          }}
        >
          <div style={{ textAlign: "center", maxWidth: "480px" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
              <svg
                width="64"
                height="64"
                viewBox="0 0 220 220"
                fill="none"
                style={{ margin: "0 auto" }}
              >
                <defs>
                  <radialGradient id="errGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#7C5CFF" />
                    <stop offset="100%" stopColor="#00D1FF" />
                  </radialGradient>
                </defs>
                <circle
                  cx="110"
                  cy="110"
                  r="90"
                  stroke="url(#errGrad)"
                  strokeWidth="4"
                  opacity="0.6"
                />
                <circle cx="110" cy="110" r="35" fill="url(#errGrad)" />
              </svg>
            </div>
            <h1
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                marginBottom: "0.5rem",
              }}
            >
              Algo salió mal
            </h1>
            <p
              style={{
                color: "#9CA3AF",
                marginBottom: "1.5rem",
                lineHeight: 1.6,
              }}
            >
              Ocurrió un error inesperado. Recargá la página para volver a intentar.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "0.75rem 2rem",
                borderRadius: "0.75rem",
                border: "none",
                background: "linear-gradient(135deg, #8B2F1C 0%, #6E2416 100%)",
                color: "#FAF8F5",
                fontWeight: 700,
                fontSize: "1rem",
                cursor: "pointer",
              }}
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
