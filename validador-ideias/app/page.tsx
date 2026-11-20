"use client";
import { useEffect, useMemo, useState } from "react";
import { emptyIntake, SCORE_WEIGHTS, type Json, type Project, type StageId } from "../lib/types";
import { weightedScore } from "../lib/finance";
import { Audience, Canvas, Market, Mvp, Score, Uncertainties, Viability } from "../components/Views";

type StepId = "intake" | StageId;
const STEPS: { id: StepId; label: string; needs?: StageId; blurb: string; cta?: string }[] = [
  { id: "intake", label: "1. Ideia e hipóteses", blurb: "Conte a ideia e as hipóteses que você quer testar." },
  { id: "uncertainties", label: "2. Incertezas", needs: undefined, cta: "Mapear e cruzar incertezas", blurb: "Classifica as hipóteses (desejabilidade, viabilidade, exequibilidade), cruza impacto × evidência e propõe experimentos Lean." },
  { id: "market", label: "3. Mercado, concorrentes e SWOT", needs: "uncertainties", cta: "Gerar pesquisa de mercado", blurb: "Estimativas de TAM/SAM/SOM, concorrentes e SWOT cruzado." },
  { id: "audience", label: "4. Público sintético", needs: "market", cta: "Gerar painel sintético", blurb: "8 personas sintéticas reagem às suas hipóteses em mini-entrevistas." },
  { id: "canvas", label: "5. Canvas", needs: "audience", cta: "Montar os canvas", blurb: "Value Proposition Canvas e Business Model Canvas." },
  { id: "viability", label: "6. Viabilidade", needs: "canvas", cta: "Analisar viabilidade", blurb: "Premissas financeiras editáveis, projeção de 36 meses e viabilidade tecnológica." },
  { id: "score", label: "7. Scorecard e gate", needs: "viability", cta: "Calcular scorecard", blurb: "Nota ponderada e decisão: prosseguir, ajustar, pivotar ou abandonar." },
  { id: "prototype", label: "8. Protótipo", needs: "score", cta: "Gerar protótipo clicável", blurb: "Protótipo HTML navegável da jornada principal." },
  { id: "mvp", label: "9. Especificação do MVP", needs: "score", cta: "Especificar o MVP", blurb: "Escopo MoSCoW, user stories, métricas e roadmap." },
];

const KEY = "validador-ideias:v1";
const uid = () => Math.random().toString(36).slice(2, 10);
const newProject = (): Project => ({ id: uid(), createdAt: Date.now(), intake: emptyIntake() });

