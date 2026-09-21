export type McpCategory = "development" | "database" | "payments" | "design" | "utilities" | "cloud";

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
  database: "Bancos de Dados",
  payments: "Pagamentos & E-commerce",
  design: "Design & Frontend",
  utilities: "Utilitários & Sistema",
  cloud: "Cloud & DevOps",
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
    id: "cloud-devops",
    name: "Cloud & Infra DevOps",
    description: "Gestão de contêineres e busca: Docker, GitHub, Filesystem e Brave Search.",
    icon: "Box",
    serverIds: ["docker-mcp-server", "github-mcp-server", "filesystem-mcp-server", "brave-search-mcp-server"],
  },
];
