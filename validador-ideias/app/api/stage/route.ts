import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { buildPrompt, SYSTEM } from "../../../lib/stages";
import { DEMO } from "../../../lib/demo";
import type { Project, StageId } from "../../../lib/types";

export const maxDuration = 300;
export const runtime = "nodejs";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-5-5";
const STAGES: StageId[] = ["uncertainties", "market", "audience", "canvas", "viability", "score", "prototype", "mvp"];

function extractJson(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("A resposta do modelo não continha JSON.");
  return JSON.parse(text.slice(start, end + 1));
}

function extractHtml(text: string) {
  const t = text.replace(/^```(?:html)?\s*/i, "").replace(/```\s*$/, "").trim();
  const i = t.search(/<!doctype html|<html/i);
  return i >= 0 ? t.slice(i) : t;
}

export async function POST(req: Request) {
  let body: { stage: StageId; project: Project };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }
  const { stage, project } = body;
  if (!STAGES.includes(stage) || !project?.intake?.idea) {
    return NextResponse.json({ error: "Etapa ou projeto inválido." }, { status: 400 });
  }

  // Sem chave da API: modo demonstração com dados de exemplo fixos.
  if (!process.env.ANTHROPIC_API_KEY || process.env.DEMO_MODE === "1") {
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({ data: DEMO[stage], demo: true });
  }

  const { prompt, raw, maxTokens } = buildPrompt(stage, project);
  const client = new Anthropic();
  try {
    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: maxTokens,
      output_config: { effort: "medium" },
      system: SYSTEM,
      messages: [{ role: "user", content: prompt }],
    });
    const msg = await stream.finalMessage();
    if (msg.stop_reason === "refusal") {
      return NextResponse.json({ error: "O modelo recusou esta solicitação. Reformule a ideia." }, { status: 422 });
    }
    if (msg.stop_reason === "max_tokens") {
      return NextResponse.json({ error: "A resposta foi cortada por tamanho. Tente novamente." }, { status: 502 });
    }
    const text = msg.content.map((b) => (b.type === "text" ? b.text : "")).join("");
    if (raw) return NextResponse.json({ data: { html: extractHtml(text) } });
    return NextResponse.json({ data: extractJson(text) });
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: "Limite de requisições atingido. Aguarde um instante e tente de novo." }, { status: 429 });
    }
    if (e instanceof Anthropic.APIError) {
      return NextResponse.json({ error: `Erro da API (${e.status}): ${e.message}` }, { status: 502 });
    }
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
