import type { Json, Project } from "./types";

/**
 * Projeto OsFriends: ideia da usuária + resultados da validação feita no chat com o Claude.
 * Todos os dados de público e de mercado são SINTÉTICOS (estimativas), não pesquisa real.
 */
const L = (...a: string[]) => a;

const personas = [
  ["Marina", 31, "Publicitária", "Recém-chegada de Curitiba, mora em Pinheiros", 9, 70, "Cheguei há um ano e ainda não tenho com quem conversar de verdade."],
  ["Rafael", 36, "Desenvolvedor sênior", "Introvertido, trabalha em casa", 7, 50, "Topo se a mesa for pequena e sem pressão. IA como anfitriã me deixa meio desconfiado."],
  ["Beatriz", 44, "Advogada", "Círculo de amigos encolheu depois do divórcio", 8, 90, "Pagaria bem por um grupo em que eu me sinta segura."],
  ["Caio", 27, "Analista financeiro", "Muitos amigos de balada, vida social cheia", 3, 0, "Pagar para conhecer gente? Não é pra mim."],
  ["Helena", 52, "Professora e mentorada", "Valoriza leitura e conversa longa", 8, 80, "Adoro a ideia, só não quero que seja tudo pelo celular."],
  ["Thiago", 39, "Empreendedor", "Cansado de networking", 4, 40, "Se tiver cara de networking ou de coisa pretensiosa, eu saio."],
  ["Larissa", 29, "Designer", "Já usou o Timeleft e se frustrou com o atendimento", 7, 60, "Quero saber o preço antes e ter alguém de verdade para falar."],
  ["Paulo", 34, "Médico", "Mora em Moema, agenda apertada", 5, 100, "Pagaria, mas tenho medo de faltar e atrapalhar a mesa."],
] as const;

const scores: Record<string, number[]> = {
  H1: [9, 6, 8, 3, 8, 4, 8, 6],
  H2: [6, 6, 6, 4, 6, 5, 6, 5],
  H3: [3, 4, 6, 2, 8, 2, 3, 4],
  H4: [9, 7, 8, 4, 8, 5, 8, 7],
  H5: [9, 7, 8, 6, 8, 7, 8, 7],
  H6: [5, 4, 5, 4, 5, 3, 6, 4],
  H7: [5, 5, 5, 4, 6, 5, 9, 5],
  H8: [7, 5, 7, 3, 7, 5, 8, 6],
};
const phrase = (n: number) => (n >= 8 ? "Faz muito sentido para mim." : n >= 6 ? "Faz sentido, mas preciso ver na prática." : n >= 4 ? "Tenho dúvidas sobre isso." : "Não me convence.");

const exp = (name: string, method: string, metric: string, success: string, cost: string, days: number) => ({ name, method, metric, success_criteria: success, cost, duration_days: days });
const A = (id: string, text: string, category: string, impact: number, evidence: number, source: string, e: Json) => ({ id, text, testable_statement: text, category, impact, evidence, source, experiment: e });

