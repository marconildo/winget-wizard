export type McpCategory =
  | "development"
  | "database"
  | "payments"
  | "design"
  | "utilities"
  | "cloud"
  | "observability"
  | "collaboration";

export type McpClientProfile = "gemini" | "claude" | "cursor" | "windsurf" | "cline";

export interface McpEnvVarDef {
  key: string;
  label: string;
  description: string;
  placeholder: string;
  required?: boolean;
  defaultValue?: string;
  isSecret?: boolean;
}

export interface McpServerDef {
  id: string;
  name: string;
  vendor: string;
  category: McpCategory;
  description: string;
  transport: "stdio" | "sse";
  command?: string;
  args?: string[];
  url?: string;
  serverUrl?: string;
  envVars?: McpEnvVarDef[];
  docsUrl?: string;
  icon: string;
  tags: string[];
  dockerFallback?: {
    image: string;
    args?: string[];
  };
}

export interface McpPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  serverIds: string[];
}

export interface ClientProfileInfo {
  id: McpClientProfile;
  name: string;
  description: string;
  icon: string;
  configFileName: string;
  defaultPaths: {
    windows: string;
    macos: string;
    linux: string;
  };
}

export const mcpCategoryLabels: Record<McpCategory, string> = {
  development: "Desenvolvimento & Git",
  database: "Bancos de Dados & Cache",
  payments: "Pagamentos & E-commerce",
  design: "Design & Frontend",
  cloud: "Cloud & Edge",
  observability: "Observabilidade & Erros",
  collaboration: "Colaboração & Gestão",
  utilities: "Utilitários & Memória",
};

export const clientProfiles: Record<McpClientProfile, ClientProfileInfo> = {
  gemini: {
    id: "gemini",
    name: "Antigravity / Gemini Code Assist",
    description: "Configuração global para IDEs Antigravity e Google Gemini CLI",
    icon: "Sparkles",
    configFileName: "mcp_config.json",
    defaultPaths: {
      windows: "$env:USERPROFILE\\.gemini\\config\\mcp_config.json",
      macos: "~/.gemini/config/mcp_config.json",
      linux: "~/.gemini/config/mcp_config.json",
    },
  },
  claude: {
    id: "claude",
    name: "Claude Desktop",
    description: "Aplicativo nativo Claude Desktop da Anthropic",
    icon: "Bot",
    configFileName: "claude_desktop_config.json",
    defaultPaths: {
      windows: "$env:APPDATA\\Claude\\claude_desktop_config.json",
      macos: "~/Library/Application Support/Claude/claude_desktop_config.json",
      linux: "~/.config/Claude/claude_desktop_config.json",
    },
  },
  cursor: {
    id: "cursor",
    name: "Cursor IDE",
    description: "IDE Cursor AI com suporte nativo a servidores MCP",
    icon: "Terminal",
    configFileName: "mcp.json",
    defaultPaths: {
      windows: "$env:USERPROFILE\\.cursor\\mcp.json",
      macos: "~/.cursor/mcp.json",
      linux: "~/.cursor/mcp.json",
    },
  },
  windsurf: {
    id: "windsurf",
    name: "Windsurf IDE",
    description: "IDE Codeium Windsurf com agente Cascade",
    icon: "Compass",
    configFileName: "mcp_config.json",
    defaultPaths: {
      windows: "$env:USERPROFILE\\.codeium\\windsurf\\mcp_config.json",
      macos: "~/.codeium/windsurf/mcp_config.json",
      linux: "~/.codeium/windsurf/mcp_config.json",
    },
  },
  cline: {
    id: "cline",
    name: "Cline / Roo Code (VS Code)",
    description: "Extensão autônoma Cline / Roo Code no Visual Studio Code",
    icon: "Code",
    configFileName: "cline_mcp_settings.json",
    defaultPaths: {
      windows: "$env:APPDATA\\Code\\User\\globalStorage\\saoudrizwan.claude-dev\\settings\\cline_mcp_settings.json",
      macos: "~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json",
      linux: "~/.config/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json",
    },
  },
};

