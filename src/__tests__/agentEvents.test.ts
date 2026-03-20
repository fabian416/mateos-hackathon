import { describe, it, expect, vi } from "vitest";
import { subscribe, fireEvent, AGENT_NAMES, AGENT_COLORS } from "@/lib/agentEvents";
import type { AgentEvent } from "@/lib/agentEvents";

describe("agentEvents", () => {
  describe("subscribe", () => {
    it("should register a listener and call it on fireEvent", () => {
      const listener = vi.fn();
      const unsub = subscribe(listener);

      fireEvent();

      expect(listener).toHaveBeenCalledTimes(1);
      const event = listener.mock.calls[0][0] as AgentEvent;
      expect(event).toHaveProperty("id");
      expect(event).toHaveProperty("from");
      expect(event).toHaveProperty("to");
      expect(event).toHaveProperty("action");
      expect(event).toHaveProperty("type");
      expect(event).toHaveProperty("timestamp");

      unsub();
    });

    it("should return an unsubscribe function that stops events", () => {
      const listener = vi.fn();
      const unsub = subscribe(listener);

      fireEvent();
      expect(listener).toHaveBeenCalledTimes(1);

      unsub();
      fireEvent();
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it("should support multiple listeners", () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      const unsub1 = subscribe(listener1);
      const unsub2 = subscribe(listener2);

      fireEvent();

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);

      unsub1();
      unsub2();
    });
  });

  describe("fireEvent", () => {
    it("should return a valid AgentEvent", () => {
      const event = fireEvent();

      expect(event.id).toBeGreaterThan(0);
      expect(["route", "update", "alert"]).toContain(event.type);
      expect(event.timestamp).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    });

    it("should increment event id on each call", () => {
      const event1 = fireEvent();
      const event2 = fireEvent();

      expect(event2.id).toBeGreaterThan(event1.id);
    });

    it("should use valid agent names from templates", () => {
      const validAgents = Object.keys(AGENT_NAMES);
      const event = fireEvent();

      expect(validAgents).toContain(event.from);
      expect(validAgents).toContain(event.to);
    });
  });

  describe("AGENT_NAMES", () => {
    it("should have 7 agents defined", () => {
      expect(Object.keys(AGENT_NAMES)).toHaveLength(7);
    });

    it("should include all expected agent types", () => {
      expect(AGENT_NAMES).toHaveProperty("baqueano");
      expect(AGENT_NAMES).toHaveProperty("tropero");
      expect(AGENT_NAMES).toHaveProperty("domador");
      expect(AGENT_NAMES).toHaveProperty("rastreador");
      expect(AGENT_NAMES).toHaveProperty("paisano");
      expect(AGENT_NAMES).toHaveProperty("relator");
      expect(AGENT_NAMES).toHaveProperty("ceo");
    });
  });

  describe("AGENT_COLORS", () => {
    it("should have a color for every agent", () => {
      const agentKeys = Object.keys(AGENT_NAMES);
      agentKeys.forEach((key) => {
        expect(AGENT_COLORS).toHaveProperty(key);
        expect(AGENT_COLORS[key]).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });
  });
});
