import { http } from './http';
import type {
  AiChatMessage,
  AiChatResponse,
  AiTool,
  AiToolResult,
} from '../types/ai';

export async function getAiTools(): Promise<AiTool[]> {
  return (await http.get<{ data: AiTool[] }>('/ai/tools')).data.data;
}

export async function chatWithAi(
  messages: AiChatMessage[],
): Promise<AiChatResponse> {
  return (
    await http.post<{ data: AiChatResponse }>('/ai/chat', { messages })
  ).data.data;
}

export async function executeAiTool(
  tool: string,
  arguments_: Record<string, unknown> = {},
): Promise<AiToolResult> {
  return (
    await http.post<{ data: AiToolResult }>('/ai/tool', {
      tool,
      arguments: arguments_,
    })
  ).data.data;
}
