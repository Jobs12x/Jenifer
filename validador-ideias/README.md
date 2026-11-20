# Validador de Ideias

Web app (Next.js + Claude API) que valida ideias de negócio com Design Thinking, Lean Startup, Canvas e análise financeira/tecnológica, usando **dados sintéticos gerados por IA**.

## Fluxo
1. **Ideia e hipóteses** – você informa a ideia, o problema e as hipóteses; define a nota de corte (padrão 70).
2. **Incertezas** – classificação (desejabilidade/viabilidade/exequibilidade), matriz impacto × evidência, experimentos Lean e Design Thinking.
3. **Mercado, concorrentes e SWOT** – TAM/SAM/SOM, concorrentes, lacuna competitiva, SWOT cruzado.
4. **Público sintético** – 8 personas sintéticas reagem a cada hipótese; agregados calculados no app.
5. **Canvas** – Value Proposition Canvas e Business Model Canvas.
6. **Viabilidade** – premissas financeiras editáveis, projeção de 36 meses (LTV/CAC, breakeven, payback) e viabilidade tecnológica.
7. **Scorecard / gate** – nota ponderada (Desejabilidade 25, Mercado 20, Financeiro 25, Tecnologia 15, Evidência 15).
8. **Protótipo clicável** (HTML) e 9. **Especificação do MVP** – liberados após o scorecard (aviso se abaixo do corte).

> Público e estimativas de mercado são sintéticos: servem para estruturar hipóteses, não substituem pesquisa real.

## Rodar
```bash
cp .env.example .env.local   # coloque sua ANTHROPIC_API_KEY
npm install
npm run dev                  # http://localhost:3000
```
Modelo padrão: `claude-opus-5-5` (troque com `ANTHROPIC_MODEL`). Projetos ficam no `localStorage` do navegador.

## Estrutura
- `lib/stages.ts` – prompts de cada etapa · `lib/finance.ts` – projeção e scorecard (determinísticos)
- `app/api/stage/route.ts` – chamada à Claude API · `components/Views.tsx` – telas dos resultados
