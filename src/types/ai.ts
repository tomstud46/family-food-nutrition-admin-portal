export interface AiTool { name: string; description: string; }

export interface AiChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AiChatResponse {
  provider: string;
  model: string;
  response_id: string | null;
  message: string;
  tool_calls: unknown[];
}

export interface AiToolResult {
  [key: string]: unknown;
}
