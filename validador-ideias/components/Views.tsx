"use client";
import type { Json, Project } from "../lib/types";
import { SCORE_WEIGHTS } from "../lib/types";
import { aggregateAudience, project36, weightedScore } from "../lib/finance";

const brl = (v: number) => "R$ " + Math.round(v).toLocaleString("pt-BR");
const List = ({ items }: { items?: any[] }) => (
  <ul>{(items ?? []).map((x, i) => <li key={i}>{typeof x === "string" ? x : JSON.stringify(x)}</li>)}</ul>
);
const Notice = ({ children }: { children: React.ReactNode }) => <div className="notice">{children}</div>;

/* ---------- 2. Incertezas ---------- */
export function Uncertainties({ d }: { d: Json }) {
  const items: Json[] = d.assumptions ?? [];
  const band = (v: number) => (v >= 4 ? 0 : v >= 3 ? 1 : 2); // impacto: linha (0=alto)
  const ev = (v: number) => (v <= 2 ? 0 : v === 3 ? 1 : 2); // evidência: coluna (0=baixa)
  const cells = Array.from({ length: 9 }, (_, k) => ({ r: Math.floor(k / 3), c: k % 3, ids: [] as string[] }));
  items.forEach((a) => cells[band(a.impact) * 3 + ev(a.evidence)].ids.push(a.id));
  return (
    <>
      <div className="card">
        <h3>Matriz de incertezas (impacto × evidência)</h3>
        <p className="muted">Canto superior esquerdo = alto impacto e pouca evidência: teste primeiro.</p>
        <div className="row" style={{ alignItems: "stretch", flexWrap: "nowrap" }}>
          <div className="muted" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", textAlign: "center" }}>Impacto ↑</div>
          <div style={{ flex: 1 }}>
            <div className="matrix">
              {cells.map((c) => (
                <div key={c.r * 3 + c.c} className={"cell " + (c.r === 0 && c.c === 0 ? "hot" : c.r === 0 && c.c === 1 || c.r === 1 && c.c === 0 ? "mid" : "")}>
                  {c.ids.map((id) => <span className="chip" key={id}>{id}</span>)}
                </div>
              ))}
            </div>
            <div className="muted" style={{ textAlign: "center" }}>Evidência existente →</div>
          </div>
        </div>
      </div>
      <div className="card">
        <h3>Suposições e experimentos (Lean Startup)</h3>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead><tr><th>ID</th><th>Suposição testável</th><th>Tipo</th><th>Imp.</th><th>Evid.</th><th>Experimento</th></tr></thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id}>
                  <td><b>{a.id}</b>{a.source === "oculta" && <div className="tag warn">oculta</div>}</td>
                  <td>{a.testable_statement ?? a.text}</td>
                  <td><span className="tag">{a.category}</span></td>
                  <td>{a.impact}</td><td>{a.evidence}</td>
                  <td><b>{a.experiment?.name}</b><br />{a.experiment?.method}<br /><span className="muted">Métrica: {a.experiment?.metric} · Sucesso: {a.experiment?.success_criteria} · {a.experiment?.cost} · {a.experiment?.duration_days}d</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="grid g2">
        <div className="card"><h3>Cruzamento das incertezas</h3><p>{d.cross_analysis}</p><p className="muted">Ordem de teste: {(d.priority_order ?? []).join(" → ")}</p></div>
        <div className="card"><h3>Design Thinking</h3><h4>Empatizar</h4><p>{d.design_thinking?.empathize}</p><h4>Definir</h4><p>{d.design_thinking?.define_problem_statement}</p><h4>Idear</h4><List items={d.design_thinking?.ideate} /></div>
      </div>
    </>
  );
}