export const mcpServers: McpServerDef[] = [
  // --- DESENVOLVIMENTO & GIT ---
  {
    id: "github-mcp-server",
    name: "GitHub MCP Server",
    vendor: "GitHub / Anthropic",
    category: "development",
    description: "Acesse repositórios, issues, PRs, branches, commits e ações no GitHub diretamente pelo seu agente de IA.",
    transport: "stdio",
    command: "docker",
    args: [
      "run",
      "-i",
      "--rm",
      "-e",
      "GITHUB_PERSONAL_ACCESS_TOKEN",
      "ghcr.io/github/github-mcp-server",
    ],
    dockerFallback: {
      image: "ghcr.io/github/github-mcp-server",
    },
    envVars: [
      {
        key: "GITHUB_PERSONAL_ACCESS_TOKEN",
        label: "GitHub Personal Access Token (PAT)",
        description: "Token clássico com escopos 'repo', 'workflow' e 'read:org'",
        placeholder: "ghp_xxxxxxxxxxxxxxxxxxxx",
        required: true,
        isSecret: true,
      },
    ],
    docsUrl: "https://github.com/github/github-mcp-server",
    icon: "Github",
    tags: ["git", "github", "issues", "pull-requests", "code-search"],
  },
  {
    id: "git-mcp-server",
    name: "Local Git MCP Server",
    vendor: "Model Context Protocol",
    category: "development",
    description: "Lê o histórico local de commits, diffs de branches, tags e status do repositório Git local.",
    transport: "stdio",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-git", "--repository", "{GIT_REPO_PATH}"],
    envVars: [
      {
        key: "GIT_REPO_PATH",
        label: "Caminho do Repositório Git",
        description: "Caminho local para a pasta do repositório Git",
        placeholder: "C:\\AtualDev\\Prototipo\\winget-wizard",
        required: false,
        defaultValue: ".",
        isSecret: false,
      },
    ],
    docsUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/git",
    icon: "GitBranch",
    tags: ["git", "commits", "diff", "branch", "repo"],
  },

  // --- CLOUD & EDGE ---
  {
    id: "cloudflare-mcp-server",
    name: "Cloudflare MCP Server",
    vendor: "Cloudflare",
    category: "cloud",
    description: "Inspecione Workers, consulte bancos D1, gerencie namespaces KV, veja deploys do Pages e configure DNS.",
    transport: "stdio",
    command: "npx",
    args: ["-y", "@cloudflare/mcp-server-cloudflare"],
    envVars: [
      {
        key: "CLOUDFLARE_API_TOKEN",
        label: "Cloudflare API Token",
        description: "Token de API criado com permissões de Workers, D1 e Pages",
        placeholder: "v1.0-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        required: true,
        isSecret: true,
      },
      {
        key: "CLOUDFLARE_ACCOUNT_ID",
        label: "Cloudflare Account ID",
        description: "ID da conta Cloudflare obtido na URL do painel",
        placeholder: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        required: false,
        isSecret: false,
      },
    ],
    docsUrl: "https://github.com/cloudflare/mcp-server-cloudflare",
    icon: "Cloud",
    tags: ["cloudflare", "workers", "d1", "kv", "pages", "serverless", "edge"],
  },
  {
    id: "docker-mcp-server",
    name: "Docker MCP Server",
    vendor: "Model Context Protocol",
    category: "cloud",
    description: "Inspecione contêineres, leia logs, gerencie imagens e orquestre serviços Docker locais através da IA.",
    transport: "stdio",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-docker"],
    docsUrl: "https://github.com/modelcontextprotocol/servers",
    icon: "Box",
    tags: ["docker", "containers", "devops", "deploy"],
  },

  // --- BANCOS DE DADOS & CACHE ---
  {
    id: "supabase-mcp-server",
    name: "Supabase MCP Server",
    vendor: "Supabase",
    category: "database",
    description: "Gerencie bancos PostgreSQL, execute migrações SQL, inspecione esquemas e tabelas, e controle instâncias Supabase.",
    transport: "stdio",
    command: "npx",
    args: ["-y", "@supabase/mcp-server-supabase@latest", "--access-token", "{SUPABASE_ACCESS_TOKEN}"],
    envVars: [
      {
        key: "SUPABASE_ACCESS_TOKEN",
        label: "Supabase Personal Access Token",
        description: "Token gerado em Supabase Dashboard > Account > Access Tokens",
        placeholder: "sbp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        required: true,
        isSecret: true,
      },
    ],
    docsUrl: "https://github.com/supabase/mcp-server-supabase",
    icon: "Database",
    tags: ["supabase", "postgres", "sql", "migrations", "backend"],
  },
  {
    id: "neon-mcp-server",
    name: "Neon Serverless Postgres MCP",
    vendor: "Neon",
    category: "database",
    description: "Gerencie bancos Postgres serverless, crie branches efêmeras de banco instantâneas e execute migrações isoladas.",
    transport: "stdio",
    command: "npx",
    args: ["-y", "@neondatabase/mcp-server-neon"],
    envVars: [
      {
        key: "NEON_API_KEY",
        label: "Neon API Key",
        description: "Chave de API gerada no console da Neon",
        placeholder: "neon_api_key_xxxxxxxx",
        required: true,
        isSecret: true,
      },
    ],
    docsUrl: "https://github.com/neondatabase/mcp-server-neon",
    icon: "Database",
    tags: ["neon", "postgres", "serverless", "branching", "sql"],
  },
  {
    id: "postgres-mcp-server",
    name: "PostgreSQL MCP Server",
    vendor: "Model Context Protocol",
    category: "database",
    description: "Conecte-se a qualquer banco de dados Postgres para executar queries seguras, ler schemas e analisar tabelas.",
    transport: "stdio",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-postgres", "{POSTGRES_CONNECTION_STRING}"],
    envVars: [
      {
        key: "POSTGRES_CONNECTION_STRING",
        label: "Connection String (URI)",
        description: "URI de conexão PostgreSQL (ex: postgresql://user:pass@host:5432/dbname)",
        placeholder: "postgresql://postgres:password@localhost:5432/my_database",
        required: true,
        isSecret: true,
      },
    ],
    docsUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/postgres",
    icon: "Layers",
    tags: ["postgres", "sql", "rdbms", "database", "analytics"],
  },
  {
    id: "sqlite-mcp-server",
    name: "SQLite Local Database MCP",
    vendor: "Model Context Protocol",
    category: "database",
    description: "Leitura, inspeção de esquemas e execução de queries em arquivos de banco de dados SQLite locais (.db/.sqlite).",
    transport: "stdio",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-sqlite", "{SQLITE_DB_PATH}"],
    envVars: [
      {
        key: "SQLITE_DB_PATH",
        label: "Caminho do Arquivo SQLite",
        description: "Caminho absoluto do arquivo SQLite local",
        placeholder: "C:\\AtualDev\\Prototipo\\winget-wizard\\local.db",
        required: true,
        defaultValue: "C:\\AtualDev\\Prototipo\\winget-wizard\\local.db",
        isSecret: false,
      },
    ],
    docsUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/sqlite",
    icon: "Layers",
    tags: ["sqlite", "database", "local", "sql", "embedded"],
  },
  {
    id: "redis-mcp-server",
    name: "Redis Cache & Queue MCP",
    vendor: "Model Context Protocol",
    category: "database",
    description: "Inspecione chaves de cache, valide estruturas em memória, consulte filas e acompanhe canais pub/sub.",
    transport: "stdio",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-redis", "{REDIS_URL}"],
    envVars: [
      {
        key: "REDIS_URL",
        label: "URL de Conexão Redis",
        description: "String de conexão Redis com host e porta",
        placeholder: "redis://localhost:6379",
        required: true,
        defaultValue: "redis://localhost:6379",
        isSecret: true,
      },
    ],
    docsUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/redis",
    icon: "Zap",
    tags: ["redis", "cache", "pubsub", "queue", "in-memory"],
  },

  // --- PAGAMENTOS & E-COMMERCE ---
  {
    id: "mercadopago-mcp-server",
    name: "Mercado Pago MCP Server",
    vendor: "Mercado Pago",
    category: "payments",
    description: "Servidor oficial para consulta de pagamentos, geração de PIX, Checkout Pro, webhooks e conciliação bancária.",
    transport: "sse",
    url: "https://mcp.mercadopago.com/mcp",
    serverUrl: "https://mcp.mercadopago.com/mcp",
    docsUrl: "https://www.mercadopago.com.br/developers",
    icon: "CreditCard",
    tags: ["payments", "pix", "checkout", "mercadopago", "fintech", "ecommerce"],
  },

  // --- DESIGN & FRONTEND ---
  {
    id: "figma-mcp-server",
    name: "Figma MCP Server",
    vendor: "Figma / Model Context Protocol",
    category: "design",
    description: "Inspecione layouts, leia tokens de design, analise componentes e converta frames do Figma diretamente em código UI.",
    transport: "stdio",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-figma"],
    envVars: [
      {
        key: "FIGMA_PERSONAL_ACCESS_TOKEN",
        label: "Figma Access Token (PAT)",
        description: "Token gerado nas configurações da conta no Figma (Personal access tokens)",
        placeholder: "figd_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        required: true,
        isSecret: true,
      },
    ],
    docsUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/figma",
    icon: "Palette",
    tags: ["figma", "ui", "ux", "design-tokens", "frontend", "wireframe"],
  },

  // --- OBSERVABILIDADE & ERROS ---
  {
    id: "sentry-mcp-server",
    name: "Sentry Error & Diagnostics MCP",
    vendor: "Sentry",
    category: "observability",
    description: "Diagnostique exceções e erros de produção em tempo real, inspecione stack traces e analise alertas pelo agente.",
    transport: "stdio",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-sentry"],
    envVars: [
      {
        key: "SENTRY_AUTH_TOKEN",
        label: "Sentry Auth Token",
        description: "Token de autenticação gerado na sua organização Sentry",
        placeholder: "sntrys_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        required: true,
        isSecret: true,
      },
    ],
    docsUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/sentry",
    icon: "Activity",
    tags: ["sentry", "errors", "monitoring", "stacktrace", "telemetry"],
  },
  {
    id: "jam",
    name: "Jam.dev Bug Replay & Network MCP",
    vendor: "Jam.dev",
    category: "observability",
    description: "Servidor SSE oficial para inspeção de gravações de bugs de frontend, logs de console e falhas de rede reportadas no Jam.",
    transport: "sse",
    url: "https://mcp.jam.dev/mcp",
    serverUrl: "https://mcp.jam.dev/mcp",
    docsUrl: "https://jam.dev/docs/mcp",
    icon: "Bug",
    tags: ["jam", "frontend", "bug-report", "console-logs", "network", "qa"],
  },

  // --- COLABORAÇÃO & GESTÃO ---
  {
    id: "linear-mcp-server",
    name: "Linear Issues & Roadmaps MCP",
    vendor: "Linear",
    category: "collaboration",
    description: "Consulte, crie e atualize issues, sprints, ciclos e projetos no Linear diretamente através de agentes de IA.",
    transport: "stdio",
    command: "npx",
    args: ["-y", "@linear/mcp-server"],
    envVars: [
      {
        key: "LINEAR_API_KEY",
        label: "Linear API Key",
        description: "Chave de API pessoal gerada nas preferências da conta Linear",
        placeholder: "lin_api_xxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        required: true,
        isSecret: true,
      },
    ],
    docsUrl: "https://github.com/linear/linear",
    icon: "CheckSquare",
    tags: ["linear", "issues", "agile", "sprints", "project-management"],
  },
  {
    id: "slack-mcp-server",
    name: "Slack Workspace & Channels MCP",
    vendor: "Anthropic / MCP",
    category: "collaboration",
    description: "Permite ao agente ler mensagens de canais de deploy/alertas e publicar resumos ou atualizações de status no Slack.",
    transport: "stdio",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-slack"],
    envVars: [
      {
        key: "SLACK_BOT_TOKEN",
        label: "Slack Bot Token",
        description: "Token de bot do aplicativo Slack (xoxb-...)",
        placeholder: "xoxb-xxxxxxxxxxxx-xxxxxxxxxxxx",
        required: true,
        isSecret: true,
      },
      {
        key: "SLACK_TEAM_ID",
        label: "Slack Team ID",
        description: "ID da equipe no Slack (T0...)",
        placeholder: "T0xxxxxxxx",
        required: false,
        isSecret: false,
      },
    ],
    docsUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/slack",
    icon: "MessageSquare",
    tags: ["slack", "chat", "notifications", "alerts", "communication"],
  },

  // --- UTILITÁRIOS & MEMÓRIA ---
  {
    id: "memory-mcp-server",
    name: "Memory Knowledge Graph MCP",
    vendor: "Anthropic / MCP",
    category: "utilities",
    description: "Grafo de conhecimento persistente para a IA reter entidades, regras, decisões e contexto entre sessões de chat.",
    transport: "stdio",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-memory"],
    docsUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/memory",
    icon: "Brain",
    tags: ["memory", "knowledge-graph", "long-term", "context", "recall"],
  },
  {
    id: "fetch-mcp-server",
    name: "Fetch Web-to-Markdown MCP",
    vendor: "Anthropic / MCP",
    category: "utilities",
    description: "Converte qualquer URL pública ou documentação da web em Markdown limpo e compacto, ideal para o contexto de LLMs.",
    transport: "stdio",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-fetch"],
    docsUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/fetch",
    icon: "Globe",
    tags: ["fetch", "web", "markdown", "scraping", "docs"],
  },
  {
    id: "filesystem-mcp-server",
    name: "Local Filesystem MCP Server",
    vendor: "Model Context Protocol",
    category: "utilities",
    description: "Permite que agentes de IA leiam, criem e alterem arquivos dentro de diretórios explicitamente autorizados na sua máquina.",
    transport: "stdio",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-filesystem", "{ALLOWED_PATH}"],
    envVars: [
      {
        key: "ALLOWED_PATH",
        label: "Diretório Autorizado",
        description: "Caminho absoluto do diretório que o agente terá permissão para acessar",
        placeholder: "C:\\AtualDev\\Prototipo",
        required: true,
        defaultValue: "C:\\AtualDev\\Prototipo",
        isSecret: false,
      },
    ],
    docsUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem",
    icon: "Folder",
    tags: ["files", "filesystem", "local", "io", "directory"],
  },
  {
    id: "brave-search-mcp-server",
    name: "Brave Search MCP Server",
    vendor: "Brave Software / MCP",
    category: "utilities",
    description: "Pesquisa na web em tempo real e busca de documentação sem rastreamento para agentes de IA.",
    transport: "stdio",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-brave-search"],
    envVars: [
      {
        key: "BRAVE_API_KEY",
        label: "Brave Search API Key",
        description: "Chave de API obtida no portal Brave Search Developer",
        placeholder: "BSAxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        required: true,
        isSecret: true,
      },
    ],
    docsUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search",
    icon: "Search",
    tags: ["web-search", "brave", "docs", "research", "realtime"],
  },
  {
    id: "puppeteer-mcp-server",
    name: "Puppeteer Web Automation MCP",
    vendor: "Model Context Protocol",
    category: "utilities",
    description: "Navegação web automatizada em modo headless, captura de screenshots e extração de conteúdo dinâmico.",
    transport: "stdio",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-puppeteer"],
    docsUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/puppeteer",
    icon: "Globe",
    tags: ["puppeteer", "browser", "automation", "scraping", "e2e"],
  },
];

