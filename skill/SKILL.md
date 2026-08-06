---
name: visualize
description: "Use esta skill sempre que o dono pedir para desenhar, diagramar ou visualizar algo que ele precise compreender visualmente — conceitos, sistemas, processos, taxonomias, filosofias, circuitos, dados, debates, qualquer assunto. Gatilhos: 'desenha', 'diagrama', 'visualiza', 'faz um flow', 'quero ver isso', menções ao je-visualize ou a alguma visualização existente (samkhya, eletronica). O resultado vai para o site je-visualize (nove tipos de visualização: flows simulados, comparativo, autômato, registros, ciclo, escala, sankey, venn, explodido — escolher o tipo RICO que o assunto pede, nunca empobrecer para flow estático por inércia), jamais mermaid/SVG soltos no chat."
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

src/collections/        CollectionSpec: slug, title, blurb, theme, vizes[]
src/viz/                VizSpec: união discriminada por `kind` (default "flow");
                        a VizPage despacha o corpo pelo kind
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

### Simulação (src/viz/sim.ts) — flows que conduzem

Três campos opcionais no nó ligam a simulação do flow inteiro (a ausência
dos três mantém o flow estático):

- `input: { initial, cycle? }` — cartão clicável; clique alterna pelo ciclo
  (default `[0, 1]`).
- `compute: (v) => valor` — deriva dos valores correntes por id. Avaliado
  por relaxamento: pode ler qualquer nó, ciclos (latch) estabilizam ou
  param no limite de passadas.
- `activeWhen: (v) => bool` — acende o cartão enquanto vale (linha viva da
  tabela verdade).

As funções são dado do assunto e moram no spec, como os accents. Regras:
aresta `flow` com origem truthy fica viva; `aside`/`illumine` nunca — são
anotação e presença, não condução. O valor aparece num badge **absoluto**
(não participa da caixa: simulação nunca muda a medida). Estado dos inputs
vai para a URL (`?sim=a:1,b:0`) — toda configuração é um link.

Modo foco (todo flow, sem spec): clique num cartão sem `input` ilumina seu
fecho causal — ancestrais ∪ descendentes por arestas `flow` apenas — e
esmaece o resto. Esc ou clique no fundo desfaz. URL: `?foco=id`. No
sāṃkhya isso é doutrina de graça: puruṣa entra por `illumine` e nunca é
incluído no fecho de ninguém.

A auditoria tem uma passada semântica: em flow simulado ela clica cada
combinação de entradas e cobra coerência entre `window.__sim*` e o DOM
(badge, `.is-on`, `.is-active`). Um flow que desenha certo mas conduz
errado reprova. O screenshot sai na última combinação (tudo em 1), de
propósito: a prova visual é o circuito energizado.

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

## Escolher o tipo — o assunto manda, e rico vence simples

`VizSpec` é união discriminada; `kind` ausente = flow. Cada kind tem
renderizador em `src/viz/` e a VizPage despacha sozinha.

**A armadilha número um deste projeto agora é a pobreza**: ter nove tipos e
entregar um flow estático por inércia. Antes de escrever qualquer spec,
passar o assunto pela bateria — cada "sim" é uma capacidade que o leitor
perde se você não usar:

1. **Algo RESPONDE a algo?** (mudo a entrada, o resto muda) → simulação
   no flow: `input`/`compute`/`activeWhen`, arestas vivas.
2. **Há quantidade fluindo, dividindo, somando?** → `sankey`.
3. **Há estados e acontecimentos que os mudam?** → `machine`.
4. **Há muitos itens comparáveis entre si?** → `records`.
5. **O fim volta ao começo?** → `cycle`.
6. **Existe um eixo contínuo onde a posição É o valor?** → `scale`.
7. **Categorias se contêm ou se sobrepõem?** → `venn`.
8. **É um objeto com partes/camadas para apontar?** → `exploded`.
9. **Dois arranjos respondem diferente à MESMA entrada?** → `compare`.
10. **Há sinal/série para desenhar no tempo?** → `chart` num cartão.
11. **É denso, ou tem ordem natural de apresentação?** → `steps`.
12. **É um debate, uma prova, uma controvérsia?** → `supports`/`attacks`.

Se duas ou mais respondem sim, o assunto pede mais de um tipo — **uma
coleção madura mistura tipos** (o sāṃkhya tem seis; a eletrônica, cinco).
Um pedido de "diagrama" quase nunca é pedido de flow estático: é pedido de
compreensão, e compreensão usa o que houver.

### O que encaixa em cada um (exemplos para destravar, não lista fechada)

- **flow simulado** — tudo que conduz, deriva ou dispara: circuitos;
  requisitos legais cumulativos (um contrato válido É uma AND); critérios
  diagnósticos; regras de acentuação; harmonia funcional (escolho o acorde,
  a função muda); precedência de operadores; fluxo de aprovação; receitas
  com proporções (dobro a farinha, o resto recalcula).
