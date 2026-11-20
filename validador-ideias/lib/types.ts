export type Json = Record<string, any>;

export interface Intake {
  name: string;
  idea: string;
  problem: string;
  audience: string;
  solution: string;
  location: string;
  revenueHint: string;
  budget: string;
  hypotheses: string[]; // uma por item, trazidas pelo usuário
  threshold: number; // nota de corte do gate (0-100)
}

export type StageId =
  | "uncertainties"
  | "market"
  | "audience"
  | "canvas"
  | "viability"
  | "score"
  | "prototype"
  | "mvp";

export interface Project {
  id: string;
  createdAt: number;
  intake: Intake;
  uncertainties?: Json;
  market?: Json;
  audience?: Json;
  canvas?: Json;
  viability?: Json;
  score?: Json;
  prototype?: { html: string };
  mvp?: Json;
}

export const emptyIntake = (): Intake => ({
  name: "",
  idea: "",
  problem: "",
  audience: "",
  solution: "",
  location: "Brasil",
  revenueHint: "",
  budget: "",
  hypotheses: ["", "", ""],
  threshold: 70,
});

export const SCORE_WEIGHTS: Record<string, { label: string; weight: number }> = {
  desirability: { label: "Desejabilidade (público quer?)", weight: 25 },
  market: { label: "Mercado e concorrência", weight: 20 },
  financial: { label: "Viabilidade financeira", weight: 25 },
  technology: { label: "Viabilidade tecnológica", weight: 15 },
  evidence: { label: "Força das hipóteses testadas", weight: 15 },
};