export default function Page() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentId, setCurrentId] = useState<string>("");
  const [step, setStep] = useState<StepId>("intake");
  const [loading, setLoading] = useState<StageId | null>(null);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      const saved: Project[] = raw ? JSON.parse(raw) : [];
      if (saved.length) { setProjects(saved); setCurrentId(saved[0].id); }
      else { const p = newProject(); setProjects([p]); setCurrentId(p.id); }
    } catch { const p = newProject(); setProjects([p]); setCurrentId(p.id); }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(KEY, JSON.stringify(projects)); } catch { /* armazenamento indisponível */ }
  }, [projects, ready]);

  const project = projects.find((p) => p.id === currentId);
  const update = (patch: Partial<Project>) => setProjects((ps) => ps.map((p) => (p.id === currentId ? { ...p, ...patch } : p)));
  const done = (id: StageId) => !!project?.[id];

  const score = useMemo(() => (project?.score ? weightedScore(project.score.scores ?? {}, SCORE_WEIGHTS) : null), [project?.score]);
  const passed = score !== null && project ? score >= project.intake.threshold : false;

  if (!ready || !project) return null;

  const intakeValid = project.intake.idea.trim() && project.intake.problem.trim() && project.intake.hypotheses.some((h) => h.trim());

  async function run(stage: StageId) {
    if (!project) return;
    setLoading(stage); setError("");
    try {
      const res = await fetch("/api/stage", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stage, project }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Falha ao gerar.");
      update({ [stage]: json.data } as Partial<Project>);
    } catch (e) { setError((e as Error).message); }
    finally { setLoading(null); }
  }

  const locked = (s: (typeof STEPS)[number]) => s.id !== "intake" && (!intakeValid || (s.needs ? !done(s.needs) : false));
  const cur = STEPS.find((s) => s.id === step)!;
  const setIntake = (patch: Partial<Project["intake"]>) => update({ intake: { ...project.intake, ...patch } });

  const field = (k: "name" | "idea" | "problem" | "audience" | "solution" | "location" | "revenueHint" | "budget", label: string, ph: string, rows = false) => (
    <div><label htmlFor={k}>{label}</label>
      {rows ? <textarea id={k} placeholder={ph} value={project.intake[k]} onChange={(e) => setIntake({ [k]: e.target.value })} />
        : <input id={k} placeholder={ph} value={project.intake[k]} onChange={(e) => setIntake({ [k]: e.target.value })} />}</div>
  );

  return (
    <div className="app">
      <aside className="side">
        <div className="brand">💡 Validador de Ideias</div>
        <label htmlFor="proj">Projeto</label>
        <select id="proj" value={currentId} onChange={(e) => { setCurrentId(e.target.value); setStep("intake"); setError(""); }}>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.intake.name || p.intake.idea.slice(0, 28) || "Nova ideia"}</option>)}
        </select>
        <div className="row" style={{ margin: "8px 0 14px" }}>
          <button className="btn sec" onClick={() => { const p = newProject(); setProjects([p, ...projects]); setCurrentId(p.id); setStep("intake"); }}>+ Nova ideia</button>
          {projects.length > 1 && <button className="btn ghost" onClick={() => { if (confirm("Excluir este projeto?")) { const rest = projects.filter((p) => p.id !== currentId); setProjects(rest); setCurrentId(rest[0].id); setStep("intake"); } }}>Excluir</button>}
        </div>
        {STEPS.map((s) => (
          <button key={s.id} className={"step" + (step === s.id ? " active" : "") + (s.id === "intake" ? (intakeValid ? " done" : "") : done(s.id as StageId) ? " done" : "")}
            disabled={locked(s)} onClick={() => { setStep(s.id); setError(""); }}>
            <span className="dot">{(s.id === "intake" ? intakeValid : done(s.id as StageId)) ? "✓" : ""}</span>{s.label}
          </button>
        ))}
        <p className="muted" style={{ marginTop: 16 }}>Dados salvos só neste navegador. Todo o público e as estimativas são sintéticos (IA).</p>
      </aside>

      <main className="main">
        <h1>{cur.label.replace(/^\d+\.\s/, "")}</h1>
        <p className="muted">{cur.blurb}</p>
        {error && <div className="err" role="alert">{error}</div>}

        {step === "intake" ? (
          <>
            <div className="card">
              {field("name", "Nome da ideia", "Ex.: PetCare Express")}
              {field("idea", "Qual ideia será testada?", "Descreva em 2-3 frases o que é o negócio.", true)}
              {field("problem", "Qual problema ela resolve?", "Quem sofre, quando, com que frequência e como resolve hoje.", true)}
              <div className="grid g2">{field("audience", "Público inicial", "Ex.: tutores de pets em capitais, 25-45 anos")}{field("location", "Mercado / localização", "Brasil")}</div>
              {field("solution", "Solução proposta", "O que o cliente recebe e como funciona.", true)}
              <div className="grid g2">{field("revenueHint", "Ideia de receita (opcional)", "Assinatura, comissão...")}{field("budget", "Orçamento/recursos (opcional)", "Ex.: R$ 30 mil e 2 sócios")}</div>
            </div>
            <div className="card">
              <h3>Suas hipóteses</h3>
              <p className="muted">Formule o que precisa ser verdade para o negócio funcionar (clientes, preço, canal, tecnologia). Ex.: “Tutores pagariam R$ 49/mês por…”.</p>
              {project.intake.hypotheses.map((h, i) => (
                <div className="row" key={i} style={{ marginBottom: 6, flexWrap: "nowrap" }}>
                  <b style={{ width: 28 }}>H{i + 1}</b>
                  <input aria-label={`Hipótese ${i + 1}`} value={h} onChange={(e) => setIntake({ hypotheses: project.intake.hypotheses.map((x, k) => (k === i ? e.target.value : x)) })} />
                  {project.intake.hypotheses.length > 1 && <button className="btn ghost" aria-label={`Remover hipótese ${i + 1}`} onClick={() => setIntake({ hypotheses: project.intake.hypotheses.filter((_, k) => k !== i) })}>✕</button>}
                </div>
              ))}
              {project.intake.hypotheses.length < 8 && <button className="btn sec" onClick={() => setIntake({ hypotheses: [...project.intake.hypotheses, ""] })}>+ Hipótese</button>}
            </div>
            <div className="card">
              <label htmlFor="th">Nota de corte para liberar protótipo e MVP: {project.intake.threshold}/100</label>
              <input id="th" type="range" min={40} max={90} value={project.intake.threshold} onChange={(e) => setIntake({ threshold: +e.target.value })} />
              <p className="muted">Pesos do scorecard: {Object.values(SCORE_WEIGHTS).map((w) => `${w.label.split(" (")[0]} ${w.weight}%`).join(" · ")}</p>
            </div>
            <button className="btn" disabled={!intakeValid} onClick={() => setStep("uncertainties")}>Continuar → incertezas</button>
            {!intakeValid && <span className="muted"> Preencha ideia, problema e ao menos uma hipótese.</span>}
          </>
        ) : (
          <>
            <div className="row" style={{ marginBottom: 12 }}>
              <button className="btn" disabled={loading !== null || locked(cur)} onClick={() => run(cur.id as StageId)}>
                {loading === cur.id && <span className="spinner" />}{loading === cur.id ? "Gerando… (pode levar 1-2 min)" : done(cur.id as StageId) ? "Gerar novamente" : cur.cta}
              </button>
              {done(cur.id as StageId) && !loading && cur.id !== "mvp" && (() => { const i = STEPS.findIndex((s) => s.id === cur.id); const nx = STEPS[i + 1]; return nx ? <button className="btn sec" onClick={() => setStep(nx.id)}>Próxima etapa →</button> : null; })()}
            </div>
            {step === "uncertainties" && project.uncertainties && <Uncertainties d={project.uncertainties} />}
            {step === "market" && project.market && <Market d={project.market} />}
            {step === "audience" && project.audience && <Audience d={project.audience} />}
            {step === "canvas" && project.canvas && <Canvas d={project.canvas} />}
            {step === "viability" && project.viability && <Viability d={project.viability} onChange={(v: Json) => update({ viability: v, score: undefined })} />}
            {step === "score" && project.score && <Score d={project.score} project={project} />}
            {(step === "prototype" || step === "mvp") && !passed && score !== null && (
              <div className="notice"><b>Critério não atingido ({score} &lt; {project.intake.threshold}).</b> O ideal é ajustar/pivotar e retestar antes de construir. Você pode gerar o protótipo mesmo assim para testar com usuários reais, é uma decisão sua.</div>
            )}
            {step === "prototype" && project.prototype && (
              <div className="card">
                <div className="row" style={{ justifyContent: "space-between" }}><h3>Protótipo clicável</h3>
                  <button className="btn ghost" onClick={() => { const b = new Blob([project.prototype!.html], { type: "text/html" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = `prototipo-${project.intake.name || "ideia"}.html`; a.click(); }}>Baixar HTML</button></div>
                <iframe className="proto" title="Protótipo" sandbox="allow-scripts" srcDoc={project.prototype.html} />
              </div>
            )}
            {step === "mvp" && project.mvp && <Mvp d={project.mvp} />}
          </>
        )}
      </main>
    </div>
  );
}
