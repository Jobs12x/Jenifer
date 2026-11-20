import type { Json } from "./types";

const n = (v: any, d = 0) => (typeof v === "number" && isFinite(v) ? v : d);

/** Projeção determinística de 36 meses a partir das premissas sugeridas pela IA (editáveis). */
export function project36(a: Json) {
  const price = n(a.price_monthly);
  const cogsPct = n(a.cogs_pct) / 100;
  const churn = Math.min(Math.max(n(a.churn_monthly_pct) / 100, 0.001), 1);
  const cac = n(a.cac);
  const fixed = n(a.fixed_costs_monthly);
  const invest = n(a.initial_investment);
  const newStart = n(a.new_customers_month1);
  const growth = n(a.new_customers_growth_pct) / 100;

  let customers = 0;
  let cumulative = -invest;
  let breakevenMonth: number | null = null;
  let paybackMonth: number | null = null;
  const rows: { month: number; customers: number; revenue: number; profit: number; cumulative: number }[] = [];

  for (let m = 1; m <= 36; m++) {
    const added = newStart * Math.pow(1 + growth, m - 1);
    customers = customers * (1 - churn) + added;
    const revenue = customers * price;
    const profit = revenue * (1 - cogsPct) - added * cac - fixed;
    cumulative += profit;
    if (breakevenMonth === null && profit > 0) breakevenMonth = m;
    if (paybackMonth === null && cumulative >= 0) paybackMonth = m;
    rows.push({ month: m, customers, revenue, profit, cumulative });
  }
  const ltv = (price * (1 - cogsPct)) / churn;
  return {
    rows,
    breakevenMonth,
    paybackMonth,
    ltv,
    ltvCac: cac > 0 ? ltv / cac : null,
    minCash: Math.min(...rows.map((r) => r.cumulative), -invest),
    revenueY1: rows.slice(0, 12).reduce((s, r) => s + r.revenue, 0),
    revenueY3: rows.slice(24, 36).reduce((s, r) => s + r.revenue, 0),
  };
}

export function weightedScore(scores: Record<string, number>, weights: Record<string, { weight: number }>) {
  let total = 0;
  let w = 0;
  for (const k of Object.keys(weights)) {
    total += Math.min(Math.max(n(scores[k]), 0), 100) * weights[k].weight;
    w += weights[k].weight;
  }
  return Math.round(total / w);
}

/** Agrega a pesquisa sintética com o público: intenção média e concordância por hipótese. */
export function aggregateAudience(audience?: Json) {
  const personas: Json[] = audience?.personas ?? [];
  const reactions: Json[] = audience?.reactions ?? [];
  const byHyp: Record<string, { sum: number; count: number }> = {};
  for (const r of reactions) {
    const id = String(r.hypothesis_id);
    byHyp[id] ??= { sum: 0, count: 0 };
    byHyp[id].sum += n(r.agreement);
    byHyp[id].count += 1;
  }
  const hypotheses = Object.entries(byHyp).map(([id, v]) => ({ id, avg: v.count ? v.sum / v.count : 0 }));
  const intents = personas.map((p) => n(p.purchase_intent));
  const avgIntent = intents.length ? intents.reduce((a, b) => a + b, 0) / intents.length : 0;
  const wouldBuy = intents.filter((i) => i >= 7).length;
  const wtp = personas.map((p) => n(p.willingness_to_pay)).filter((x) => x > 0).sort((a, b) => a - b);
  const medianWtp = wtp.length ? wtp[Math.floor(wtp.length / 2)] : 0;
  return { hypotheses, avgIntent, wouldBuy, total: personas.length, medianWtp };
}
