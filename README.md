# je-visualize

Visualizações construídas sob encomenda. Cada assunto pedido vira uma **coleção**: um corpo de diagramas com esquema declarado e layout medido.

```
/                        as coleções
/samkhya                 os diagramas de um assunto
/samkhya/antahkarana     um diagrama
```

## Coleções

**sāṃkhya** — cinco diagramas: kaivalya, os 25 tattvas, triguṇa, antaḥkaraṇa, pramāṇa.

## Como se escreve um diagrama

O spec é declarativo e nunca contém pixel. O autor descreve nós, arestas e grupos; o único controle espacial é topológico — `column` (faixa vertical, 0 é o eixo) e `rank` (fixa a camada quando nenhuma aresta a deriva). Arestas têm quatro tipos: `flow` avança camada e define a ordenação, `aside` é lateral, `feedback` sai da ordenação para não criar ciclo, `illumine` é presença não-causal.

Contrato em `src/flow/types.ts`, coleções em `src/collections/`.

## O motor

Sete passadas em `src/flow/layout.ts`: ordem por caminho mais longo com nós pinados, grade, vãos dimensionados pelos rótulos medidos, molduras, posições, compactação lateral, lados de borda derivados da geometria final.

Os cartões são medidos no DOM com o CSS real antes de qualquer decisão de posição. O padding das molduras é somado ao vão da borda, nunca disputado com o rótulo que já mora lá — é isso que faz a moldura conter de verdade.

## Auditoria

```bash
bun run build && bun run preview   # num terminal
bun run audit                      # noutro
```

Playwright rastreia a raiz para achar as coleções e cada coleção para achar os diagramas — visualização nova entra sozinha. Lê as caixas reais do DOM e reprova cartão sobre cartão, moldura que não contém membro, moldura que invade estranho e rótulo por cima de cartão. Screenshots caem em `shots/`.

Screenshot é prova fraca: mostra que algo foi desenhado, não que está certo.

## Rodando

```bash
bun install
bun dev
```

## Stack

Bun · Vite · React 19 · TypeScript · React Router · [@xyflow/react](https://reactflow.dev) · Playwright
