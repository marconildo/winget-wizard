import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { mcpServers, mcpPresets, clientProfiles } from "@/data/mcp-catalog";
import { useMcpSetup } from "@/hooks/useMcpSetup";

describe("MCP Catalog", () => {
  it("should contain the requested core MCP servers", () => {
    const serverIds = mcpServers.map((s) => s.id);
    expect(serverIds).toContain("github-mcp-server");
    expect(serverIds).toContain("supabase-mcp-server");
    expect(serverIds).toContain("figma-mcp-server");
    expect(serverIds).toContain("mercadopago-mcp-server");
  });

  it("should have valid client profiles for Gemini, Claude, Cursor, Windsurf and Cline", () => {
    expect(clientProfiles.gemini.configFileName).toBe("mcp_config.json");
    expect(clientProfiles.claude.configFileName).toBe("claude_desktop_config.json");
    expect(clientProfiles.cursor.configFileName).toBe("mcp.json");
    expect(clientProfiles.windsurf.configFileName).toBe("mcp_config.json");
    expect(clientProfiles.cline.configFileName).toBe("cline_mcp_settings.json");
  });

  it("should include defined presets with valid server IDs", () => {
    expect(mcpPresets.length).toBeGreaterThan(0);
    for (const preset of mcpPresets) {
      expect(preset.serverIds.length).toBeGreaterThan(0);
      for (const id of preset.serverIds) {
        expect(mcpServers.some((s) => s.id === id)).toBe(true);
      }
    }
  });
});

describe("useMcpSetup Hook", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("initializes with core servers selected", () => {
    const { result } = renderHook(() => useMcpSetup());
    expect(result.current.selectedIds.has("github-mcp-server")).toBe(true);
    expect(result.current.selectedIds.has("supabase-mcp-server")).toBe(true);
    expect(result.current.selectedIds.has("figma-mcp-server")).toBe(true);
    expect(result.current.selectedIds.has("mercadopago-mcp-server")).toBe(true);
  });

  it("toggles server selection correctly", () => {
    const { result } = renderHook(() => useMcpSetup());
    
    act(() => {
      result.current.toggleServer("figma-mcp-server");
    });
    expect(result.current.selectedIds.has("figma-mcp-server")).toBe(false);

    act(() => {
      result.current.toggleServer("figma-mcp-server");
    });
    expect(result.current.selectedIds.has("figma-mcp-server")).toBe(true);
  });

  it("generates valid JSON config with mcpServers key", () => {
    const { result } = renderHook(() => useMcpSetup());
    const parsed = JSON.parse(result.current.configJson);
    expect(parsed).toHaveProperty("mcpServers");
    expect(parsed.mcpServers).toHaveProperty("mercadopago-mcp-server");
    expect(parsed.mcpServers["mercadopago-mcp-server"].url).toBe("https://mcp.mercadopago.com/mcp");
  });

  it("masks secrets by default and reveals them when unmasked", () => {
    const { result } = renderHook(() => useMcpSetup());

    act(() => {
      result.current.setEnvValue("github-mcp-server", "GITHUB_PERSONAL_ACCESS_TOKEN", "ghp_1234567890abcdef1234567890abcdef");
    });

    const maskedJson = JSON.parse(result.current.configJson);
    const maskedToken = maskedJson.mcpServers["github-mcp-server"].env.GITHUB_PERSONAL_ACCESS_TOKEN;
    expect(maskedToken).not.toBe("ghp_1234567890abcdef1234567890abcdef");
    expect(maskedToken).toContain("...");

    act(() => {
      result.current.setMaskSecrets(false);
    });

    const unmaskedJson = JSON.parse(result.current.configJson);
    expect(unmaskedJson.mcpServers["github-mcp-server"].env.GITHUB_PERSONAL_ACCESS_TOKEN).toBe(
      "ghp_1234567890abcdef1234567890abcdef"
    );
  });

  it("applies presets correctly", () => {
    const { result } = renderHook(() => useMcpSetup());

    act(() => {
      result.current.applyPreset("design-to-code");
    });

    expect(result.current.selectedIds.has("figma-mcp-server")).toBe(true);
    expect(result.current.selectedIds.has("github-mcp-server")).toBe(true);
    expect(result.current.selectedIds.has("puppeteer-mcp-server")).toBe(true);
    expect(result.current.selectedIds.has("postgres-mcp-server")).toBe(false);
  });

  it("generates PowerShell and Bash scripts with target paths", () => {
    const { result } = renderHook(() => useMcpSetup());

    const ps1 = result.current.generatePowerShellScript();
    expect(ps1).toContain("mcp_config.json");
    expect(ps1).toContain("Set-Content");

    const bash = result.current.generateBashScript();
    expect(bash).toContain("mcp_config.json");
    expect(bash).toContain("#!/usr/bin/env bash");
  });

  it("adapts configuration when target client is changed to Cline", () => {
    const { result } = renderHook(() => useMcpSetup());

    act(() => {
      result.current.setTargetClient("cline");
    });

    const parsed = JSON.parse(result.current.configJson);
    expect(parsed.mcpServers["github-mcp-server"]).toHaveProperty("disabled", false);
    expect(parsed.mcpServers["github-mcp-server"]).toHaveProperty("autoApprove");
  });
});
