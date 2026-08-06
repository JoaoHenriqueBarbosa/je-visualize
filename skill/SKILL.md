---
name: visualize
description: "Use esta skill sempre que o dono pedir para desenhar, diagramar ou visualizar algo que ele precise compreender visualmente — conceitos, sistemas, processos, taxonomias, filosofias, circuitos, qualquer assunto. Gatilhos: 'desenha', 'diagrama', 'visualiza', 'faz um flow', 'quero ver isso', menções ao je-visualize ou a alguma visualização existente (samkhya, eletronica). O resultado vai para o site je-visualize (React Flow + motor de layout próprio), nunca para mermaid/SVG soltos no chat."
---

# visualize — diagramas que viram parte do je-visualize

O dono mantém **je-visualize** (github.com/JoaoHenriqueBarbosa/je-visualize),
um site de visualizações sob encomenda. Quando ele pede um desenho para
compreender algo, o trabalho é criar ou estender uma visualização lá — não
gerar mermaid, não gerar SVG avulso, não fazer artifact.

Deploy: Vercel, a partir da `main`. Push na main = publicado.

## Setup em chat novo

```bash
export PATH="$HOME/.bun/bin:$PATH"   # SEMPRE, a cada invocação de bash
curl -fsSL https://raw.githubusercontent.com/JoaoHenriqueBarbosa/je-visualize/main/scripts/setup.sh | bash
cd je-visualize
```

O setup é idempotente: instala bun se faltar, clona, `bun install`, garante
chromium do Playwright (respeita `PLAYWRIGHT_BROWSERS_PATH` se o sandbox já
trouxer um), build, preview e auditoria completa. Se terminar em "Geometria
limpa", o ambiente está inteiro.

Credenciais de push: **ler a skill do github do dono**
(`/mnt/skills/user/github/SKILL.md`) e usar o token de lá no remote https.
O token NUNCA entra em arquivo versionado — o repo é público. Sempre
filtrar o token da saída de comandos git (`| sed "s/${GITHUB_TOKEN}/***/g"`).

## Arquitetura em uma tela

```
/                       lista as visualizações (coleções) — tema neutro
/samkhya                página de uma coleção, lista seus diagramas
/samkhya/antahkarana    um diagrama (flow)

src/collections/        CollectionSpec: slug, title, blurb, theme, flows[]
src/flows/              FlowSpec: nodes, edges, groups — declarativo
src/flow/               motor: types.ts, layout.ts, Measurer, FlowCanvas
src/styles/globals.css  SÓ tamanhos (espaço, corpo, raio, largura de cartão)
src/styles/pages.css    estrutura das páginas sobre variáveis — sem cor
src/flow/flow.css       estrutura do canvas sobre variáveis — sem cor
src/styles/themes/      um css por tema, escopado por classe
scripts/audit.mjs       auditoria geométrica via Playwright
scripts/setup.sh        este setup
```

## O contrato (src/flow/types.ts) — ler antes de escrever qualquer flow

O spec é **declarativo e nunca contém pixel**. Campos do nó:

- `label` (obrigatório): nome principal. `script` (opcional): grafia nativa
  ou símbolo — devanāgarī, `∧`, o que o assunto tiver. Nem todo assunto tem.
- `gloss`: termo técnico curto. `detail`: parágrafo. Sem `detail` +
  `variant: "compact"` = cartão pequeno (fileiras de irmãos, tabelas).
- `accent`: cor do filete. `round`: para o que está fora do sistema
  (ātman, puruṣa) — cada tema decide o que "round" significa.
- **Controle espacial é só topológico**: `column` (faixa vertical; 0 é o
  eixo, negativos à esquerda) e `rank` (fixa a camada quando nenhuma aresta
  de fluxo a deriva — fileiras de irmãos precisam disso).
- `group`: id da moldura. Um grupo ocupa um **bloco retangular** da grade;
  se um nó de fora cair dentro do bloco, o motor avisa no console
  (`[layout] "x" cai dentro do bloco do grupo "y"`) e a moldura vai passar
  por cima. O problema é topológico: mover coluna/rank, não esperar padding.

Arestas — o `kind` importa muito:
- `flow`: avança camada; é o que define a ordenação topológica.
- `aside`: relação lateral, mesma camada.
- `feedback`: retorno; **sai da ordenação** para não criar ciclo.
- `illumine`: presença não-causal (consciência, observador); pontilhado.
- `label` de aresta reserva corredor de verdade: o motor mede o texto e
  dimensiona o vão. Rótulo comprido = vão largo. Seja curto.

Lição de topologia que custou caro: **ramos irmãos correm em paralelo, não
empilhados**. Se dois encadeamentos saem do mesmo nó, dar a eles os mesmos
ranks em colunas diferentes — declará-los em ranks sequenciais cria arestas
compridas atravessando canvas vazio. Sequência no spec deve significar
sequência no assunto.

## O motor (src/flow/layout.ts) — o que ele garante e o que não