/* ---------- 3. Mercado ---------- */
export function Market({ d }: { d: Json }) {
  const m = d.market ?? {};
  const sw = d.swot ?? {};
  const q = (title: string, k: string, cls: string) => (
    <div className="card" key={k}><span className={"tag " + cls}>{title}</span><List items={sw[k]} /></div>
  );
  return (
    <>
      <Notice>{d.disclaimer ?? "Estimativas sintéticas: valide com fontes reais."}</Notice>
      <div className="card">
        <h3>Pesquisa de mercado</h3><p>{m.summary}</p>
        <div className="grid g3">
          {(["tam", "sam", "som"] as const).map((k) => (
            <div key={k}><h4>{k.toUpperCase()}</h4><div style={{ fontWeight: 700 }}>{m[k]?.value}</div><div className="muted">{m[k]?.assumption}</div></div>
          ))}
        </div>
        <div className="grid g2"><div><h4>Tendências</h4><List items={m.trends} /></div><div><h4>Barreiras de entrada</h4><List items={m.entry_barriers} /><h4>Regulação</h4><List items={m.regulatory_notes} /></div></div>
        <h4>Segmentos</h4>
        <List items={(m.segments ?? []).map((s: Json) => `${s.name} — ${s.size_note} (fit ${s.fit})`)} />
      </div>
      <div className="card">
        <h3>Concorrentes</h3>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead><tr><th>Empresa</th><th>Tipo</th><th>Posicionamento / preço</th><th>Forças</th><th>Fraquezas</th></tr></thead>
            <tbody>
              {(d.competitors ?? []).map((c: Json, i: number) => (
                <tr key={i}>
                  <td><b>{c.name}</b><div className={"tag " + (c.confidence === "alta" ? "ok" : c.confidence === "baixa" ? "bad" : "warn")}>confiança {c.confidence}</div></td>
                  <td>{c.type}</td><td>{c.positioning}<br /><span className="muted">{c.pricing_note}</span></td>
                  <td><List items={c.strengths} /></td><td><List items={c.weaknesses} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p><b>Lacuna competitiva:</b> {d.competitive_gap}</p>
      </div>
      <h3>SWOT</h3>
      <div className="grid g2">{q("Forças", "strengths", "ok")}{q("Fraquezas", "weaknesses", "bad")}{q("Oportunidades", "opportunities", "")}{q("Ameaças", "threats", "warn")}</div>
      <div className="card"><h4>Implicações estratégicas</h4><List items={d.swot_implications} /></div>
    </>
  );
}

/* ---------- 4. Público sintético ---------- */
export function Audience({ d }: { d: Json }) {
  const agg = aggregateAudience(d);
  const personas: Json[] = d.personas ?? [];
  return (
    <>
      <Notice>{d.disclaimer ?? "Dados sintéticos gerados por IA."}</Notice>
      <div className="grid g3">
        <div className="card"><h4>Intenção de compra média</h4><div className="big">{agg.avgIntent.toFixed(1)}<span className="muted">/10</span></div><div className="muted">{agg.wouldBuy} de {agg.total} com intenção ≥ 7</div></div>
        <div className="card"><h4>Disposição a pagar (mediana)</h4><div className="big">{brl(agg.medianWtp)}</div><div className="muted">por mês</div></div>
        <div className="card"><h4>Concordância por hipótese</h4>
          {agg.hypotheses.map((h) => (
            <div key={h.id} style={{ marginBottom: 6 }}><div className="row" style={{ justifyContent: "space-between" }}><b>{h.id}</b><span>{h.avg.toFixed(1)}/10</span></div><div className="bar"><i style={{ width: h.avg * 10 + "%" }} /></div></div>
          ))}
        </div>
      </div>
      <div className="grid g2">
        <div className="card"><h4>Padrões</h4><List items={d.patterns} /></div>
        <div className="card"><h4>Surpresas (contradizem o fundador)</h4><List items={d.surprises} /></div>
      </div>
      <h3>Personas sintéticas</h3>
      <div className="grid g2">
        {personas.map((p) => (
          <div className="card" key={p.id}>
            <div className="row" style={{ justifyContent: "space-between" }}><h3 style={{ margin: 0 }}>{p.name}, {p.age}</h3><span className={"tag " + (p.purchase_intent >= 7 ? "ok" : p.purchase_intent >= 4 ? "warn" : "bad")}>intenção {p.purchase_intent}/10</span></div>
            <div className="muted">{p.occupation} — {p.context}</div>
            <p><i>“{p.interview_quote}”</i></p>
            <h4>Dores</h4><List items={p.pains} /><h4>Objeções</h4><List items={p.objections} />
            <div className="muted">Alternativa atual: {p.current_alternatives} · Pagaria: {brl(p.willingness_to_pay ?? 0)}/mês</div>
          </div>
        ))}
      </div>
      <div className="card">
        <h3>Reações às suposições</h3>
        <div style={{ overflowX: "auto" }}>
          <table><thead><tr><th>Persona</th><th>Hipótese</th><th>Nota</th><th>Fala</th></tr></thead>
            <tbody>{(d.reactions ?? []).map((r: Json, i: number) => <tr key={i}><td>{r.persona_id}</td><td>{r.hypothesis_id}</td><td>{r.agreement}</td><td>{r.quote}</td></tr>)}</tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/* ---------- 5. Canvas ---------- */
export function Canvas({ d }: { d: Json }) {
  const v = d.value_proposition_canvas ?? {};
  const b = d.business_model_canvas ?? {};
  const Box = ({ t, k, s }: { t: string; k: string; s: React.CSSProperties }) => (
    <div style={s}><h4>{t}</h4><List items={b[k]} /></div>
  );
  return (
    <>
      <div className="card"><h4>Pitch</h4><p style={{ fontSize: "1.1rem", fontWeight: 600 }}>{d.one_line_pitch}</p></div>
      <div className="card">
        <h3>Canvas de Proposta de Valor — {v.segment}</h3>
        <div className="grid g2">
          <div>
            <h4>Perfil do cliente</h4>
            <b>Tarefas (jobs)</b><List items={v.customer_profile?.jobs} /><b>Dores</b><List items={v.customer_profile?.pains} /><b>Ganhos</b><List items={v.customer_profile?.gains} />
          </div>
          <div>
            <h4>Mapa de valor</h4>
            <b>Produtos e serviços</b><List items={v.value_map?.products_services} /><b>Aliviadores de dor</b><List items={v.value_map?.pain_relievers} /><b>Criadores de ganho</b><List items={v.value_map?.gain_creators} />
          </div>
        </div>
        <div className="row"><b>Fit proposta × cliente:</b><span className="tag">{v.fit_assessment?.score_0_100}/100</span></div>
        <List items={v.fit_assessment?.gaps} />
      </div>
      <div className="card">
        <h3>Business Model Canvas</h3>
        <div className="bmc">
          <Box t="Parcerias-chave" k="key_partnerships" s={{ gridColumn: "1 / 3", gridRow: "1 / 3" }} />
          <Box t="Atividades-chave" k="key_activities" s={{ gridColumn: "3 / 5" }} />
          <Box t="Recursos-chave" k="key_resources" s={{ gridColumn: "3 / 5" }} />
          <Box t="Proposta de valor" k="value_propositions" s={{ gridColumn: "5 / 7", gridRow: "1 / 3" }} />
          <Box t="Relacionamento" k="customer_relationships" s={{ gridColumn: "7 / 9" }} />
          <Box t="Canais" k="channels" s={{ gridColumn: "7 / 9" }} />
          <Box t="Segmentos" k="customer_segments" s={{ gridColumn: "9 / 11", gridRow: "1 / 3" }} />
          <Box t="Estrutura de custos" k="cost_structure" s={{ gridColumn: "1 / 6" }} />
          <Box t="Fontes de receita" k="revenue_streams" s={{ gridColumn: "6 / 11" }} />
        </div>
      </div>
    </>
  );
}

/* ---------- 6. Viabilidade ---------- */
export function Viability({ d, onChange }: { d: Json; onChange: (next: Json) => void }) {
  const a = d.financial?.assumptions ?? {};
  const f = project36(a);
  const t = d.technology ?? {};
  const fields: [string, string][] = [
    ["price_monthly", "Preço mensal (R$)"], ["cogs_pct", "Custo variável (% da receita)"], ["churn_monthly_pct", "Churn mensal (%)"],
    ["cac", "CAC (R$)"], ["fixed_costs_monthly", "Custos fixos/mês (R$)"], ["initial_investment", "Investimento inicial (R$)"],
    ["new_customers_month1", "Novos clientes no mês 1"], ["new_customers_growth_pct", "Crescimento mensal de novos clientes (%)"],
  ];
  const set = (k: string, v: number) => onChange({ ...d, financial: { ...d.financial, assumptions: { ...a, [k]: v } } });
  const hi = Math.max(...f.rows.map((r) => r.cumulative), 0);
  const lo = Math.min(...f.rows.map((r) => r.cumulative), 0);
  const span = Math.max(hi - lo, 1);
  const H = 120;
  const zeroY = (hi / span) * H; // distância do topo até o zero
  return (
    <>
      <div className="card">
        <h3>Viabilidade financeira</h3>
        <p className="muted">Premissas sugeridas pela IA: ajuste os números e a projeção recalcula na hora.</p>
        <div className="grid g3">
          {fields.map(([k, label]) => (
            <div key={k}><label>{label}</label><input type="number" value={a[k] ?? 0} onChange={(e) => set(k, parseFloat(e.target.value) || 0)} />
              <div className="muted">{d.financial?.rationale?.[k] ?? ""}</div></div>
          ))}
        </div>
        <div className="grid g3" style={{ marginTop: 16 }}>
          <div><h4>LTV / CAC</h4><div className="big">{f.ltvCac ? f.ltvCac.toFixed(1) : "—"}</div><div className="muted">meta ≥ 3</div></div>
          <div><h4>Breakeven</h4><div className="big">{f.breakevenMonth ? "mês " + f.breakevenMonth : "> 36m"}</div></div>
          <div><h4>Payback do investimento</h4><div className="big">{f.paybackMonth ? "mês " + f.paybackMonth : "> 36m"}</div></div>
          <div><h4>Receita ano 1</h4><div style={{ fontWeight: 700 }}>{brl(f.revenueY1)}</div></div>
          <div><h4>Receita ano 3</h4><div style={{ fontWeight: 700 }}>{brl(f.revenueY3)}</div></div>
          <div><h4>Caixa mínimo (necessidade de capital)</h4><div style={{ fontWeight: 700 }}>{brl(f.minCash)}</div></div>
        </div>
        <h4 style={{ marginTop: 16 }}>Caixa acumulado (36 meses)</h4>
        <div role="img" aria-label="Caixa acumulado em 36 meses" style={{ position: "relative", display: "flex", gap: 2, height: H }}>
          {f.rows.map((r) => {
            const h = Math.max(2, (Math.abs(r.cumulative) / span) * H);
            return <div key={r.month} title={`Mês ${r.month}: ${brl(r.cumulative)}`} style={{ flex: 1, position: "relative" }}>
              <div style={{ position: "absolute", left: 0, right: 0, height: h, top: r.cumulative >= 0 ? zeroY - h : zeroY, background: r.cumulative >= 0 ? "var(--ok)" : "var(--bad)", borderRadius: 2 }} />
            </div>;
          })}
          <div style={{ position: "absolute", left: 0, right: 0, top: zeroY, borderTop: "1px dashed var(--muted)" }} />
        </div>
        <p className="muted">Verde = acumulado positivo · vermelho = negativo.</p>
        <div className="grid g2"><div><h4>Custos</h4><List items={(d.financial?.cost_breakdown ?? []).map((c: Json) => `${c.item}: ${brl(c.monthly)}/mês`)} /></div><div><h4>Riscos financeiros</h4><List items={d.financial?.risks} /><p className="muted">{d.financial?.funding_notes}</p></div></div>
      </div>
      <div className="card">
        <h3>Viabilidade tecnológica <span className={"tag " + (t.complexity === "baixa" ? "ok" : t.complexity === "alta" ? "bad" : "warn")}>complexidade {t.complexity}</span></h3>
        <p>{t.feasibility_verdict}</p>
        <div className="grid g3"><div><h4>Prazo MVP</h4><b>{t.mvp_time_weeks} semanas</b></div><div><h4>Custo estimado MVP</h4><b>{brl(t.mvp_cost_estimate_brl ?? 0)}</b></div><div><h4>Time</h4><List items={t.team_needed} /></div></div>
        <h4>Stack recomendada</h4>
        <table><tbody>{(t.recommended_stack ?? []).map((s: Json, i: number) => <tr key={i}><td><b>{s.layer}</b></td><td>{s.choice}</td><td className="muted">{s.why}</td></tr>)}</tbody></table>
        <h4>Construir × comprar</h4>
        <table><tbody>{(t.build_vs_buy ?? []).map((s: Json, i: number) => <tr key={i}><td>{s.capability}</td><td><span className="tag">{s.decision}</span></td><td className="muted">{s.note}</td></tr>)}</tbody></table>
        <div className="grid g2"><div><h4>Riscos técnicos</h4><List items={(t.technical_risks ?? []).map((r: Json) => `${r.risk} → ${r.mitigation}`)} /></div><div><h4>Conformidade</h4><List items={t.compliance} /><h4>IA / dados</h4><p>{t.ai_or_data_needs}</p></div></div>
      </div>
    </>
  );
}

/* ---------- 7. Scorecard / gate ---------- */
export function Score({ d, project }: { d: Json; project: Project }) {
  const total = weightedScore(d.scores ?? {}, SCORE_WEIGHTS);
  const pass = total >= project.intake.threshold;
  return (
    <>
      <div className="card">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div><h4>Nota final</h4><div className="big" style={{ color: pass ? "var(--ok)" : "var(--bad)" }}>{total}<span className="muted">/100</span></div></div>
          <div><span className={"tag " + (pass ? "ok" : "bad")} style={{ fontSize: "1rem" }}>{pass ? "Critério atingido" : "Abaixo do corte"} (corte {project.intake.threshold})</span>
            <p style={{ marginTop: 8 }}>Recomendação: <b>{d.recommendation}</b></p></div>
        </div>
        <p>{d.recommendation_text}</p>
        {Object.entries(SCORE_WEIGHTS).map(([k, w]) => (
          <div key={k} style={{ marginBottom: 10 }}>
            <div className="row" style={{ justifyContent: "space-between" }}><b>{w.label} <span className="muted">peso {w.weight}%</span></b><b>{d.scores?.[k]}</b></div>
            <div className="bar"><i style={{ width: (d.scores?.[k] ?? 0) + "%" }} /></div>
            <div className="muted">{d.rationale?.[k]}</div>
          </div>
        ))}
      </div>
      <div className="grid g2">
        <div className="card"><h4>Pontos fortes</h4><List items={d.strengths} /><h4>Alertas</h4><List items={d.red_flags} /></div>
        <div className="card"><h4>Próximos passos com pessoas reais</h4><List items={d.next_validation_steps} />{!pass && <><h4>Opções de pivô</h4><List items={d.pivot_options} /></>}</div>
      </div>
      <Notice>A nota se apoia em dados sintéticos. Antes de investir, confirme as hipóteses mais arriscadas com entrevistas e testes reais.</Notice>
    </>
  );
}

/* ---------- 8. MVP ---------- */
export function Mvp({ d }: { d: Json }) {
  const s = d.scope ?? {};
  return (
    <>
      <div className="card"><h3>Objetivo do MVP <span className="tag">{d.mvp_type}</span></h3><p>{d.mvp_goal}</p><p className="muted">Arquitetura: {d.architecture} · Orçamento: {brl(d.budget_brl ?? 0)}</p></div>
      <div className="card">
        <h3>Escopo (MoSCoW)</h3><h4>Must have</h4>
        {(s.must ?? []).map((m: Json, i: number) => (<div key={i} style={{ marginBottom: 8 }}><b>{m.feature}</b><div className="muted">{m.user_story}</div><List items={m.acceptance} /></div>))}
        <div className="grid g3"><div><h4>Should</h4><List items={s.should} /></div><div><h4>Could</h4><List items={s.could} /></div><div><h4>Won’t now</h4><List items={s.wont_now} /></div></div>
      </div>
      <div className="grid g2">
        <div className="card"><h3>Métricas de sucesso</h3><table><tbody>{(d.success_metrics ?? []).map((m: Json, i: number) => <tr key={i}><td><b>{m.metric}</b></td><td>{m.target}</td><td className="muted">{m.how_to_measure}</td></tr>)}</tbody></table><p><b>Pivotar ou perseverar:</b> {d.pivot_or_persevere_rules}</p></div>
        <div className="card"><h3>Roadmap</h3>{(d.roadmap ?? []).map((r: Json, i: number) => <div key={i}><b>{r.phase}</b><List items={r.goals} /></div>)}<h4>Primeiros usuários</h4><p>{d.first_users_plan}</p><h4>Riscos</h4><List items={d.risks_next} /></div>
      </div>
    </>
  );
}
