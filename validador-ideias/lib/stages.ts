import type { Project, StageId } from "./types";
import { SCORE_WEIGHTS } from "./types";
import { aggregateAudience, project36 } from "./finance";

export const SYSTEM = `Você é um consultor sênior de validação de negócios que combina Design Thinking, Lean Startup (build-measure-learn, mapeamento de suposições), Business Model Canvas, Value Proposition Canvas, análise financeira e de arquitetura tecnológica.
Regras:
- Responda sempre em português do Brasil.
- Os dados de público (personas, entrevistas, pesquisas) e as estimativas de mercado são SINTÉTICOS, gerados por você a partir de conhecimento geral. Nunca os apresente como medições reais. Seja realista e cético: inclua objeções, resistência e variação entre as pessoas; evite entusiasmo uniforme.
- Para concorrentes, cite apenas empresas que você tem confiança que existem; marque "confidence" como "alta", "média" ou "baixa". Não invente números exatos de empresas específicas.
- Seja específico para a ideia do usuário, nunca genérico.
- Responda APENAS com um objeto JSON válido (sem markdown, sem comentários), exatamente no formato pedido.`;

const ctx = (p: Project) => {
  const i = p.intake;
  return `IDEIA DO USUÁRIO
Nome: ${i.name}
Ideia: ${i.idea}
Problema: ${i.problem}
Público inicial: ${i.audience}
Solução proposta: ${i.solution}
Localização/mercado: ${i.location}
Ideia de receita: ${i.revenueHint || "(não informado)"}
Orçamento/recursos: ${i.budget || "(não informado)"}
HIPÓTESES DO USUÁRIO:
${i.hypotheses.filter(Boolean).map((h, k) => `H${k + 1}: ${h}`).join("\n")}`;
};
const j = (o: unknown) => JSON.stringify(o);

