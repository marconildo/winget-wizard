import { useState } from "react";
import {
  Sparkles,
  Bot,
  Terminal,
  Compass,
  Code,
  Search,
  Check,
  Copy,
  Download,
  Eye,
  EyeOff,
  Key,
  ExternalLink,
  Github,
  Database,
  Palette,
  CreditCard,
  Layers,
  Folder,
  Box,
  Globe,
  GitBranch,
  CheckSquare,
  XSquare,
  FileCode,
  TerminalSquare,
  ShieldCheck,
  Zap,
  Info,
  Cloud,
  Activity,
  Bug,
  Brain,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  mcpPresets,
  mcpCategoryLabels,
  clientProfiles,
  type McpCategory,
  type McpClientProfile,
  type McpServerDef,
} from "@/data/mcp-catalog";
import { useMcpSetup } from "@/hooks/useMcpSetup";

const serverIconMap: Record<string, React.ReactNode> = {
  Github: <Github className="h-5 w-5" />,
  Database: <Database className="h-5 w-5" />,
  Palette: <Palette className="h-5 w-5" />,
  CreditCard: <CreditCard className="h-5 w-5" />,
  Layers: <Layers className="h-5 w-5" />,
  Folder: <Folder className="h-5 w-5" />,
  Search: <Search className="h-5 w-5" />,
  Box: <Box className="h-5 w-5" />,
  Globe: <Globe className="h-5 w-5" />,
  GitBranch: <GitBranch className="h-5 w-5" />,
  Cloud: <Cloud className="h-5 w-5" />,
  Activity: <Activity className="h-5 w-5" />,
  Bug: <Bug className="h-5 w-5" />,
  Brain: <Brain className="h-5 w-5" />,
  MessageSquare: <MessageSquare className="h-5 w-5" />,
  CheckSquare: <CheckSquare className="h-5 w-5" />,
  Zap: <Zap className="h-5 w-5" />,
};

const clientIconMap: Record<McpClientProfile, React.ReactNode> = {
  gemini: <Sparkles className="h-4 w-4 text-purple-400" />,
  claude: <Bot className="h-4 w-4 text-amber-400" />,
  cursor: <Terminal className="h-4 w-4 text-cyan-400" />,
  windsurf: <Compass className="h-4 w-4 text-emerald-400" />,
  cline: <Code className="h-4 w-4 text-blue-400" />,
};

