/**
 * Lightweight event bus for page-to-page zoom transitions.
 * Dashboard and Network pages listen; TopNav dispatches.
 */
export const transitionEvents = new EventTarget();

/** Fired when navigating away from dashboard (zoom-out) */
export const EXIT_DASHBOARD = "exit-dashboard";

/** Fired when navigating away from network toward dashboard (zoom-into-default) */
export const EXIT_NETWORK = "exit-network";