export function buildPrompt(stage: StageId, p: Project): { prompt: string; raw?: boolean; maxTokens: number } {
  switch (stage) {
    case "uncertainties":
      return {
        maxTokens: 8000,
        prompt: `${ctx(p)}

TAREFA: Faça o mapeamento de suposições (Lean Startup) e cruze as incertezas.
Para cada hipótese do usuário, classifique (desirability = clientes querem; viability = o negócio se sustenta; feasibility = conseguimos construir), dê impact (1-5: quanto o negócio quebra se for falsa) e evidence (1-5: quanto já se sabe hoje, sem pesquisa nova — normalmente baixo), reescreva em formato testável e proponha um experimento barato com métrica e critério de sucesso numérico.
Depois adicione até 4 suposições ocultas importantes que o usuário NÃO listou (ids "S1".."S4").
Formato:
{"assumptions":[{"id":"H1","text":"...","testable_statement":"Acreditamos que ... Saberemos que é verdade quando ...","category":"desirability|viability|feasibility","impact":1-5,"evidence":1-5,"source":"usuario|oculta","experiment":{"name":"...","method":"...","metric":"...","success_criteria":"...","cost":"baixo|médio|alto","duration_days":0}}],
"priority_order":["ids em ordem de teste, maior risco primeiro"],
"cross_analysis":"Texto curto cruzando incertezas: onde está o maior risco, dependências entre hipóteses, o que testar primeiro e por quê.",
"design_thinking":{"empathize":"...","define_problem_statement":"Como podemos ... (HMW)","ideate":["3 variações da solução"]}}`,
      };
    case "market":
      return {
        maxTokens: 12000,
        prompt: `${ctx(p)}

TAREFA: Pesquisa de mercado, análise de concorrentes e SWOT (estimativas sintéticas baseadas em conhecimento geral; sem acesso à web).
Formato:
{"market":{"summary":"...","tam":{"value":"R$ ... ","assumption":"como foi estimado"},"sam":{"value":"...","assumption":"..."},"som":{"value":"...","assumption":"..."},"trends":["..."],"segments":[{"name":"...","size_note":"...","fit":"alta|média|baixa"}],"regulatory_notes":["..."],"entry_barriers":["..."]},
"competitors":[{"name":"...","type":"direto|indireto|substituto","confidence":"alta|média|baixa","positioning":"...","pricing_note":"...","strengths":["..."],"weaknesses":["..."]}],
"competitive_gap":"Onde está o espaço livre para a ideia.",
"swot":{"strengths":["..."],"weaknesses":["..."],"opportunities":["..."],"threats":["..."]},
"swot_implications":["Estratégias cruzadas (SO, WO, ST, WT) em frases curtas"],
"disclaimer":"Estimativas sintéticas: valide com fontes reais (IBGE, Sebrae, relatórios setoriais) antes de decidir."}
Inclua 5-7 concorrentes, 4-5 itens por quadrante do SWOT.`,
      };
    case "audience": {
      const hyps = (p.uncertainties?.assumptions ?? []).map((a: any) => `${a.id}: ${a.testable_statement ?? a.text}`);
      return {
        maxTokens: 16000,
        prompt: `${ctx(p)}

SUPOSIÇÕES A TESTAR COM O PÚBLICO SINTÉTICO:
${hyps.join("\n") || "(use as hipóteses do usuário como H1..Hn)"}

TAREFA: Crie um painel SINTÉTICO de 8 pessoas representativas (variação de idade, renda, comportamento, atitude frente a novidades; inclua ao menos 2 céticos e 1 não-cliente). Cada pessoa tem uma mini-entrevista de descoberta e reage a cada suposição (agreement de 0 a 10, com citação curta realista, em primeira pessoa).
Formato:
{"personas":[{"id":"P1","name":"nome fictício","age":0,"occupation":"...","context":"...","jobs_to_be_done":["..."],"pains":["..."],"gains":["..."],"current_alternatives":"...","objections":["..."],"purchase_intent":0-10,"willingness_to_pay":número mensal em R$ (0 se não pagaria),"interview_quote":"..."}],
"reactions":[{"persona_id":"P1","hypothesis_id":"H1","agreement":0-10,"quote":"..."}],
"patterns":["padrões que emergiram"],
"surprises":["o que contradiz o que o fundador assume"],
"segments_found":[{"name":"...","persona_ids":["P1"],"attractiveness":"alta|média|baixa"}],
"disclaimer":"Dados sintéticos gerados por IA: servem para estruturar hipóteses, não substituem entrevistas reais."}
Deve haver uma reaction por pessoa × suposição.`,
      };
    }
    case "canvas":
      return {
        maxTokens: 10000,
        prompt: `${ctx(p)}

CONTEXTO DA PESQUISA:
Incertezas: ${j(p.uncertainties?.cross_analysis)}
Lacuna competitiva: ${j(p.market?.competitive_gap)}
Padrões do público: ${j(p.audience?.patterns)} / Surpresas: ${j(p.audience?.surprises)}
Segmentos: ${j(p.audience?.segments_found)}

TAREFA: Monte o Value Proposition Canvas e o Business Model Canvas, coerentes com a pesquisa e focados em UM segmento inicial.
Formato:
{"value_proposition_canvas":{"segment":"...","customer_profile":{"jobs":["..."],"pains":["..."],"gains":["..."]},"value_map":{"products_services":["..."],"pain_relievers":["..."],"gain_creators":["..."]},"fit_assessment":{"score_0_100":0,"gaps":["pains/gains não endereçados"]}},
"business_model_canvas":{"customer_segments":["..."],"value_propositions":["..."],"channels":["..."],"customer_relationships":["..."],"revenue_streams":["..."],"key_resources":["..."],"key_activities":["..."],"key_partnerships":["..."],"cost_structure":["..."]},
"one_line_pitch":"..."}
3-5 itens curtos por bloco.`,
      };
    case "viability":
      return {
        maxTokens: 10000,
        prompt: `${ctx(p)}

Canvas: ${j(p.canvas?.business_model_canvas)}
Disposição a pagar mediana do painel sintético: R$ ${aggregateAudience(p.audience).medianWtp}/mês
Concorrência (preço): ${j((p.market?.competitors ?? []).map((c: any) => ({ n: c.name, p: c.pricing_note })))}

TAREFA: Viabilidade financeira (premissas numéricas realistas e CONSERVADORAS, em R$, para o primeiro ano e crescimento) e viabilidade tecnológica.
As projeções de 36 meses serão calculadas pelo app a partir das suas premissas; por isso forneça números coerentes entre si.
Formato:
{"financial":{"assumptions":{"price_monthly":0,"cogs_pct":0,"churn_monthly_pct":0,"cac":0,"fixed_costs_monthly":0,"initial_investment":0,"new_customers_month1":0,"new_customers_growth_pct":0},"rationale":{"price_monthly":"...","cogs_pct":"...","churn_monthly_pct":"...","cac":"...","fixed_costs_monthly":"...","initial_investment":"...","growth":"..."},"cost_breakdown":[{"item":"...","monthly":0}],"funding_notes":"...","risks":["..."]},
"technology":{"recommended_stack":[{"layer":"...","choice":"...","why":"..."}],"build_vs_buy":[{"capability":"...","decision":"construir|comprar|integrar","note":"..."}],"complexity":"baixa|média|alta","team_needed":["..."],"mvp_time_weeks":0,"mvp_cost_estimate_brl":0,"technical_risks":[{"risk":"...","mitigation":"..."}],"ai_or_data_needs":"...","compliance":["LGPD etc."],"feasibility_verdict":"..."}}`,
      };
    case "score": {
      const agg = aggregateAudience(p.audience);
      const fin = project36(p.viability?.financial?.assumptions ?? {});
      return {
        maxTokens: 6000,
        prompt: `${ctx(p)}

RESUMO DOS RESULTADOS:
- Painel sintético: ${agg.total} personas, intenção de compra média ${agg.avgIntent.toFixed(1)}/10, ${agg.wouldBuy} com intenção ≥7, DAP mediana R$ ${agg.medianWtp}/mês.
- Concordância média por hipótese: ${j(agg.hypotheses.map((h) => ({ id: h.id, avg: +h.avg.toFixed(1) })))}
- Incertezas (impact/evidence): ${j((p.uncertainties?.assumptions ?? []).map((a: any) => ({ id: a.id, cat: a.category, impact: a.impact, evidence: a.evidence })))}
- Mercado: ${j(p.market?.market?.summary)}; ${p.market?.competitors?.length ?? 0} concorrentes; gap: ${j(p.market?.competitive_gap)}
- Ajuste proposta de valor (fit): ${j(p.canvas?.value_proposition_canvas?.fit_assessment)}
- Finanças: LTV/CAC ${fin.ltvCac?.toFixed(1) ?? "n/d"}, breakeven mês ${fin.breakevenMonth ?? "não atinge em 36m"}, payback mês ${fin.paybackMonth ?? "não atinge em 36m"}, caixa mínimo R$ ${Math.round(fin.minCash)}.
- Tecnologia: complexidade ${p.viability?.technology?.complexity}, MVP ${p.viability?.technology?.mvp_time_weeks} semanas.

TAREFA: Atribua notas de 0 a 100 e seja rigoroso e honesto (80+ só com evidências fortes; considere que o público é sintético e portanto as notas de desejabilidade e evidência devem ser moderadas). Dimensões: ${Object.entries(SCORE_WEIGHTS).map(([k, v]) => `${k} (${v.label})`).join("; ")}.
Formato:
{"scores":{"desirability":0,"market":0,"financial":0,"technology":0,"evidence":0},"rationale":{"desirability":"...","market":"...","financial":"...","technology":"...","evidence":"..."},"strengths":["..."],"red_flags":["..."],"pivot_options":["se reprovada: 2-3 pivôs concretos"],"next_validation_steps":["passos com pessoas reais antes de construir, em ordem"],"recommendation":"prosseguir|ajustar e retestar|pivotar|abandonar","recommendation_text":"..."}`,
      };
    }
    case "prototype":
      return {
        raw: true,
        maxTokens: 16000,
        prompt: `${ctx(p)}

Canvas de proposta de valor: ${j(p.canvas?.value_proposition_canvas)}
Stack/tecnologia: ${j(p.viability?.technology?.recommended_stack)}
Personas-alvo: ${j((p.audience?.personas ?? []).slice(0, 3).map((x: any) => ({ name: x.name, pains: x.pains })))}

TAREFA: Crie um PROTÓTIPO CLICÁVEL de alta fidelidade da jornada principal da solução, em UM único arquivo HTML autocontido (HTML + CSS + JS inline, sem bibliotecas externas nem imagens externas; use emojis/SVG inline). Requisitos:
- Mobile-first (largura máx. ~420px centralizada), 4 a 6 telas navegáveis (onboarding/valor, ação principal, resultado, pagamento/plano se fizer sentido), com dados fictícios realistas em português do Brasil.
- Navegação funcional por JavaScript (botões e abas), estados de interação (hover, seleção, loading simulado).
- Mostre a proposta de valor logo na primeira tela e use o nome "${p.intake.name}".
- Visual limpo e moderno, contraste adequado, funcione em tema claro.
- Adicione um pequeno rodapé "Protótipo para teste de usabilidade – dados fictícios".
Responda SOMENTE com o HTML (começando em <!doctype html>), sem markdown.`,
      };
    case "mvp":
      return {
        maxTokens: 10000,
        prompt: `${ctx(p)}

Canvas: ${j(p.canvas)}
Tecnologia: ${j(p.viability?.technology)}
Pontuação: ${j(p.score?.scores)} / Passos de validação: ${j(p.score?.next_validation_steps)}

TAREFA: Especificação do MVP (Lean Startup: o menor produto que testa a hipótese mais arriscada).
Formato:
{"mvp_goal":"hipótese central que o MVP precisa validar","mvp_type":"concierge|wizard of oz|landing page + pré-venda|app funcional|outro","scope":{"must":[{"feature":"...","user_story":"Como ... quero ... para ...","acceptance":["..."]}],"should":["..."],"could":["..."],"wont_now":["..."]},"success_metrics":[{"metric":"...","target":"...","how_to_measure":"..."}],"pivot_or_persevere_rules":"critérios objetivos","roadmap":[{"phase":"Semanas 1-2","goals":["..."]},{"phase":"Semanas 3-6","goals":["..."]},{"phase":"Semanas 7-12","goals":["..."]}],"architecture":"descrição breve","budget_brl":0,"risks_next":["..."],"first_users_plan":"como conseguir os 10 primeiros usuários reais"}`,
      };
  }
}