Sete passadas: ordenação por caminho mais longo (ranks pinados respeitados),
grade, vãos dimensionados pelos rótulos **medidos no DOM**, molduras
(padding SOMADO ao vão da borda, nunca disputado com o rótulo), posições,
compactação lateral (recolhe a sobra quando um cartão `full` infla a coluna
de `compact`s), lados de borda derivados da geometria final.

Consequências práticas:
- Mudar CSS que afete tamanho de cartão ou de rótulo **muda o layout** — o
  motor mede com o CSS real. Depois de mexer em estilo: re-auditar.
- As larguras `--card-w-full`/`--card-w-compact` vivem em globals.css por
  isso: são entrada do motor, não decoração.
- A compactação recolhe folga; ela **não conserta topologia ruim**. Diagrama
  espalhado com auditoria verde = revisar column/rank no spec.

## Estilo — três camadas, nunca misturar

1. `globals.css`: SÓ tamanho. Nunca cor, nunca família tipográfica.
2. `pages.css` + `flow.css`: estrutura consumindo variáveis
   (`var(--ink)`, `var(--font-body)`...). Nunca valor cravado.
3. `themes/*.css`: um por visualização, escopado
   (`.theme-eletronica { --bg: ...; }` + overrides específicos).

Regras aprendidas quebrando:
- **Nenhuma cor em JS.** O FlowCanvas já teve `#b5ae9f` cravado e vazou de
  um tema para o outro; pior, o rótulo era desenhado com fonte diferente da
  medida. Cor e fonte de rótulo de aresta ficam em
  `.react-flow__edge-text` no flow.css, via variáveis.
- O `body` não tem classe de tema. A página (`.page`) pinta o fundo inteiro
  e a medida de leitura fica num `.wrap` interno — sem isso aparece faixa
  sem cor em volta da coluna.
- Home raiz = `theme-root`, neutra, é índice e não capa. Não tematizar.

## Criar uma visualização nova (coleção)

1. `src/flows/<assunto>.ts` — os FlowSpecs.
2. `src/collections/<assunto>.ts` — CollectionSpec com
   `theme: "theme-<assunto>"`. `script` da coleção é opcional.
3. Registrar em `src/collections/index.ts` (import + array).
4. `src/styles/themes/<assunto>.css` — definir TODAS as variáveis (copiar um
   tema existente como checklist: bg, ink, ink-soft, body, dim, faint, line,
   line-hover, card-bg, card-bg-hover, card-shadow, card-radius, rule,
   rule-strong, frame-border, frame-style, frame-bg, legend, legend-dim,
   edge-ink, font-body, font-display, font-script, gloss-style).
   Variável faltando = cor herdada de fora ou transparente.
5. Registrar o tema em `src/index.css` (@import).
6. Rotas, home e auditoria descobrem sozinhas — nada de cadastro além do
   index de coleções.

Estender uma coleção existente: só passos 1 e o array `flows` dela.

## Ciclo de verificação — obrigatório, nesta ordem

```bash
export PATH="$HOME/.bun/bin:$PATH"
bunx tsc --noEmit
bun run build
pkill -f "vite preview"; sleep 1; (nohup bun run preview >/tmp/p.log 2>&1 &); \
  sleep 5; bun run audit <visualização>
```

- Preview e audit **no mesmo comando bash**: o processo em background morre
  entre invocações neste tipo de ambiente. Já causou ERR_CONNECTION_REFUSED
  duas vezes.
- Audit escopado (`bun run audit eletronica`) ao mexer numa só; suíte
  completa antes do push. Slug errado falha cedo e lista os disponíveis.
- A auditoria reprova 4 coisas: cartão×cartão, moldura não contém membro,
  moldura invade estranho, rótulo×cartão. **Ela não reprova feiura.**
- Por isso: **abrir os PNGs com a ferramenta de view** —
  `shots/<visualização>/<diagrama>.png` — e olhar de verdade. Espalhamento,
  vazios, assimetria, aresta atravessando o nada: só o olho pega. Screenshot
  é prova fraca de correção, mas é a única prova de estética.
- Auditoria verde + PNG conferido = pode commitar.

## Git

- Trabalho direto na `main` para mudanças pequenas; branch para mudanças de
  motor ou reformas (o dono decide merge — dá para ver o preview da Vercel
  no branch antes).
- Mensagens de commit em português, corpo explicando o PORQUÊ e o que
  quebrou no caminho. É o registro de decisões do projeto — os commits
  existentes são o modelo.
- `git config user.name "JoaoHenriqueBarbosa"` e
  `user.email "joaohenriquebarbosa21@gmail.com"` no clone novo.
- `shots/` não é versionado. `dist/` não é versionado.

## Conteúdo dos diagramas

- O texto dos cartões é parte do trabalho, não enfeite: `detail` de 2-4
  linhas, denso, no registro do assunto. Rodapés (`footer`) carregam a
  síntese e as ressalvas.
- Idioma: português, com a terminologia nativa do assunto (IAST com
  diacríticos para sânscrito, símbolos para lógica, etc.).
- Na dúvida sobre escopo ou recorte do assunto, perguntar antes de
  construir; na dúvida sobre layout, construir, auditar, olhar o PNG e
  ajustar — o ciclo é barato.