export function McpTab() {
  const mcp = useMcpSetup();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [previewTab, setPreviewTab] = useState<"json" | "powershell" | "bash" | "prompt">("json");
  const [expandedConfigs, setExpandedConfigs] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedConfigs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyCode = async () => {
    const textToCopy =
      previewTab === "json"
        ? mcp.configJson
        : previewTab === "powershell"
        ? mcp.generatePowerShellScript()
        : previewTab === "bash"
        ? mcp.generateBashScript()
        : mcp.generateAiPrompt();

    await navigator.clipboard.writeText(textToCopy);
    setCopiedCode(true);
    toast.success(
      previewTab === "json"
        ? `Configuração (${mcp.activeProfile.configFileName}) copiada!`
        : previewTab === "prompt"
        ? "Prompt para IA copiado!"
        : `Script de instalação (${previewTab}) copiado!`
    );
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyPath = async () => {
    await navigator.clipboard.writeText(mcp.activeProfile.defaultPaths.windows);
    setCopiedScript(true);
    toast.success("Caminho de configuração copiado!");
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950/70 via-indigo-950/60 to-purple-950/70 border border-blue-500/20 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                <Sparkles className="h-3 w-3" /> Model Context Protocol
              </span>
              <span className="text-xs text-muted-foreground hidden sm:inline">
                Padrão aberto de extensibilidade para IA
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              MCP Hub — Setup de Servidores de IA
            </h1>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Escolha e configure servidores MCP oficiais (GitHub, Supabase, Figma, Mercado Pago e utilitários).
              Gere arquivos de configuração prontos para seu agente de IA preferido.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center shrink-0">
            <Badge variant="outline" className="bg-white/5 border-white/10 text-slate-300 px-3 py-1.5 text-xs">
              <ShieldCheck className="h-3.5 w-3.5 mr-1.5 text-emerald-400" />
              {mcp.selectedServers.length} de {mcp.filteredServers.length} ativos
            </Badge>
          </div>
        </div>

        {/* Client Profile Selector */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <p className="text-xs font-medium text-slate-400 mb-2.5 uppercase tracking-wider">
            Selecione o Cliente / IDE de Destino:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {(Object.keys(clientProfiles) as McpClientProfile[]).map((clientId) => {
              const profile = clientProfiles[clientId];
              const isSelected = mcp.targetClient === clientId;
              return (
                <button
                  key={clientId}
                  onClick={() => mcp.setTargetClient(clientId)}
                  className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all duration-200 ${
                    isSelected
                      ? "bg-blue-500/20 border-blue-400/60 shadow-lg shadow-blue-500/10 text-white"
                      : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="flex items-center gap-1.5 font-semibold text-xs truncate">
                      {clientIconMap[clientId]} {profile.name}
                    </span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-blue-400 shrink-0" />}
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono truncate w-full">
                    {profile.configFileName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Presets Row */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <Zap className="h-3.5 w-3.5 text-amber-400" /> Presets Rápidos
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {mcpPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => {
                mcp.applyPreset(preset.id);
                toast.success(`Preset "${preset.name}" aplicado!`);
              }}
              className="flex items-start gap-3 p-3 rounded-xl border border-border/70 bg-card hover:bg-accent/40 hover:border-primary/40 transition-all text-left group"
            >
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                {serverIconMap[preset.icon] || <Sparkles className="h-4 w-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                  {preset.name}
                </div>
                <div className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                  {preset.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar servidores MCP (ex: github, supabase, figma)..."
            value={mcp.search}
            onChange={(e) => mcp.setSearch(e.target.value)}
            className="pl-9 bg-card"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <Button
            variant="outline"
            size="sm"
            onClick={mcp.selectAll}
            className="text-xs h-9 gap-1.5"
          >
            <CheckSquare className="h-3.5 w-3.5" /> Selecionar Todos
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={mcp.clearSelection}
            className="text-xs h-9 gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <XSquare className="h-3.5 w-3.5" /> Limpar
          </Button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => mcp.setActiveCategory("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
            mcp.activeCategory === "all"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted/60 hover:bg-muted text-muted-foreground"
          }`}
        >
          Todas as Categorias
        </button>
        {(Object.keys(mcpCategoryLabels) as McpCategory[]).map((cat) => (
          <button
            key={cat}
            onClick={() => mcp.setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
              mcp.activeCategory === cat
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/60 hover:bg-muted text-muted-foreground"
            }`}
          >
            {mcpCategoryLabels[cat]}
          </button>
        ))}
      </div>

      {/* Main Grid: Server Cards (Left) + Config Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Server Cards */}
        <div className="lg:col-span-7 space-y-3.5">
          {mcp.filteredServers.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-dashed border-border bg-card">
              <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium text-foreground">Nenhum servidor MCP encontrado</p>
              <p className="text-xs text-muted-foreground mt-1">Tente ajustar seus filtros de busca.</p>
            </div>
          ) : (
            mcp.filteredServers.map((server: McpServerDef) => {
              const isSelected = mcp.selectedIds.has(server.id);
              const isExpanded = expandedConfigs[server.id];
              const hasEnv = Boolean(server.envVars && server.envVars.length > 0);

              return (
                <div
                  key={server.id}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isSelected
                      ? "bg-card border-palette-cyan/60 shadow-md shadow-palette-cyan/5 ring-1 ring-palette-aqua/30"
                      : "bg-card/70 border-border/70 hover:border-border hover:bg-card"
                  }`}
                >
                  <div className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div
                          onClick={() => mcp.toggleServer(server.id)}
                          className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 cursor-pointer transition-all ${
                            isSelected
                              ? "bg-palette-cyan text-white shadow-md shadow-palette-cyan/30 scale-105"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          {serverIconMap[server.icon] || <Sparkles className="h-5 w-5" />}
                        </div>

                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              onClick={() => mcp.toggleServer(server.id)}
                              className="font-bold text-sm sm:text-base text-foreground cursor-pointer hover:text-primary transition-colors"
                            >
                              {server.name}
                            </span>
                            <Badge
                              variant="secondary"
                              className={`text-[10px] px-1.5 py-0 uppercase tracking-wide font-mono ${
                                server.transport === "sse"
                                  ? "bg-palette-orange/15 text-palette-orange border border-palette-orange/30 font-bold"
                                  : "bg-palette-cyan/15 text-palette-cyan border border-palette-cyan/30"
                              }`}
                            >
                              {server.transport.toUpperCase()}
                            </Badge>
                            <span className="text-[11px] text-muted-foreground font-medium">
                              por {server.vendor}
                            </span>
                          </div>

                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {server.description}
                          </p>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-1 pt-1">
                            {server.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-[10px] px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground font-mono"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right Action: Select / Configure */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <button
                          onClick={() => mcp.toggleServer(server.id)}
                          className={`h-7 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                            isSelected
                              ? "bg-palette-cyan hover:bg-palette-aqua text-white shadow-sm"
                              : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <Check className="h-3.5 w-3.5" /> Ativo
                            </>
                          ) : (
                            "+ Adicionar"
                          )}
                        </button>

                        {hasEnv && (
                          <button
                            onClick={() => toggleExpand(server.id)}
                            className="text-[11px] text-palette-cyan hover:underline flex items-center gap-1 font-medium"
                          >
                            <Key className="h-3 w-3" />
                            {isExpanded ? "Ocultar Chaves" : "Configurar Chaves"}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expandable Key/Token configuration */}
                    {hasEnv && isExpanded && (
                      <div className="mt-4 pt-4 border-t border-border/60 bg-muted/20 -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 p-4 sm:p-5 space-y-3">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                          <Key className="h-3.5 w-3.5 text-amber-400" /> Variáveis de Ambiente & Credenciais:
                        </div>
                        {server.envVars?.map((ev) => {
                          const currentVal = mcp.envValues[server.id]?.[ev.key] ?? "";
                          return (
                            <div key={ev.key} className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <label className="font-medium text-foreground">
                                  {ev.label} {ev.required && <span className="text-destructive">*</span>}
                                </label>
                                <span className="text-[10px] text-muted-foreground font-mono">{ev.key}</span>
                              </div>
                              <p className="text-[11px] text-muted-foreground">{ev.description}</p>
                              <Input
                                type={ev.isSecret ? "password" : "text"}
                                placeholder={ev.placeholder}
                                value={currentVal}
                                onChange={(e) => mcp.setEnvValue(server.id, ev.key, e.target.value)}
                                className="text-xs h-9 bg-background font-mono"
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Live Configuration Preview */}
        <div className="lg:col-span-5 sticky top-6 space-y-4">
          <div className="rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
            {/* Header of Preview */}
            <div className="p-4 border-b border-border bg-muted/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {clientIconMap[mcp.targetClient]}
                  <span className="font-bold text-sm text-foreground">
                    {mcp.activeProfile.configFileName}
                  </span>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono">
                  {mcp.selectedServers.length} servidores
                </Badge>
              </div>

              {/* Path Information */}
              <div
                onClick={handleCopyPath}
                className="flex items-center justify-between gap-2 p-2 rounded-lg bg-background/80 border border-border/60 text-[11px] font-mono text-muted-foreground cursor-pointer hover:text-foreground transition-colors group"
                title="Clique para copiar caminho"
              >
                <div className="truncate flex items-center gap-1.5">
                  <Folder className="h-3 w-3 text-palette-cyan shrink-0" />
                  <span className="truncate">{mcp.activeProfile.defaultPaths.windows}</span>
                </div>
                <Copy className="h-3 w-3 shrink-0 opacity-60 group-hover:opacity-100" />
              </div>

              {/* Sub-tabs: JSON vs Scripts */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex gap-1">
                  <button
                    onClick={() => setPreviewTab("json")}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                      previewTab === "json"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <FileCode className="h-3 w-3 inline mr-1" /> JSON
                  </button>
                  <button
                    onClick={() => setPreviewTab("powershell")}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                      previewTab === "powershell"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <TerminalSquare className="h-3 w-3 inline mr-1" /> PowerShell (.ps1)
                  </button>
                  <button
                    onClick={() => setPreviewTab("bash")}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                      previewTab === "bash"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Terminal className="h-3 w-3 inline mr-1" /> Bash (.sh)
                  </button>
                  <button
                    onClick={() => setPreviewTab("prompt")}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                      previewTab === "prompt"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Sparkles className="h-3 w-3 inline mr-1" /> Prompt
                  </button>
                </div>

                {(previewTab === "json" || previewTab === "prompt") && (
                  <button
                    onClick={() => mcp.setMaskSecrets(!mcp.maskSecrets)}
                    className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 font-medium transition-colors"
                    title="Alternar visualização de tokens"
                  >
                    {mcp.maskSecrets ? (
                      <>
                        <Eye className="h-3 w-3" /> Ver Tokens
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3 w-3" /> Ocultar
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Code Body */}
            <div className="relative p-4 bg-palette-obsidian font-mono text-xs text-palette-aqua/90 overflow-x-auto max-h-[460px] scrollbar-thin border-t border-palette-mahogany/80">
              <pre className="leading-relaxed whitespace-pre-wrap selection:bg-palette-aqua/20 selection:text-palette-aqua">
                {previewTab === "json"
                  ? mcp.configJson
                  : previewTab === "powershell"
                  ? mcp.generatePowerShellScript()
                  : previewTab === "bash"
                  ? mcp.generateBashScript()
                  : mcp.generateAiPrompt()}
              </pre>
            </div>

            {/* Actions Bar */}
            <div className="p-4 border-t border-border bg-muted/20 flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handleCopyCode}
                variant={previewTab === "prompt" ? "solar" : "cyan"}
                className="flex-1 gap-2 font-semibold"
              >
                {copiedCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copiedCode
                  ? "Copiado!"
                  : previewTab === "json"
                  ? "Copiar JSON"
                  : previewTab === "prompt"
                  ? "Copiar Prompt para IA"
                  : "Copiar Script"}
              </Button>
              {previewTab === "json" && (
                <Button
                  variant="outline"
                  onClick={mcp.downloadConfigFile}
                  className="gap-2 font-semibold"
                >
                  <Download className="h-4 w-4" /> Baixar .json
                </Button>
              )}
            </div>
          </div>

          {/* Quick instructions card */}
          <div className="p-4 rounded-xl border border-border/80 bg-card/60 text-xs space-y-2 text-muted-foreground">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <Info className="h-3.5 w-3.5 text-palette-cyan" /> Como aplicar no {mcp.activeProfile.name}:
            </div>
            <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed">
              <li>Copie o código JSON ou clique em <strong>Baixar .json</strong>.</li>
              <li>Cole no arquivo localizado em: <code className="font-mono text-foreground">{mcp.activeProfile.defaultPaths.windows}</code>.</li>
              <li>Ou copie o <strong>Script PowerShell</strong> e execute no terminal para injeção automática de 1-clique.</li>
              <li>Reinicie o seu cliente de IA para ativar os novos servidores MCP!</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
