import type { Json, StageId } from "./types";

/** Dados de EXEMPLO (fixos, não gerados por IA) usados quando não há ANTHROPIC_API_KEY. */
export const DEMO_INTAKE = {
  name: "MarmitaWork (exemplo)",
  idea: "Assinatura de marmitas saudáveis entregues em escritórios pequenos, com cardápio semanal escolhido por app.",
  problem: "Pessoas em escritórios sem refeitório gastam tempo e dinheiro com delivery pouco saudável no almoço.",
  audience: "Profissionais de 25-45 anos em escritórios de 10-50 pessoas, em capitais",
  solution: "Plano semanal de marmitas com cardápio rotativo, pedido pelo app e entrega agrupada por escritório.",
  location: "Brasil",
  revenueHint: "Assinatura semanal por pessoa",
  budget: "R$ 40 mil e 2 sócios",
  hypotheses: [
    "Profissionais pagariam R$ 28 por refeição em assinatura semanal",
    "Escritórios aceitam entrega agrupada em um único horário",
    "Conseguimos margem bruta acima de 35% com cozinha parceira",
  ],
  threshold: 70,
};

const L = (...a: string[]) => a;

export const DEMO: Record<StageId, Json> = {
  uncertainties: {
    assumptions: [
      { id: "H1", testable_statement: "Acreditamos que profissionais pagarão R$ 28/refeição em plano semanal. Saberemos que é verdade quando 15% dos visitantes de uma landing page deixarem pré-pedido pago.", category: "desirability", impact: 5, evidence: 2, source: "usuario", experiment: { name: "Landing + pré-venda", method: "Página com cardápio e preço, tráfego pago em 3 escritórios", metric: "Conversão em pré-pedido", success_criteria: "≥ 15% de conversão e 30 pré-pedidos", cost: "baixo", duration_days: 14 } },
      { id: "H2", testable_statement: "Acreditamos que escritórios aceitam um horário único de entrega. Saberemos quando 8 de 10 escritórios aceitarem o piloto.", category: "desirability", impact: 4, evidence: 2, source: "usuario", experiment: { name: "Piloto concierge", method: "Entrega manual por 2 semanas em 10 escritórios", metric: "Taxa de adesão ao horário", success_criteria: "≥ 80% das entregas no horário aceito", cost: "médio", duration_days: 14 } },
      { id: "H3", testable_statement: "Acreditamos que a margem bruta passa de 35% com cozinha parceira. Saberemos com 3 orçamentos reais.", category: "viability", impact: 5, evidence: 3, source: "usuario", experiment: { name: "Cotação com cozinhas", method: "Pedir proposta a 3 cozinhas industriais", metric: "Custo por marmita", success_criteria: "≤ R$ 18 por marmita", cost: "baixo", duration_days: 7 } },
      { id: "S1", testable_statement: "Acreditamos que a retenção após 4 semanas passa de 60%.", category: "viability", impact: 4, evidence: 1, source: "oculta", experiment: { name: "Coorte do piloto", method: "Acompanhar recompra", metric: "Retenção semana 4", success_criteria: "≥ 60%", cost: "baixo", duration_days: 28 } },
    ],
    priority_order: ["H1", "S1", "H3", "H2"],
    cross_analysis: "O maior risco é de desejabilidade e retenção (H1 e S1: impacto alto, pouca evidência). H3 pode matar a margem e é barata de testar, então roda em paralelo. H2 só importa se H1 se confirmar.",
    design_thinking: { empathize: "Quem trabalha em escritório pequeno quer almoçar bem sem perder 1 hora e sem estourar o orçamento.", define_problem_statement: "Como podemos garantir um almoço saudável e previsível para quem trabalha em escritórios sem refeitório?", ideate: L("Assinatura semanal com cardápio rotativo", "Geladeira inteligente no escritório com autoatendimento", "Marmita para a semana toda entregue na segunda") },
  },
  market: {
    market: { summary: "Mercado de alimentação fora do lar e delivery corporativo em crescimento, com forte fragmentação (exemplo ilustrativo).", tam: { value: "R$ 12 bi/ano (exemplo)", assumption: "Refeições de almoço em escritórios nas capitais" }, sam: { value: "R$ 1,8 bi/ano (exemplo)", assumption: "Escritórios de 10-50 pessoas sem refeitório" }, som: { value: "R$ 6 mi/ano (exemplo)", assumption: "0,3% do SAM em 3 anos" }, trends: L("Alimentação saudável e personalizada", "Trabalho híbrido reduz demanda por dia", "Benefícios corporativos de alimentação"), segments: [{ name: "Escritórios de 10-50 pessoas", size_note: "grande e pulverizado", fit: "alta" }, { name: "Coworkings", size_note: "demanda concentrada", fit: "média" }], regulatory_notes: L("Alvará sanitário e boas práticas de manipulação"), entry_barriers: L("Logística de entrega", "Confiança em segurança alimentar") },
    competitors: [
      { name: "Apps de delivery generalistas", type: "indireto", confidence: "alta", positioning: "Variedade e rapidez", pricing_note: "Taxas de entrega e comissão", strengths: L("Base enorme de usuários", "Variedade"), weaknesses: L("Pouco saudável", "Custo alto no uso diário") },
      { name: "Marmitarias locais", type: "direto", confidence: "média", positioning: "Preço baixo e comida caseira", pricing_note: "R$ 18-30 por refeição", strengths: L("Preço", "Proximidade"), weaknesses: L("Sem recorrência nem app") },
      { name: "Cartões de benefício refeição", type: "substituto", confidence: "alta", positioning: "Benefício pago pela empresa", pricing_note: "Mensalidade por colaborador", strengths: L("Já contratados pelas empresas"), weaknesses: L("Não resolvem a oferta de comida") },
    ],
    competitive_gap: "Ninguém combina recorrência semanal, comida saudável e entrega agrupada para escritórios pequenos.",
    swot: { strengths: L("Foco em escritórios pequenos", "Modelo recorrente"), weaknesses: L("Operação logística nova", "Equipe enxuta"), opportunities: L("Parcerias com coworkings", "Planos pagos pela empresa"), threats: L("Apps de delivery com planos corporativos", "Custo de insumos") },
    swot_implications: L("SO: usar a recorrência para negociar com cozinhas", "WT: começar em poucos escritórios para controlar a logística"),
    disclaimer: "DEMONSTRAÇÃO: dados de exemplo fixos, não são pesquisa real.",
  },
  audience: {
    personas: [
      ["Camila", 29, "Analista de marketing", 8, 35, "Cansei de pedir lanche todo dia, mas não tenho tempo de cozinhar."],
      ["Rafael", 34, "Desenvolvedor", 7, 30, "Se vier no horário e for gostoso, eu assino."],
      ["Juliana", 41, "Gerente financeira", 9, 40, "Pagaria bem por previsibilidade e comida leve."],
      ["Marcos", 27, "Designer", 4, 20, "R$ 28 é caro, almoço por R$ 18 na rua."],
      ["Patrícia", 38, "Advogada", 6, 32, "Gosto da ideia, mas tenho receio de enjoar."],
      ["Diego", 45, "Dono de escritório", 7, 25, "Se der pra todos do time, faz sentido pagar."],
      ["Aline", 31, "RH", 5, 22, "A empresa precisaria aprovar; sozinha eu não pagaria."],
      ["Bruno", 36, "Contador", 2, 0, "Prefiro levar marmita de casa."],
    ].map((p, i) => ({ id: "P" + (i + 1), name: p[0], age: p[1], occupation: p[2], context: "Trabalha em escritório sem refeitório", jobs_to_be_done: L("Almoçar rápido", "Comer melhor"), pains: L("Delivery caro e repetitivo", "Pouco tempo"), gains: L("Previsibilidade", "Saúde"), current_alternatives: "Delivery, restaurante por quilo, marmita de casa", objections: L("Preço", "Variedade do cardápio"), purchase_intent: p[3], willingness_to_pay: p[4], interview_quote: p[5] })),
    reactions: ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8"].flatMap((id, i) => [
      { persona_id: id, hypothesis_id: "H1", agreement: [8, 7, 9, 3, 6, 7, 5, 2][i], quote: "Depende do preço e do cardápio." },
      { persona_id: id, hypothesis_id: "H2", agreement: [7, 8, 8, 6, 6, 8, 6, 5][i], quote: "Um horário fixo funciona pra mim." },
      { persona_id: id, hypothesis_id: "H3", agreement: [6, 6, 7, 5, 6, 7, 6, 4][i], quote: "Não sei opinar sobre custo." },
    ]),
    patterns: L("Quem trabalha em time maior vê mais valor na entrega agrupada", "Preço acima de R$ 30 derruba a intenção"),
    surprises: L("Pessoas sensíveis a preço preferem marmita de casa, não delivery", "A aprovação da empresa pesa mais do que o fundador supunha"),
    disclaimer: "DEMONSTRAÇÃO: personas e falas de exemplo, não são dados reais nem gerados por IA agora.",
  },
  canvas: {
    one_line_pitch: "Almoço saudável por assinatura, entregue no seu escritório todo dia, no mesmo horário.",
    value_proposition_canvas: { segment: "Profissionais de escritórios de 10-50 pessoas", customer_profile: { jobs: L("Almoçar rápido", "Comer melhor sem planejar"), pains: L("Delivery caro e repetitivo", "Tempo perdido"), gains: L("Previsibilidade", "Saúde") }, value_map: { products_services: L("Plano semanal de marmitas", "App de escolha de cardápio"), pain_relievers: L("Preço fixo por refeição", "Entrega agrupada"), gain_creators: L("Cardápio balanceado", "Rotina sem decisão") }, fit_assessment: { score_0_100: 72, gaps: L("Variedade para quem enjoa") } },
    business_model_canvas: { customer_segments: L("Profissionais de escritórios pequenos", "Donos de escritório"), value_propositions: L("Almoço saudável recorrente", "Sem esforço de decisão"), channels: L("Indicação entre colegas", "Instagram e LinkedIn", "Parcerias com coworkings"), customer_relationships: L("App com cardápio", "Atendimento por WhatsApp"), revenue_streams: L("Assinatura semanal por pessoa", "Plano corporativo"), key_resources: L("Cozinha parceira", "App e logística"), key_activities: L("Planejar cardápio", "Operar entregas"), key_partnerships: L("Cozinhas industriais", "Entregadores"), cost_structure: L("Custo das refeições", "Logística", "Marketing") },
  },
  viability: {
    financial: { assumptions: { price_monthly: 560, cogs_pct: 62, churn_monthly_pct: 8, cac: 450, fixed_costs_monthly: 9000, initial_investment: 40000, new_customers_month1: 15, new_customers_growth_pct: 10 }, rationale: { price_monthly: "20 dias úteis × ~R$ 28", cogs_pct: "Cozinha + embalagem + entrega", churn_monthly_pct: "Retenção típica de assinaturas de alimentos", cac: "Indicação e anúncios locais", fixed_costs_monthly: "Operação enxuta e ferramentas", initial_investment: "Piloto e app básico" }, cost_breakdown: [{ item: "Equipe de operação", monthly: 5000 }, { item: "Marketing fixo", monthly: 2000 }, { item: "Ferramentas", monthly: 2000 }], risks: L("Margem apertada com entrega", "Churn alto por enjoo do cardápio"), funding_notes: "Capital inicial cobre cerca de 4 meses de operação (exemplo)." },
    technology: { recommended_stack: [{ layer: "App/Web", choice: "Next.js", why: "Rápido para MVP" }, { layer: "Pagamentos", choice: "Gateway com assinatura", why: "Cobrança recorrente" }], build_vs_buy: [{ capability: "Pagamentos recorrentes", decision: "comprar", note: "Gateway pronto" }, { capability: "Roteirização", decision: "integrar", note: "Começar manual" }], complexity: "baixa", team_needed: L("1 dev full-stack", "1 operações"), mvp_time_weeks: 6, mvp_cost_estimate_brl: 25000, technical_risks: [{ risk: "Operação manual não escala", mitigation: "Validar com piloto antes de automatizar" }], ai_or_data_needs: "Nenhuma no MVP", compliance: L("LGPD", "Vigilância sanitária"), feasibility_verdict: "Tecnicamente simples; o risco está na operação." },
  },
  score: {
    scores: { desirability: 68, market: 70, financial: 62, technology: 85, evidence: 55 },
    rationale: { desirability: "Intenção média boa, mas sensível a preço", market: "Espaço livre, porém concorrentes grandes", financial: "Margem apertada", technology: "Baixa complexidade", evidence: "Tudo ainda é sintético" },
    strengths: L("Tecnologia simples", "Nicho claro"), red_flags: L("Margem baixa", "Retenção desconhecida"), pivot_options: L("Plano pago pela empresa", "Foco em coworkings"),
    next_validation_steps: L("Landing com pré-venda", "Cotar 3 cozinhas", "Piloto com 10 escritórios"),
    recommendation: "ajustar e retestar", recommendation_text: "Há sinais promissores, mas margem e retenção precisam ser testadas com pessoas reais antes de construir (exemplo de demonstração).",
  },
  prototype: {
    html: `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:system-ui;margin:0;background:#f3f0fb}.app{max-width:400px;margin:0 auto;min-height:100vh;background:#fff;padding:20px}h1{color:#6d3fd6}.card{border:1px solid #e4e2f0;border-radius:12px;padding:12px;margin:10px 0;cursor:pointer}.card.sel{border-color:#6d3fd6;background:#ece5ff}button{width:100%;background:#6d3fd6;color:#fff;border:0;border-radius:10px;padding:12px;font-weight:700;margin-top:10px;cursor:pointer}.s{display:none}.s.on{display:block}small{color:#777}</style></head><body><div class="app">
<div class="s on" id="a"><h1>🍱 MarmitaWork</h1><p>Almoço saudável no seu escritório, todo dia, no mesmo horário.</p><button onclick="go('b')">Escolher meu cardápio</button></div>
<div class="s" id="b"><h2>Cardápio da semana</h2><div class="card" onclick="pick(this)">🥗 Seg: Frango grelhado + legumes</div><div class="card" onclick="pick(this)">🍛 Ter: Strogonoff fit + arroz integral</div><div class="card" onclick="pick(this)">🐟 Qua: Tilápia + purê de abóbora</div><button onclick="go('c')">Continuar</button></div>
<div class="s" id="c"><h2>Plano</h2><div class="card sel">5 refeições/semana — <b>R$ 140</b><br><small>Entrega às 12h no seu escritório</small></div><button onclick="go('d')">Assinar</button></div>
<div class="s" id="d"><h1>Tudo certo! ✅</h1><p>Sua primeira entrega chega segunda às 12h.</p><button onclick="go('a')">Voltar ao início</button></div>
<small>Protótipo de demonstração – dados fictícios</small></div><script>function go(i){document.querySelectorAll('.s').forEach(e=>e.classList.remove('on'));document.getElementById(i).classList.add('on')}function pick(e){e.classList.toggle('sel')}</script></body></html>`,
  },
  mvp: {
    mvp_goal: "Validar que escritórios pequenos pagam por marmitas semanais e renovam após 4 semanas.", mvp_type: "concierge",
    scope: { must: [{ feature: "Landing com cardápio e pré-pedido", user_story: "Como profissional, quero escolher e pagar meu plano para receber no escritório", acceptance: ["Pagamento recorrente funcionando", "Confirmação por WhatsApp"] }], should: L("Painel simples de entregas"), could: L("Avaliação das refeições"), wont_now: L("App nativo", "Roteirização automática") },
    success_metrics: [{ metric: "Retenção semana 4", target: "≥ 60%", how_to_measure: "Recompra por coorte" }, { metric: "Margem bruta", target: "≥ 35%", how_to_measure: "Receita - custo de refeição e entrega" }],
    pivot_or_persevere_rules: "Perseverar se retenção ≥ 60% e margem ≥ 35%; senão pivotar para plano pago pela empresa.",
    roadmap: [{ phase: "Semanas 1-2", goals: L("Landing e pré-venda", "Cotação de cozinhas") }, { phase: "Semanas 3-6", goals: L("Piloto em 10 escritórios") }, { phase: "Semanas 7-12", goals: L("Medir retenção e decidir") }],
    architecture: "Next.js + gateway de pagamento + planilha de operações", budget_brl: 25000, risks_next: L("Operação manual", "Churn"), first_users_plan: "Indicação em 10 escritórios conhecidos e coworkings da cidade.",
  },
};