export const OSFRIENDS: Omit<Project, "id" | "createdAt"> = {
  origin: "chat",
  intake: {
    name: "OsFriends",
    idea: "Clube de encontros presenciais com curadoria, para quem quer conversas boas com gente interessante. A pessoa entra por candidatura e validação, é colocada numa mesa pequena com gente de interesses parecidos e participa de encontros conduzidos com apoio de inteligência híbrida, com o celular fora da mesa.",
    problem: "Solidão intelectual e dificuldade de fazer amizade adulta: o círculo encolhe com rotina, trabalho e mudança de cidade. As opções atuais ficam rasas, têm cara de networking ou falta confiança (o líder, o Timeleft, tem reputação ruim de cobrança e atendimento).",
    audience: "Adultos de São Paulo que gostam de conversar, ler, aprender e trocar ideias, incluindo recém-chegados. Mulheres são público forte. Primeiro clube: café, vinho e livros. Primeira base: rede de alunos, Nuia, podcast, PUC Angels e mentorias.",
    solution: "Clube curado (candidatura, verificação de identidade, LinkedIn e indicação). Match por tema, às cegas sobre quem estará na mesa. IA como anfitriã (briefing antes, perguntas durante, resumo e reconexão depois). Troca real, clubes de nicho sob um guarda-chuva e confiança como diferencial (preço visível, Pix, cancelamento simples, atendimento humano).",
    location: "São Paulo (eixo Paulista e Pinheiros); Maringá como alternativa",
    revenueHint: "Assinatura de membro (referência: Timeleft R$ 59,99/mês), ingressos de encontros especiais, comissão e parcerias com locais, cupons e patrocínio de marcas.",
    budget: "",
    hypotheses: [
      "A dor de falta de conversas boas é real e grande o bastante para as pessoas pagarem.",
      "Mesmo sendo nichos, os círculos somados formam um público relevante.",
      "A exclusividade transforma o estigma de “procurar amigos” em status, o que leva as pessoas a compartilhar.",
      "O encontro às cegas, com tema definido, reduz a timidez e gera uma troca mais profunda.",
      "Cafés, bares de vinho e livrarias aceitam a parceria, com item incluso a custo reduzido, cupons e comissão.",
      "Nano-influenciadores topam ser membros fundadores em troca de incentivos.",
      "Confiança e transparência atraem quem desiste do Timeleft depois de ver o Reclame Aqui.",
      "Os círculos recorrentes reduzem o churn de quando o grupo migra para o WhatsApp.",
    ],
    threshold: 70,
  },

  uncertainties: {
    assumptions: [
      A("H1", "Acreditamos que adultos de SP pagarão uma mensalidade por conversas boas. Saberemos quando 40 pessoas pagarem a pré-venda em 14 dias.", "desirability", 5, 2, "usuario", exp("Landing + pré-venda", "Página com preço e nº de encontros visíveis, tráfego de dentro e de fora da rede", "Pagantes na pré-venda", "≥ 40 pagantes, metade de fora da rede", "baixo", 14)),
      A("H2", "Acreditamos que os círculos de nicho somados formam público suficiente.", "viability", 4, 1, "usuario", exp("Teste de demanda por tema", "Lista de espera por círculo (livros, vinho, tecnologia…)", "Inscritos por círculo", "≥ 3 círculos com 30+ inscritos", "baixo", 21)),
      A("H3", "Acreditamos que exclusividade vira status e gera compartilhamento.", "desirability", 3, 1, "usuario", exp("Teste A/B de mensagem", "‘Clube com curadoria’ vs. ‘mesa de conversas boas’", "Conversão e compartilhamento", "Versão exclusiva converte pelo menos 20% mais", "baixo", 14)),
      A("H4", "Acreditamos que a mesa às cegas com tema aprofunda a conversa.", "desirability", 4, 2, "usuario", exp("Mesas-piloto", "3 a 4 mesas com tema definido", "Nota do encontro e vontade de rever", "≥ 4,5/5 e ≥ 70% querem rever a mesa", "médio", 28)),
      A("H5", "Acreditamos que cafés, bares e livrarias aceitam item incluso a custo reduzido e comissão.", "feasibility", 4, 2, "usuario", exp("Rodada de parceiros", "Propor a 8 locais no eixo Paulista/Pinheiros", "Locais que aceitam", "2 locais com item ≤ R$ 15 por pessoa", "baixo", 7)),
      A("H6", "Acreditamos que nano-influenciadores aceitam ser membros fundadores por incentivo.", "viability", 3, 1, "usuario", exp("Convite a nano-influenciadores", "Convidar 10 perfis com proposta de fundador", "Aceites e alcance", "≥ 4 aceites e 20 pré-inscritos gerados", "baixo", 14)),
      A("H7", "Acreditamos que ex-usuários do Timeleft migram por confiança e transparência.", "desirability", 3, 2, "usuario", exp("Conversas com ex-usuários", "10 entrevistas com quem desistiu do Timeleft", "Motivo da desistência e interesse", "≥ 6 de 10 interessados", "baixo", 14)),
      A("H8", "Acreditamos que círculos recorrentes reduzem o churn.", "viability", 5, 1, "usuario", exp("Coorte do piloto", "Acompanhar retorno no 2º e 3º encontros", "Retenção", "≥ 60% voltam ao 2º encontro, ≥ 50% no mês 3", "médio", 56)),
      A("S1", "Acreditamos que a curadoria e a verificação passam segurança suficiente.", "desirability", 5, 2, "oculta", exp("Pesquisa de segurança", "Perguntar a candidatas e candidatos o que precisam para se sentir seguros", "Nota de confiança", "≥ 4/5 na confiança", "baixo", 7)),
      A("S2", "Acreditamos que a IA anfitriã agrega e não soa robótica.", "desirability", 4, 1, "oculta", exp("Teste de anfitrião", "Mesa com anfitrião humano discreto vs. mesa só com IA de apoio", "Nota de naturalidade", "IA de apoio ≥ 4/5 sem queda na nota do encontro", "médio", 28)),
      A("S3", "Acreditamos que dá para formar mesas equilibradas com pouca gente no início.", "feasibility", 5, 1, "oculta", exp("Montagem manual de mesas", "Formar mesas de 6 com os inscritos", "Mesas completas e equilibradas", "≥ 80% das mesas completas", "baixo", 14)),
      A("S4", "Acreditamos que a conta fecha com item incluso, pagamentos e anfitrião.", "viability", 5, 2, "oculta", exp("Custo por encontro", "Medir custo real no piloto", "Margem por membro", "Custo variável ≤ 40% da mensalidade", "baixo", 28)),
      A("S5", "Acreditamos que o resultado com a sua rede se repete com desconhecidos.", "viability", 4, 1, "oculta", exp("Recrutamento fora da rede", "Metade das vagas para desconhecidos", "Conversão e nota de desconhecidos", "Notas e retenção semelhantes às da rede", "médio", 28)),
    ],
    priority_order: L("S4", "H5", "H1", "S3", "H4", "S5", "H8", "S1", "S2", "H7", "H3", "H6", "H2"),
    cross_analysis: "H5 destrava S4 e S4 decide se o negócio existe: teste custo e parceiros primeiro. H8 (retenção) define o valor de cada membro. O maior risco escondido é S5: sua rede (alunos, Nuia, PUC Angels) já confia em você e vai confirmar H1 e H4 com facilidade, mas isso não prova que desconhecidos pagam. Recrute pelo menos metade do piloto fora da rede.",
    design_thinking: {
      empathize: "Adultos com gente por perto, mas sem conversa que valha a pena. Recém-chegados e mais velhos sentem mais; quem tem vida social cheia sente menos.",
      define_problem_statement: "Como podemos ajudar adultos de São Paulo a construir amizades com profundidade, com segurança e sem cara de networking?",
      ideate: L("Mesa curada com tema e celular fora da mesa", "Círculos recorrentes de nicho (livros, vinho, tecnologia)", "Clube guarda-chuva em que os próprios membros sugerem novos clubes"),
    },
  },

  market: {
    market: {
      summary: "Mercado de socialização presencial entre adultos, com forte fragmentação (apps, eventos, grupos informais). Estimativas de ordem de grandeza, sem pesquisa na web.",
      tam: { value: "≈ 3,5 a 4 mi de pessoas", assumption: "Adultos de 25 a 45 anos na cidade de São Paulo (premissa aproximada)" },
      sam: { value: "≈ 350 a 400 mil pessoas (≈ R$ 250 a 290 mi/ano)", assumption: "10% com renda e abertura para pagar R$ 60/mês" },
      som: { value: "≈ 1 a 2 mil membros no ano 3 (≈ R$ 0,9 a 1,4 mi/ano)", assumption: "0,3 a 0,5% do SAM" },
      trends: L("Aumento da solidão e do interesse por experiências presenciais", "Fadiga de apps de relacionamento e de networking", "Crescimento de clubes de nicho (leitura, vinho, corrida)"),
      segments: [{ name: "Recém-chegados à cidade", size_note: "alto engajamento", fit: "alta" }, { name: "Adultos de 35 a 50 com círculo reduzido", size_note: "mais disposição a pagar", fit: "alta" }, { name: "Jovens de 25 a 30 com vida social cheia", size_note: "baixa demanda", fit: "baixa" }],
      regulatory_notes: L("LGPD: identidade e LinkedIn são dados pessoais sensíveis ao perfil", "Alvará e regras dos locais parceiros"),
      entry_barriers: L("Confiança e segurança dos participantes", "Liquidez: precisar de gente suficiente para formar mesas boas"),
    },
    competitors: [
      { name: "Timeleft", type: "direto", confidence: "alta", positioning: "Jantares com estranhos em várias cidades", pricing_note: "R$ 59,99/mês (segundo a usuária)", strengths: L("Marca conhecida", "Escala"), weaknesses: L("Sem curadoria", "Reputação de atendimento (segundo a usuária)") },
      { name: "Meetup", type: "indireto", confidence: "alta", positioning: "Grupos abertos por interesse", pricing_note: "Varia por grupo", strengths: L("Variedade e base"), weaknesses: L("Sem curadoria nem facilitação") },
      { name: "Bumble BFF e apps de amizade", type: "indireto", confidence: "alta", positioning: "Amizade por swipe", pricing_note: "Freemium", strengths: L("Base de usuários"), weaknesses: L("Raso", "Pouca confiança") },
      { name: "Eventos de networking (Sympla/Eventbrite)", type: "substituto", confidence: "alta", positioning: "Eventos pontuais", pricing_note: "Por ingresso", strengths: L("Variedade"), weaknesses: L("Cara de networking", "Sem continuidade") },
      { name: "Clubes privados de associados", type: "indireto", confidence: "alta", positioning: "Exclusividade e status", pricing_note: "Muito acima do mercado", strengths: L("Prestígio"), weaknesses: L("Preço alto", "Foco em status") },
      { name: "Clubes de leitura e grupos de WhatsApp", type: "substituto", confidence: "média", positioning: "Informal e de graça", pricing_note: "Grátis", strengths: L("Sem custo"), weaknesses: L("Sem curadoria", "Frequência instável") },
    ],
    competitive_gap: "Profundidade e confiança com curadoria em preço acessível: mesa pequena guiada, regras claras e preço visível. Ninguém junta as três coisas.",
    swot: {
      strengths: L("Rede própria como primeira base", "Posicionamento claro (amizade, não networking)", "Regra do celular fora da mesa", "Confiança e transparência como bandeira"),
      weaknesses: L("Depende da sua presença", "Sem liquidez de membros no início", "Curadoria manual não escala sozinha", "Nome pode lembrar a série Friends"),
      opportunities: L("Horários vazios de cafés, bares e livrarias", "Black Friday para negociar parcerias", "Recém-chegados e círculos de nicho", "Patrocínio de marcas de café, vinho e livros"),
      threats: L("Timeleft lançar versão curada", "Incidente de segurança numa mesa", "Grupos migrarem para o WhatsApp", "Risco de marca (nome parecido com Friends)"),
    },
    swot_implications: L("SO: usar a rede e a confiança para fechar os primeiros parceiros e a pré-venda", "WO: começar pequeno e manual para criar liquidez antes de qualquer app", "ST: reforçar segurança e transparência para se diferenciar do Timeleft", "WT: checar o nome no INPI antes de investir em marca"),
    disclaimer: "Estimativas sintéticas geradas pelo Claude sem pesquisa na web. Valide com fontes reais (IBGE, Sebrae, relatórios setoriais) antes de decidir.",
  },

  audience: {
    personas: personas.map((p, i) => ({
      id: "P" + (i + 1), name: p[0], age: p[1], occupation: p[2], context: p[3],
      jobs_to_be_done: L("Ter conversas que valham a pena", "Conhecer gente com interesses parecidos"),
      pains: L("Conversa rasa", "Círculo que encolheu", "Desconfiança de eventos com estranhos"),
      gains: L("Amizade com profundidade", "Rotina de encontros", "Segurança"),
      current_alternatives: "Amigos antigos, eventos, apps e grupos de WhatsApp",
      objections: L("Preço e frequência", "Medo de ser pretensioso", "Dúvida sobre a IA como anfitriã"),
      purchase_intent: p[4], willingness_to_pay: p[5], interview_quote: p[6],
    })),
    reactions: Object.entries(scores).flatMap(([h, arr]) => arr.map((n, i) => ({ persona_id: "P" + (i + 1), hypothesis_id: h, agreement: n, quote: phrase(n) }))),
    patterns: L("Recém-chegados e pessoas acima de 40 anos veem mais valor e pagariam mais", "Mesa pequena e tema definido reduzem a timidez", "Preço visível e atendimento humano pesam na decisão"),
    surprises: L(
      "“Exclusivo” polariza: acima de 40 anos soa como cuidado e segurança; de 25 a 35 soa pretensioso. “Curadoria” funciona melhor que “exclusividade” (contradiz H3).",
      "O celular fora da mesa foi o que mais agradou: vale destacar na promessa.",
      "A ‘IA anfitriã’ gera dúvida (“vai ser robótico?”): funciona melhor como apoio discreto de um anfitrião humano.",
      "As pessoas querem saber quantos encontros o preço inclui; mensalidade sem número de encontros confunde.",
    ),
    segments_found: [{ name: "Recém-chegados", persona_ids: L("P1"), attractiveness: "alta" }, { name: "35+ com círculo reduzido", persona_ids: L("P3", "P5"), attractiveness: "alta" }],
    disclaimer: "Personas e falas SINTÉTICAS geradas pelo Claude no chat, com céticos incluídos de propósito. H5 e H6 dependem de terceiros (locais e influenciadores): a reação das personas só indica direção.",
  },

  canvas: {
    one_line_pitch: "OsFriends: conversas boas com gente interessante, em mesas pequenas e curadas, com o celular fora da mesa.",
    value_proposition_canvas: {
      segment: "Adultos de 28 a 50 em São Paulo com solidão intelectual (recém-chegados e quem tem o círculo reduzido)",
      customer_profile: { jobs: L("Ter conversas que valham a pena", "Fazer amigos adultos"), pains: L("Conversa rasa", "Eventos com cara de networking", "Insegurança com estranhos"), gains: L("Amizade com profundidade", "Rotina de encontros", "Oportunidades como consequência") },
      value_map: { products_services: L("Mesas curadas com tema", "Briefing, perguntas e resumo com apoio de IA"), pain_relievers: L("Candidatura e verificação", "Preço visível e atendimento humano", "Celular fora da mesa"), gain_creators: L("Match por tema", "Reconexão pós-encontro", "Troca de contribuições (netweaving)") },
      fit_assessment: { score_0_100: 70, gaps: L("Quem enjoa do mesmo grupo", "Medo do encontro às cegas", "Quantos encontros o preço inclui") },
    },
    business_model_canvas: {
      customer_segments: L("Recém-chegados à cidade", "Adultos de 28 a 50 curiosos", "Círculos de nicho (livros, vinho, tecnologia)"),
      value_propositions: L("Conversas boas com gente interessante", "Curadoria e confiança", "Mesa pequena e celular fora"),
      channels: L("Rede própria (alunos, Nuia, podcast, PUC Angels)", "Nano-influenciadores fundadores", "Os próprios locais parceiros", "Indicação de membro"),
      customer_relationships: L("WhatsApp", "Anfitrião e IA de apoio", "Reconexão pós-encontro", "Sugestão de novos círculos"),
      revenue_streams: L("Assinatura de membro", "Ingressos de encontros especiais", "Comissão dos locais", "Cupons e patrocínio de marcas"),
      key_resources: L("Curadoria e base de membros", "Parceiros", "IA de apoio"),
      key_activities: L("Candidatura e validação", "Montagem de mesas", "Operação dos encontros"),
      key_partnerships: L("Cafés, bares de vinho e livrarias", "Nano-influenciadores", "ACIM"),
      cost_structure: L("Item incluso no parceiro", "Coordenação", "Pagamentos e ferramentas", "Seguro e jurídico", "Marketing"),
    },
  },

  viability: {
    financial: {
      assumptions: { price_monthly: 69, cogs_pct: 38, churn_monthly_pct: 10, cac: 60, fixed_costs_monthly: 7000, initial_investment: 15000, new_customers_month1: 25, new_customers_growth_pct: 10 },
      rationale: {
        price_monthly: "Entre a disposição a pagar mediana sintética (R$ 70) e o Timeleft (R$ 59,99)",
        cogs_pct: "Item incluso ≈ R$ 15 × 1,5 encontro/mês + pagamentos + IA. Só vale se a IA substituir o anfitrião pago",
        churn_monthly_pct: "Premissa; é a hipótese H8 e precisa ser medida no piloto",
        cac: "Mistura de rede própria (barato) e canais pagos",
        fixed_costs_monthly: "Coordenação parcial, ferramentas, marketing fixo, jurídico e seguro",
        initial_investment: "Piloto manual, landing, parceiros e 3 a 4 mesas",
        growth: "CASO BASE OTIMISTA: ignora limite de curadoria. Para planejar, teste: R$ 60, CAC 90, churn 12%, 15 novos/mês, +6% (cenário conservador: breakeven só no mês 27).",
      },
      cost_breakdown: [{ item: "Coordenação parcial", monthly: 4000 }, { item: "Ferramentas", monthly: 800 }, { item: "Marketing fixo", monthly: 1500 }, { item: "Jurídico e seguro", monthly: 700 }],
      funding_notes: "Se um anfitrião humano pago for necessário em toda mesa, o custo variável vai a ~70% e o breakeven vai ao mês 19 (caixa mínimo ≈ -R$ 99 mil).",
      risks: L("Margem some se o anfitrião humano for pago em toda mesa", "Churn alto se a primeira mesa não for ótima", "Crescimento limitado pela curadoria"),
    },
    technology: {
      recommended_stack: [{ layer: "Candidatura", choice: "Tally ou Typeform", why: "Sem código" }, { layer: "Pagamento", choice: "Pix via Mercado Pago ou Asaas", why: "Cobrança recorrente simples" }, { layer: "Comunicação", choice: "WhatsApp Business", why: "Onde o grupo já está" }, { layer: "Dados e matching", choice: "Airtable ou Notion", why: "Matching manual no começo" }, { layer: "IA de apoio", choice: "Claude", why: "Briefing, perguntas e resumo" }],
      build_vs_buy: [{ capability: "Candidatura e pagamento", decision: "comprar", note: "Ferramentas prontas" }, { capability: "Matching de mesas", decision: "construir", note: "Manual primeiro, automatizar depois" }, { capability: "Anfitriã de IA", decision: "integrar", note: "Prompts e fluxo simples" }],
      complexity: "baixa",
      team_needed: L("1 coordenador de operação", "Apoio de desenvolvimento só quando automatizar"),
      mvp_time_weeks: 4, mvp_cost_estimate_brl: 6500,
      technical_risks: [{ risk: "LGPD com identidade e LinkedIn", mitigation: "Coletar o mínimo, consentimento claro e guarda segura" }, { risk: "Segurança nas mesas", mitigation: "Verificação, regras de conduta e canal humano" }, { risk: "Limites do WhatsApp", mitigation: "Lista de transmissão e mensagens pessoais no início" }],
      ai_or_data_needs: "Claude para briefing, perguntas durante o encontro e resumo; sem treinamento próprio.",
      compliance: L("LGPD", "Termos de uso e conduta", "Seguro de eventos"),
      feasibility_verdict: "Tecnicamente simples: o risco está na operação, na segurança e na liquidez de membros, não na tecnologia.",
    },
  },

  score: {
    scores: { desirability: 66, market: 62, financial: 58, technology: 88, evidence: 45 },
    rationale: {
      desirability: "Intenção média 6,4/10 e 5 de 8 com intenção ≥ 7, mas H3 (exclusividade) foi contradita.",
      market: "Há espaço entre apps rasos e clubes caros, mas o Timeleft é conhecido e há muitos substitutos grátis.",
      financial: "A conta só fecha se a IA substituir o anfitrião pago e o churn ficar baixo; o caso base é otimista.",
      technology: "Baixa complexidade, dá para fazer um MVP sem código em 4 semanas.",
      evidence: "Tudo é sintético, e a sua rede pode inflar o piloto (S5).",
    },
    strengths: L("Tecnologia simples", "Posicionamento claro", "Celular fora da mesa e confiança como diferenciais"),
    red_flags: L("Público sintético", "Viés da sua rede (S5)", "Dependência da IA no lugar do anfitrião pago", "‘Exclusividade’ pode afastar os mais jovens", "Nome parecido com a série Friends (risco de marca)"),
    pivot_options: L("Clubes de leitura e vinho com curadoria", "Foco em recém-chegados à cidade", "Plano pago pelas empresas (benefício de bem-estar)"),
    next_validation_steps: L("1) Fechar 2 locais parceiros com item ≤ R$ 15", "2) Pré-venda com preço e nº de encontros visíveis (meta 40 pagantes, metade de fora da rede)", "3) 3 a 4 mesas-piloto", "4) Testar IA de apoio vs. anfitrião humano discreto", "5) Consultar o nome no INPI e verificar domínio e @"),
    recommendation: "ajustar e retestar",
    recommendation_text: "Nota abaixo do corte de 70. O scorecard libera o piloto manual (já decidido), não um app. Se duas ou mais metas do piloto falharem, pivote em vez de construir.",
  },

  mvp: {
    mvp_goal: "Provar que desconhecidos pagam e voltam para uma mesa curada.",
    mvp_type: "concierge",
    scope: {
      must: [
        { feature: "Landing com candidatura e pré-venda", user_story: "Como candidato, quero ver preço, número de encontros e regras antes de pagar", acceptance: ["Preço e nº de encontros visíveis", "Pagamento por Pix", "Confirmação por WhatsApp"] },
        { feature: "Montagem manual de mesas", user_story: "Como membro, quero ser colocado numa mesa com interesses parecidos", acceptance: ["Mesas de 6", "Tema definido", "Equilíbrio de perfis"] },
        { feature: "Encontro com apoio de IA", user_story: "Como membro, quero perguntas que aprofundem a conversa sem celular na mesa", acceptance: ["Briefing antes", "Perguntas durante", "Resumo depois"] },
      ],
      should: L("Pesquisa de satisfação após o encontro", "Lista de espera por círculo"),
      could: L("Indicação de membro com benefício", "Ingresso para encontro especial"),
      wont_now: L("App próprio", "Matching automático", "Vários clubes ao mesmo tempo"),
    },
    success_metrics: [
      { metric: "Pagantes na pré-venda (14 dias)", target: "≥ 40, metade de fora da rede", how_to_measure: "Pagamentos e origem da inscrição" },
      { metric: "Comparecimento", target: "≥ 80%", how_to_measure: "Presença por mesa" },
      { metric: "Nota do encontro e vontade de rever", target: "≥ 4,5/5 e ≥ 70% querem rever a mesa", how_to_measure: "Formulário pós-encontro" },
      { metric: "Retorno ao 2º encontro", target: "≥ 60%", how_to_measure: "Reinscrições" },
      { metric: "Custo do item no parceiro", target: "≤ R$ 15 por pessoa", how_to_measure: "Acordo com os locais" },
    ],
    pivot_or_persevere_rules: "Seguir se a maioria das metas for atingida. Se duas ou mais falharem, pivotar para clubes de leitura e vinho com curadoria ou para recém-chegados.",
    roadmap: [
      { phase: "Semanas 1-2", goals: L("Fechar 2 locais parceiros", "Landing e pré-venda no ar", "Consulta do nome no INPI") },
      { phase: "Semanas 3-6", goals: L("3 a 4 mesas-piloto, metade de fora da rede", "Teste de IA de apoio vs. anfitrião humano") },
      { phase: "Semanas 7-12", goals: L("Medir retorno no 2º e 3º encontros", "Decidir: seguir, ajustar ou pivotar") },
    ],
    architecture: "Sem código: Tally, Pix, WhatsApp Business, Airtable/Notion e Claude para briefing, perguntas e resumo.",
    budget_brl: 6500,
    risks_next: L("Segurança nas mesas", "LGPD", "Churn", "Risco de marca"),
    first_users_plan: "Sua rede (alunos, Nuia, podcast, PUC Angels e mentorias) para metade das vagas e nano-influenciadores fundadores para a outra metade, de fora da rede.",
  },
};
