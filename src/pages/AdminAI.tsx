import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AlertCircle, Bot, ChevronRight, Clock3, Loader2, Play, ShieldCheck, Sparkles, Wrench } from 'lucide-react';
import { getAiTools, executeAiTool, chatWithAi } from '../api/ai';
import type { AiChatMessage } from '../types/ai';
import { useAuthStore } from '../stores/authStore';
import ReactMarkdown from 'react-markdown';

function errorMessage(error: any) {
  return error?.response?.data?.message ?? error?.response?.data?.errors?.arguments?.[0] ?? error?.message ?? 'The AI operation could not be completed.';
}

function toolArguments(name: string, customerId: string, orderId: string, from: string, to: string): Record<string, unknown> {
  if (name === 'customer_summary') return { customer_id: Number(customerId) };
  if (name === 'order_summary') return { order_id: Number(orderId) };
  return { ...(from ? { from } : {}), ...(to ? { to } : {}) };
}

export default function AdminAI() {
  const { user } = useAuthStore();
  const [selectedTool, setSelectedTool] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [orderId, setOrderId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [result, setResult] = useState<unknown>(null);
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [prompt, setPrompt] = useState('');

  const toolsQuery = useQuery({ queryKey: ['ai-tools'], queryFn: getAiTools });
  const toolMutation = useMutation({ mutationFn: ({ tool, arguments_ }: { tool: string; arguments_: Record<string, unknown> }) => executeAiTool(tool, arguments_), onSuccess: setResult });
  const chatMutation = useMutation({
    mutationFn: chatWithAi,
    onSuccess: (data) => {
      const content = data.message?.trim() || 'The AI returned no text response.';

      setMessages((current) => [
        ...current,
        { role: 'assistant', content },
      ]);
    },
  });

  const activeTool = useMemo(() => toolsQuery.data?.find((tool) => tool.name === selectedTool), [toolsQuery.data, selectedTool]);
  const canRun = selectedTool === 'report_overview' ? true : selectedTool === 'customer_summary' ? /^\d+$/.test(customerId) : selectedTool === 'order_summary' ? /^\d+$/.test(orderId) : false;

  function runTool() {
    if (!selectedTool || !canRun) return;
    setResult(null);
    toolMutation.mutate({ tool: selectedTool, arguments_: toolArguments(selectedTool, customerId, orderId, from, to) });
  }

  function sendChat() {
    const text = prompt.trim();
    if (!text || chatMutation.isPending) return;
    const next = [...messages, { role: 'user' as const, content: text }];
    setMessages(next);
    setPrompt('');
    chatMutation.mutate(next);
  }

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div><div className="mb-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600"><ShieldCheck size={14}/> Laravel-controlled AI</div><h1 className="text-2xl font-bold tracking-tight">Admin AI</h1><p className="mt-1 max-w-2xl text-sm text-slate-500">Controlled AI assistance using only server-approved tools. Laravel remains authoritative for permissions, business rules, safety, and data access.</p></div>
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-right"><div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Signed in as</div><div className="mt-1 text-sm font-semibold">{user?.name ?? 'Administrator'}</div><div className="text-xs text-slate-500">{user?.role?.replaceAll('_', ' ') ?? 'Administrator'}</div></div>
    </div>

    <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4"><div className="flex items-center gap-2 font-semibold"><Wrench size={17}/> Available tools</div><p className="mt-1 text-xs text-slate-500">Returned by <code className="rounded bg-slate-100 px-1">GET /ai/tools</code>.</p></div>
        <div className="p-3">
          {toolsQuery.isLoading && <div className="flex items-center gap-2 p-4 text-sm text-slate-500"><Loader2 className="animate-spin" size={16}/> Loading server-approved tools…</div>}
          {toolsQuery.isError && <div className="m-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><div className="flex gap-2 font-semibold"><AlertCircle size={16}/> Unable to load AI tools</div><p className="mt-1 text-xs">{errorMessage(toolsQuery.error)}</p></div>}
          {toolsQuery.data?.map((tool) => <button key={tool.name} onClick={() => { setSelectedTool(tool.name); setResult(null); }} className={`mb-2 w-full rounded-xl border p-4 text-left transition ${selectedTool === tool.name ? 'border-slate-900 bg-slate-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}><div className="flex items-center justify-between gap-3"><div className="font-mono text-xs font-bold text-slate-800">{tool.name}</div><ChevronRight size={15} className="text-slate-400"/></div><p className="mt-2 text-xs leading-5 text-slate-500">{tool.description}</p></button>)}
        </div>
      </section>

      <div className="space-y-5">
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4"><div className="flex items-center gap-2 font-semibold"><Play size={17}/> Controlled tool execution</div><p className="mt-1 text-xs text-slate-500">Tool arguments are sent to Laravel for validation and authorization before execution.</p></div>
          <div className="p-5">
            {!activeTool ? <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center"><Sparkles className="mx-auto text-slate-400" size={24}/><p className="mt-2 text-sm font-medium">Select an approved tool</p><p className="mt-1 text-xs text-slate-500">No tool is executed until you explicitly run it.</p></div> : <div className="space-y-5"><div><div className="font-mono text-sm font-bold">{activeTool.name}</div><p className="mt-1 text-sm text-slate-500">{activeTool.description}</p></div>
              {selectedTool === 'customer_summary' && <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-600">Customer ID</span><input inputMode="numeric" value={customerId} onChange={(e) => setCustomerId(e.target.value)} placeholder="e.g. 12" className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-500"/></label>}
              {selectedTool === 'order_summary' && <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-600">Order ID</span><input inputMode="numeric" value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="e.g. 25" className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-500"/></label>}
              {selectedTool === 'report_overview' && <div className="grid gap-4 sm:grid-cols-2"><label><span className="mb-1.5 block text-xs font-semibold text-slate-600">From <span className="font-normal text-slate-400">(optional)</span></span><input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-500"/></label><label><span className="mb-1.5 block text-xs font-semibold text-slate-600">To <span className="font-normal text-slate-400">(optional)</span></span><input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-500"/></label></div>}
              {toolMutation.isError && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{errorMessage(toolMutation.error)}</div>}
              <button disabled={!canRun || toolMutation.isPending} onClick={runTool} className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">{toolMutation.isPending ? <Loader2 className="animate-spin" size={16}/> : <Play size={16}/>}Run approved tool</button>
            </div>}
          </div>
        </section>

        {result !== null && <section className="rounded-2xl border border-slate-200 bg-slate-950 text-slate-100 shadow-sm"><div className="border-b border-white/10 px-5 py-4"><div className="flex items-center gap-2 font-semibold"><Clock3 size={16}/> Tool result</div><p className="mt-1 text-xs text-slate-400">Read-only result returned by Laravel.</p></div><pre className="max-h-[520px] overflow-auto p-5 text-xs leading-6">{JSON.stringify(result, null, 2)}</pre></section>}

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-5 py-4"><div className="flex items-center gap-2 font-semibold"><Bot size={17}/> AI chat</div><p className="mt-1 text-xs text-slate-500">AI assistance is powered by the configured Gemini provider. Laravel remains authoritative for permissions, business rules, safety, and data access.</p></div><div className="p-5"><div className="mb-4 min-h-24 space-y-3 rounded-xl bg-slate-50 p-4">{messages.length === 0 ? <div className="text-sm text-slate-400">Conversation will appear here.</div> : messages.map((message, index) => <div key={`${message.role}-${index}`} className={`rounded-xl p-3 text-sm ${message.role === 'user' ? 'ml-8 bg-white text-slate-700 ring-1 ring-slate-200' : 'mr-8 bg-slate-900 text-white'}`}><div className="mb-1 text-[10px] font-bold uppercase tracking-wider opacity-50">{message.role}</div><div className="whitespace-pre-wrap">
  {message.role === 'assistant' ? (
    <ReactMarkdown>{message.content}</ReactMarkdown>
  ) : (
    message.content
  )}
</div></div>)}</div>{chatMutation.isError && <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{errorMessage(chatMutation.error)}</div>}<div className="flex gap-2"><input value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') sendChat(); }} placeholder="Ask the configured AI provider…" className="h-11 min-w-0 flex-1 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-500"/><button onClick={sendChat} disabled={!prompt.trim() || chatMutation.isPending} className="inline-flex h-11 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white disabled:opacity-40">{chatMutation.isPending ? <Loader2 className="animate-spin" size={16}/> : <Sparkles size={16}/>}Send</button></div></div></section>
      </div>
    </div>
  </div>;
}
