# je-visualize

Visualizações construídas sob encomenda. Cada assunto pedido vira uma **coleção**: um corpo de visualizações com esquema declarado e layout medido.

```
/                        as coleções
/samkhya                 as visualizações de um assunto
/samkhya/tattvas         uma visualização
```

## Coleções

**sāṃkhya** — dez visualizações: kaivalya, a prova do puruṣa (mapa argumentativo), os 25 tattvas (com passeio narrado), a contabilidade da criação (sankey), triguṇa, antaḥkaraṇa, pramāṇa, pramāṇa entre escolas (venn aninhado), tattvābhyāsa (autômato) e os seis darśanas (registros).

**eletrônica** — onze: as seis portas lógicas simuladas (clique nas entradas — os diagramas conduzem), série ‖ paralelo (comparativo sincronizado), o osciloscópio (charts alimentados pela simulação), o oscilador em anel (layout polar), os níveis lógicos (escala) e o MOSFET em corte (explodido).

## Os tipos

`VizSpec` (`src/viz/types.ts`) é uma união discriminada por `kind` — a união não lista intenções, lista o que existe com renderizador e conteúdo:

- **flow** — o fundador: nós, arestas e grupos, com simulação opcional (`input`/`compute`/`activeWhen`), charts em cartões, modo foco, passeio narrado (`steps`) e vocabulário argumentativo (`supports`/`attacks`).
- **compare** — dois flows com inputs compartilhados por id: alternar num lado alterna nos dois.
- **machine** — autômato: estados, eventos como botões, transições; botão mudo é conteúdo.
- **records** — campos + linhas + vistas: tabela, kanban e gantt são projeções do mesmo dado.
- **cycle** — anel com centro opcional, no primeiro posicionador não-cartesiano do motor.
- **scale** — eixo contínuo: a posição é o valor.
- **sankey** — fluxo com quantidade: a espessura é o valor.
- **venn** — conjuntos aninhados: cada anel é o que o de fora acrescenta.
- **exploded** — figura em grade com legendas ancoradas por cor.

Todo estado de leitura vai para a URL: `?sim=a:1,b:0`, `?foco=manas`, `?estado=abhyasa`, `?vista=kanban`, `?passo=4`. Toda configuração é um link.

## Estilo

`src/styles/globals.css` só tem tamanho — escala de espaço, corpo de texto, altura de linha, raio, largura de cartão. Nenhuma cor, nenhuma família tipográfica. As larguras de cartão moram lá porque não são decoração: o motor mede os cartões no DOM antes de posicionar.

Aparência é tema escopado por classe, declarado no spec da coleção (`theme: "theme-eletronica"`). A estrutura (`pages.css`, `flow.css`, `records.css`, `geo.css`) é pura sobre variáveis; os temas as preenchem — e o theme-lint cobra cada variável faltante. Accents são dado do spec, nunca do tema: o mesmo princípio guarda a mesma cor em qualquer diagrama.

## O motor

Sete passadas em `src/flow/layout.ts`: ordem por caminho mais longo com nós pinados, grade, vãos dimensionados pelos rótulos medidos, molduras, posições, compactação lateral, lados de borda derivados da geometria final. Os cartões são medidos no DOM com o CSS real antes de qualquer decisão de posição.

O polar (`src/viz/layouts/polar.ts`) segue a mesma disciplina: o raio é derivado das medidas.

A simulação (`src/viz/sim.ts`) roda por relaxamento — ciclos estabilizam ou param no limite — e nunca move caixa: valor, brilho e esmaecimento são classes sobre geometria parada.

## Auditoria

```bash
bun run build && bun run preview   # num terminal

bun run audit                      # noutro: tudo
bun run audit eletronica           # só uma visualização
```

Playwright rastreia a raiz para achar as coleções e cada coleção para achar as visualizações — visualização nova entra sozinha. Além da geometria (sobreposição, molduras, rótulos), a auditoria é **semântica**: clica cada combinação de entradas dos flows simulados, dispara cada evento das máquinas, troca cada vista dos registros, percorre cada passo dos passeios e confere as contagens das geometrias. Um diagrama que desenha certo mas conduz errado reprova.

Screenshot é prova fraca: mostra que algo foi desenhado, não que está certo. Os dos flows simulados saem energizados de propósito — a auditoria deixa tudo em 1 antes de fotografar.

## Rodando

```bash
bun install
bun dev
```

Do zero, incluindo bun e o chromium da auditoria:

```bash
curl -fsSL https://raw.githubusercontent.com/JoaoHenriqueBarbosa/je-visualize/main/scripts/setup.sh | bash
```

## Skill

`skill/SKILL.md` é a skill de agente do projeto: todo o conhecimento operacional — contrato, motor, temas, ciclo de verificação, armadilhas conhecidas — para trabalhar aqui a partir de um chat sem histórico.

## Stack

Bun · Vite · React 19 · TypeScript · React Router · [@xyflow/react](https://reactflow.dev) · Recharts · Playwright