- **compare** — duas escolas respondendo à mesma pergunta; dois algoritmos
  sobre o mesmo dado; duas conjugações do mesmo verbo; dois sistemas
  jurídicos ante o mesmo caso; a mesma frase em duas análises sintáticas.
- **machine** — estágios de doença; fases do processo civil; ciclo de vida
  de inseto; aspecto verbal; estados da matéria com eventos de calor;
  protocolos (TCP, OAuth); jogos e regras; níveis de meditação com o que
  avança e o que regride. Botão mudo é doutrina: terminal, irreversível,
  pré-requisito — a máquina afirma isso sozinha.
- **records** — elementos químicos; obras de um autor; espécies; imperadores
  e dinastias; ferramentas de um ofício; vocabulário por família; compassos
  e andamentos; vinhos por safra. Se tem "N coisas com os mesmos campos", é
  records — e gantt/kanban vêm de graça com os campos certos.
- **cycle** — Krebs, água, carbono, nitrogênio; estações; fases da lua;
  quintas musicais; saṃsāra; ciclo econômico; respiração; realimentação de
  qualquer espécie onde a volta é o assunto.
- **scale** — pH; espectro eletromagnético; decibéis; dureza de Mohs;
  escalas log (potências de dez, magnitude sísmica); faixas etárias ou de
  renda com marcas legais; datação geológica; zonas de temperatura.
- **sankey** — orçamento; matriz energética; calorias de um prato; funil de
  conversão; migração; votos entre turnos; de onde vem e para onde vai
  qualquer coisa contável. Se o assunto tem um "quanto", a espessura é dele.
- **venn** — pertencimento que se cruza ou se aninha: empréstimos entre
  línguas; competências de entes federativos; classificações taxonômicas
  concorrentes; o que é ao mesmo tempo X e Y (e o que só é X).
- **exploded** — célula; motor; instrumento musical; camadas de rede (OSI);
  estratos geológicos; seção de um prédio; anatomia de um soneto; um prato
  montado. Qualquer coisa que se aponta com o dedo dizendo "isto aqui é".
- **chart em cartão** — qualquer grandeza no tempo ou por categoria dentro
  de um diagrama maior: sinal, envelope sonoro, série histórica, resposta a
  degrau. O instrumento observa nós da simulação via `watch`.
- **steps** — todo diagrama com mais de ~15 nós merece a pergunta "qual é a
  ordem de contar isto?". A câmera segue os passos (zoom e pan enquadram o
  revelado): começa apertado, termina aberto.
- **supports/attacks** — provas filosóficas; controvérsias científicas;
  jurisprudência divergente; revisão por pares; qualquer lugar onde a
  ESTRUTURA do desacordo é o conteúdo.

Referências vivas de cada tipo no próprio repo: portas (sim), tattvas
(steps), prova-purusha (argumento), serie-vs-paralelo (compare),
tattvabhyasa (machine), darsanas (records), oscilador-anel (cycle),
niveis-logicos (scale), contagem (sankey), pramana-escolas (venn), mosfet
(exploded), osciloscopio (chart).

Estado de leitura na URL, um padrão por kind: ?sim= ?foco= ?estado=
?vista= ?passo=. Toda configuração é um link — projete o conteúdo sabendo
que qualquer estado interessante pode ser compartilhado.

Regra de distribuição de conteúdo: o que demonstra máquina nova se
reparte entre as coleções — não concentrar tudo numa só; se nenhum
assunto encaixar, criar coleção nova.

## Criar uma visualização nova (coleção)

1. `src/flows/<assunto>.ts` — os FlowSpecs.
2. `src/collections/<assunto>.ts` — CollectionSpec com
   `theme: "theme-<assunto>"`. `script` da coleção é opcional.
3. Registrar em `src/collections/index.ts` (import + array).
4. `src/styles/themes/<assunto>.css` — definir TODAS as variáveis que a
   estrutura consome. O checklist é executável: `bun run lint` roda o
   theme-lint, que cobra cada variável faltante por tema (copiar um tema
   existente como ponto de partida). Variável faltando = cor herdada de
   fora ou transparente — e agora, lint vermelho.
5. Registrar o tema em `src/index.css` (@import).
6. Rotas, home e auditoria descobrem sozinhas — nada de cadastro além do
   index de coleções.

Estender uma coleção existente: só passos 1 e o array `flows` dela.

## Ciclo de verificação — obrigatório, nesta ordem

```bash
export PATH="$HOME/.bun/bin:$PATH"
bunx tsc --noEmit
bun run lint     # oxlint + theme-lint: cobra cada variável de tema faltante
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
