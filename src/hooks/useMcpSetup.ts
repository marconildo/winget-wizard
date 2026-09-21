import { useState, useMemo, useCallback, useEffect } from "react";
import {
  mcpServers,
  clientProfiles,
  mcpPresets,
  type McpServerDef,
  type McpClientProfile,
  type McpCategory,
} from "@/data/mcp-catalog";

const STORAGE_KEY = "quicksetup-mcp-state";

interface StoredMcpState {
  selectedIds: string[];
  targetClient: McpClientProfile;
  envValues: Record<string, Record<string, string>>;
}

export function useMcpSetup() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredMcpState;
        if (Array.isArray(parsed.selectedIds) && parsed.selectedIds.length > 0) {
          return new Set(parsed.selectedIds);
        }
      }
    } catch {
      // fallback
    }
    return new Set(["github-mcp-server", "supabase-mcp-server", "figma-mcp-server", "mercadopago-mcp-server"]);
  });

  const [targetClient, setTargetClient] = useState<McpClientProfile>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredMcpState;
        if (parsed.targetClient && clientProfiles[parsed.targetClient]) {
          return parsed.targetClient;
        }
      }
    } catch {
      // fallback
    }
    return "gemini";
  });

  const [envValues, setEnvValues] = useState<Record<string, Record<string, string>>>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredMcpState;
        if (parsed.envValues) return parsed.envValues;
      }
    } catch {
      // fallback
    }
    return {};
  });

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<McpCategory | "all">("all");
  const [maskSecrets, setMaskSecrets] = useState(true);

  // Sync to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const payload: StoredMcpState = {
          selectedIds: Array.from(selectedIds),
          targetClient,
          envValues,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch {
        // storage quota
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [selectedIds, targetClient, envValues]);

  const toggleServer = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(mcpServers.map((s) => s.id)));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const applyPreset = useCallback((presetId: string) => {
    const preset = mcpPresets.find((p) => p.id === presetId);
    if (!preset) return;
    setSelectedIds(new Set(preset.serverIds));
  }, []);

  const setEnvValue = useCallback((serverId: string, key: string, value: string) => {
    setEnvValues((prev) => ({
      ...prev,
      [serverId]: {
        ...(prev[serverId] || {}),
        [key]: value,
      },
    }));
  }, []);

  const filteredServers = useMemo(() => {
    const term = search.toLowerCase().trim();
    return mcpServers.filter((server) => {
      const matchCat = activeCategory === "all" || server.category === activeCategory;
      if (!matchCat) return false;
      if (!term) return true;
      const matchName = server.name.toLowerCase().includes(term);
      const matchDesc = server.description.toLowerCase().includes(term);
      const matchTags = server.tags.some((t) => t.toLowerCase().includes(term));
      const matchVendor = server.vendor.toLowerCase().includes(term);
      return matchName || matchDesc || matchTags || matchVendor;
    });
  }, [search, activeCategory]);

  const selectedServers = useMemo(() => {
    return mcpServers.filter((s) => selectedIds.has(s.id));
  }, [selectedIds]);

  const generateConfigObject = useCallback(
    (mask = true) => {
      const serversObject: Record<string, unknown> = {};

      for (const server of selectedServers) {
        const serverEnv = envValues[server.id] || {};

        if (server.transport === "sse") {
          if (targetClient === "gemini") {
            serversObject[server.id] = {
              url: server.url,
              serverUrl: server.serverUrl || server.url,
            };
          } else {
            serversObject[server.id] = {
              url: server.url,
            };
          }
          continue;
        }

        // STDIO Transport
        const resolvedEnv: Record<string, string> = {};
        const envPlaceholders: Record<string, string> = {};

        if (server.envVars) {
          for (const ev of server.envVars) {
            const rawVal = serverEnv[ev.key] ?? ev.defaultValue ?? "";
            let displayVal = rawVal;
            if (!rawVal) {
              displayVal = `<${ev.key}>`;
            } else if (mask && ev.isSecret) {
              displayVal = rawVal.length > 8 ? `${rawVal.slice(0, 4)}...${rawVal.slice(-4)}` : "********";
            }
            resolvedEnv[ev.key] = displayVal;
            envPlaceholders[ev.key] = rawVal || `<${ev.key}>`;
          }
        }

        // Replace any args placeholder like {SUPABASE_ACCESS_TOKEN}
        const resolvedArgs = (server.args || []).map((arg) => {
          let updated = arg;
          for (const [k, v] of Object.entries(envPlaceholders)) {
            const tokenToUse = mask && server.envVars?.find((ev) => ev.key === k)?.isSecret
              ? (v.startsWith("<") ? v : `${v.slice(0, 4)}...${v.slice(-4)}`)
              : v;
            updated = updated.replace(`{${k}}`, tokenToUse);
          }
          return updated;
        });

        // Filter out resolvedEnv keys that were passed as direct inline CLI args
        const envForConfig: Record<string, string> = {};
        if (server.envVars) {
          for (const ev of server.envVars) {
            const isUsedInArgs = (server.args || []).some((a) => a.includes(`{${ev.key}}`));
            if (!isUsedInArgs) {
              envForConfig[ev.key] = resolvedEnv[ev.key];
            }
          }
        }

        const baseEntry: Record<string, unknown> = {
          command: server.command || "npx",
          args: resolvedArgs,
          env: envForConfig,
        };

        if (targetClient === "cline") {
          baseEntry.disabled = false;
          baseEntry.autoApprove = [];
        }

        serversObject[server.id] = baseEntry;
      }

      return {
        mcpServers: serversObject,
      };
    },
    [selectedServers, envValues, targetClient]
  );

  const configJson = useMemo(() => {
    const obj = generateConfigObject(maskSecrets);
    return JSON.stringify(obj, null, 2);
  }, [generateConfigObject, maskSecrets]);

  const activeProfile = useMemo(() => clientProfiles[targetClient], [targetClient]);

  const generatePowerShellScript = useCallback(() => {
    const unmaskedJson = JSON.stringify(generateConfigObject(false), null, 2);
    const escapedJson = unmaskedJson.replace(/`/g, "``").replace(/\$/g, "`$").replace(/"/g, '`"');
    const targetPath = activeProfile.defaultPaths.windows;

    return `# QuickSetup - Configuracao automatica de Servidores MCP
# Alvo: ${activeProfile.name}
# Arquivo: ${targetPath}

$targetPath = "${targetPath}"
$targetDir = Split-Path -Parent $targetPath

if (-not (Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    Write-Host "Criado diretorio de configuracao: $targetDir" -ForegroundColor Cyan
}

$mcpJson = @"
${escapedJson}
"@

Set-Content -Path $targetPath -Value $mcpJson -Encoding UTF8
Write-Host "Configuracao salva com sucesso em: $targetPath" -ForegroundColor Green
Write-Host "Reinicie seu cliente (${activeProfile.name}) para carregar os novos servidores MCP." -ForegroundColor Yellow
`;
  }, [generateConfigObject, activeProfile]);

  const generateBashScript = useCallback(() => {
    const unmaskedJson = JSON.stringify(generateConfigObject(false), null, 2);
    const targetPath = activeProfile.defaultPaths.linux;

    return `#!/usr/bin/env bash
# QuickSetup - Configuracao automatica de Servidores MCP
# Alvo: ${activeProfile.name}
set -e

TARGET_PATH="${targetPath}"
TARGET_DIR=$(dirname "$TARGET_PATH")

mkdir -p "$TARGET_DIR"

cat << 'EOF' > "$TARGET_PATH"
${unmaskedJson}
EOF

echo "Configuracao salva com sucesso em: $TARGET_PATH"
echo "Reinicie seu cliente (${activeProfile.name}) para ativar os servidores MCP."
`;
  }, [generateConfigObject, activeProfile]);

  const downloadConfigFile = useCallback(() => {
    const jsonStr = JSON.stringify(generateConfigObject(false), null, 2);
    const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = activeProfile.configFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [generateConfigObject, activeProfile]);

  return {
    selectedIds,
    selectedServers,
    targetClient,
    setTargetClient,
    activeProfile,
    envValues,
    setEnvValue,
    search,
    setSearch,
    activeCategory,
    setActiveCategory,
    maskSecrets,
    setMaskSecrets,
    toggleServer,
    selectAll,
    clearSelection,
    applyPreset,
    filteredServers,
    configJson,
    generatePowerShellScript,
    generateBashScript,
    downloadConfigFile,
  };
}