export const mcpPresets: McpPreset[] = [
  {
    id: "fullstack-ai-dev",
    name: "Fullstack AI Engineer",
    description: "Setup completo para desenvolvimento web: GitHub, Supabase, Filesystem e Postgres.",
    icon: "Sparkles",
    serverIds: ["github-mcp-server", "supabase-mcp-server", "filesystem-mcp-server", "postgres-mcp-server"],
  },
  {
    id: "edge-cloudflare",
    name: "Edge & Cloudflare Stack",
    description: "Stack moderna e serverless: Cloudflare (Workers/D1), GitHub, Supabase e Fetch.",
    icon: "Cloud",
    serverIds: ["cloudflare-mcp-server", "github-mcp-server", "supabase-mcp-server", "fetch-mcp-server"],
  },
  {
    id: "observability-sentry",
    name: "Observability & Error Debugging",
    description: "Diagnóstico e monitoramento de falhas: Sentry, Jam.dev e GitHub.",
    icon: "Activity",
    serverIds: ["sentry-mcp-server", "jam", "github-mcp-server"],
  },
  {
    id: "design-to-code",
    name: "Design-to-Code",
    description: "Ideal para designers e frontend devs: Figma, GitHub e Puppeteer.",
    icon: "Palette",
    serverIds: ["figma-mcp-server", "github-mcp-server", "puppeteer-mcp-server"],
  },
  {
    id: "ecommerce-fintech",
    name: "Fintech & E-commerce",
    description: "Fluxo de pagamentos e dados: Mercado Pago, Supabase e GitHub.",
    icon: "CreditCard",
    serverIds: ["mercadopago-mcp-server", "supabase-mcp-server", "github-mcp-server"],
  },
  {
    id: "ai-memory-research",
    name: "AI Memory & Research",
    description: "Memória permanente em grafo e documentação: Memory, Fetch e Brave Search.",
    icon: "Brain",
    serverIds: ["memory-mcp-server", "fetch-mcp-server", "brave-search-mcp-server", "filesystem-mcp-server"],
  },
  {
    id: "agile-team-ops",
    name: "Agile & Team Collaboration",
    description: "Gestão ágil integrada: Linear, Slack e GitHub.",
    icon: "CheckSquare",
    serverIds: ["linear-mcp-server", "slack-mcp-server", "github-mcp-server"],
  },
  {
    id: "cloud-devops",
    name: "Cloud & Infra DevOps",
    description: "Gestão de contêineres e busca: Docker, GitHub, Filesystem e Brave Search.",
    icon: "Box",
    serverIds: ["docker-mcp-server", "github-mcp-server", "filesystem-mcp-server", "brave-search-mcp-server"],
  },
];
