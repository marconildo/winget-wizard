import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useQuickSetup } from "@/hooks/useQuickSetup";

describe("useQuickSetup - scriptPrompt", () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState({}, "", "/");
  });

  it("returns empty string when no apps are selected", () => {
    const { result } = renderHook(() => useQuickSetup());
    expect(result.current.selectedApps.length).toBe(0);
    expect(result.current.scriptPrompt).toBe("");
  });

  it("generates structured markdown prompt for Windows/Winget when apps are selected", () => {
    const { result } = renderHook(() => useQuickSetup());

    act(() => {
      result.current.setPlatform("windows");
      result.current.toggleApp("Google.Chrome");
      result.current.toggleApp("Git.Git");
    });

    expect(result.current.selectedApps.length).toBe(2);
    const prompt = result.current.scriptPrompt;

    expect(prompt).toContain("# 🤖 Prompt de Instalação de Aplicativos para Agente de IA");
    expect(prompt).toContain("Atue como um Especialista em Automação e Suporte de TI");
    expect(prompt).toContain("### 💻 Ambiente Alvo");
    expect(prompt).toContain("**Sistema Operacional**: Windows");
    expect(prompt).toContain("**Gerenciador de Pacotes**: Winget (Windows Package Manager)");
    expect(prompt).toContain("**Total de Aplicativos**: 2");
    expect(prompt).toContain("Google Chrome");
    expect(prompt).toContain("Git");
    expect(prompt).toContain("```powershell");
    expect(prompt).toContain("winget install --id Google.Chrome");
    expect(prompt).toContain("### 📋 Instruções de Execução para o Agente:");
    expect(prompt).toContain("1. **Verificação Prévia**");
    expect(prompt).toContain("2. **Execução Não-Interativa**");
    expect(prompt).toContain("3. **Resiliência**");
    expect(prompt).toContain("4. **Relatório Final**");
  });

  it("generates structured markdown prompt for macOS/Homebrew", () => {
    const { result } = renderHook(() => useQuickSetup());

    act(() => {
      result.current.setPlatform("macos");
      result.current.toggleApp("Google.Chrome");
    });

    const prompt = result.current.scriptPrompt;
    expect(prompt).toContain("**Sistema Operacional**: macOS");
    expect(prompt).toContain("**Gerenciador de Pacotes**: Homebrew");
    expect(prompt).toContain("```bash");
    expect(prompt).toContain("brew install");
  });

  it("generates structured markdown prompt for Linux with distro details", () => {
    const { result } = renderHook(() => useQuickSetup());

    act(() => {
      result.current.setPlatform("linux");
      result.current.setLinuxDistro("pacman");
      result.current.toggleApp("Git.Git");
    });

    const prompt = result.current.scriptPrompt;
    expect(prompt).toContain("**Sistema Operacional**: Linux (pacman)");
    expect(prompt).toContain("**Gerenciador de Pacotes**: Pacman (Arch Linux)");
    expect(prompt).toContain("pacman -S");
  });
});
