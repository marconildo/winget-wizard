import { useState, useRef } from "react";
import { Copy, Download, Check, Terminal, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { PackageManager } from "@/data/apps";

interface Props {
  script: string;
  scriptBat: string;
  scriptPs1: string;
  scriptSh: string;
  scriptNix: string;
  scriptPrompt?: string;
  packageManager: PackageManager;
  count: number;
  onAfterAction?: () => void;
}

export function ScriptPreview({ script, scriptBat, scriptPs1, scriptSh, scriptNix, scriptPrompt, packageManager, count, onAfterAction }: Props) {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"script" | "prompt">("script");
  const preRef = useRef<HTMLPreElement>(null);
  const isWindows = packageManager === "winget";
  const isNix = packageManager === "nix";
  const terminalFile = isWindows ? "quicksetup.ps1" : isNix ? "shell.nix" : "quicksetup.sh";

  const copy = async () => {
    const textToCopy = viewMode === "prompt" ? (scriptPrompt || "") : (isNix ? scriptNix : script);
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success(viewMode === "prompt" ? "Prompt para IA copiado!" : "Script copiado!");
    setTimeout(() => setCopied(false), 2000);
    onAfterAction?.();
  };

  const copyPromptDirectly = async () => {
    if (!scriptPrompt) return;
    await navigator.clipboard.writeText(scriptPrompt);
    setCopied(true);
    toast.success("Prompt para IA copiado!");
    setTimeout(() => setCopied(false), 2000);
    onAfterAction?.();
  };

  const download = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${filename} baixado!`);
    onAfterAction?.();
  };

  if (!script) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center px-4">
        <div className="h-14 w-14 rounded-2xl bg-gray-800 border border-gray-700 flex items-center justify-center mb-4 shadow-inner">
          <Terminal className="h-6 w-6 text-gray-500" />
        </div>
        <p className="text-sm font-medium text-gray-400 leading-relaxed">
          Selecione aplicativos para<br />gerar seu script
        </p>
        <p className="text-xs text-gray-600 mt-2">O script aparecerá aqui</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Terminal header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-green-400" />
          <span className="text-sm font-semibold text-gray-200">Script gerado</span>
          <span className="text-xs bg-gray-700 text-green-400 font-mono px-2 py-0.5 rounded-full border border-gray-600">
            {count} {count === 1 ? "app" : "apps"}
          </span>
        </div>

        {/* View mode toggle (Script vs Prompt IA) */}
        <div className="flex items-center gap-1.5">
          <div className="flex rounded-lg bg-gray-800 p-0.5 border border-gray-700">
            <button
              onClick={() => setViewMode("script")}
              className={cn(
                "px-2 py-1 text-xs font-semibold rounded-md transition-all",
                viewMode === "script"
                  ? "bg-gray-700 text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-200"
              )}
            >
              Script
            </button>
            <button
              onClick={() => setViewMode("prompt")}
              className={cn(
                "px-2 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1",
                viewMode === "prompt"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-200"
              )}
            >
              <Sparkles className="h-3 w-3" /> Prompt IA
            </button>
          </div>

          <button
            onClick={copy}
            className={cn(
              "flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md font-medium transition-all duration-200",
              copied
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600 hover:text-white"
            )}
            title={viewMode === "prompt" ? "Copiar prompt para IA" : "Copiar script"}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copiado!" : viewMode === "prompt" ? "Copiar Prompt" : "Copiar"}
          </button>
        </div>
      </div>

      {/* Terminal window */}
      <div className="relative rounded-xl overflow-hidden border border-gray-700 shadow-xl">
        {/* Window chrome */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-500/80" />
            <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
            <span className="h-3 w-3 rounded-full bg-green-500/80" />
            <span className="ml-2 text-xs text-gray-400 font-mono">
              {viewMode === "prompt" ? "prompt-instalacao.md" : terminalFile}
            </span>
          </div>
          {viewMode === "prompt" && (
            <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-md font-mono border border-blue-500/30">
              Instruções para Agente
            </span>
          )}
        </div>
        <pre
          ref={preRef}
          className={cn(
            "bg-gray-900 text-xs p-5 overflow-auto max-h-72 scrollbar-thin font-mono leading-relaxed whitespace-pre-wrap",
            viewMode === "prompt" ? "text-slate-200" : "text-green-400"
          )}
        >
          {viewMode === "prompt" ? (scriptPrompt || "Nenhum prompt disponível.") : isNix ? scriptNix : script}
        </pre>
      </div>

      {/* Actions */}
      {viewMode === "script" ? (
        <>
          {isWindows ? (
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => download(scriptBat, "quicksetup.bat")}
                variant="outline"
                size="sm"
                className="text-xs gap-1.5 border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-600"
              >
                <Download className="h-3.5 w-3.5" />
                Baixar .bat
              </Button>
              <Button
                onClick={() => download(scriptPs1, "quicksetup.ps1")}
                variant="outline"
                size="sm"
                className="text-xs gap-1.5 border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-600"
              >
                <Download className="h-3.5 w-3.5" />
                Baixar .ps1
              </Button>
            </div>
          ) : isNix ? (
            <Button
              onClick={() => download(scriptNix, "shell.nix")}
              variant="outline"
              size="sm"
              className="w-full text-xs gap-1.5 border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-600"
            >
              <Download className="h-3.5 w-3.5" />
              Baixar shell.nix
            </Button>
          ) : (
            <Button
              onClick={() => download(scriptSh, "quicksetup.sh")}
              variant="outline"
              size="sm"
              className="w-full text-xs gap-1.5 border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-600"
            >
              <Download className="h-3.5 w-3.5" />
              Baixar .sh
            </Button>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button
              onClick={copyPromptDirectly}
              variant="outline"
              size="sm"
              className="text-xs font-semibold gap-1.5 border-blue-500/40 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 hover:text-blue-200 hover:border-blue-500/60"
            >
              <Sparkles className="h-3.5 w-3.5 text-blue-400" />
              Prompt IA
            </Button>
            <Button
              onClick={copy}
              size="sm"
              className={cn(
                "text-xs font-semibold gap-2 transition-all duration-200",
                copied
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-900/40"
              )}
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copiado!" : isNix ? "Copiar shell.nix" : "Copiar Script"}
            </Button>
          </div>
        </>
      ) : (
        <div className="space-y-2">
          <Button
            onClick={copyPromptDirectly}
            size="sm"
            className={cn(
              "w-full text-sm font-semibold gap-2 transition-all duration-200",
              copied
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-900/40"
            )}
          >
            {copied ? <Check className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
            {copied ? "Prompt Copiado!" : "Copiar Prompt para IA"}
          </Button>
          <Button
            onClick={() => download(scriptPrompt || "", "prompt-instalacao.md")}
            variant="outline"
            size="sm"
            className="w-full text-xs gap-1.5 border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            <Download className="h-3.5 w-3.5" />
            Baixar Prompt (.md)
          </Button>
        </div>
      )}
    </div>
  );
}
