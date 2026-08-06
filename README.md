# sāṃkhya

Diagramas dos princípios do Sāṃkhya, e um pequeno framework para desenhá-los sem chutar coordenadas.

**https://samkhya-iota.vercel.app**

## Os flows

| | |
|---|---|
| `/kaivalya` | os três sofrimentos, a confusão na raiz, e a saída |
| `/tattvas` | os vinte e cinco princípios — a cosmologia inteira |
| `/guna` | sattva, rajas, tamas |
| `/antahkarana` | manas, buddhi, ahaṃkāra, citta e o reflexo |
| `/pramana` | os três meios de conhecimento válido |

## O framework

A primeira versão deste repo tinha coordenadas escritas na mão. O resultado foi previsível: cartões sobrepostos, rótulos por cima de texto e uma moldura que não continha os próprios membros. O framework existe para tornar esse tipo de erro impossível de cometer.

### Contrato de esquema

Um flow (`src/flows/*.ts`) declara relações, nunca pixels. Ver `src/flow/types.ts`.

```ts
{
  nodes: [{ id: "buddhi", iast: "buddhi", column: 0, group: "ak", ... }],
  edges: [{ from: "manas", to: "buddhi", label: "a dúvida sobe" }],
  groups: [{ id: "ak", label: "antaḥkaraṇa" }],
}
```

O único controle espacial exposto ao autor é topológico — `column` (faixa vertical) e `rank` (fixa a camada quando não há aresta que a derive, como nas fileiras de cinco irmãos). Ambos são índices de grade. A métrica é sempre do motor.

### Motor de renderização

`src/flow/layout.ts`, em seis passadas:

1. **ordenação** — camadas por caminho mais longo sobre as arestas de fluxo; `feedback` e `illumine` ficam de fora para não fechar ciclo
2. **grade** — altura de cada linha e largura de cada coluna, tiradas das medidas reais
3. **vãos** — cada vão cresce até caber o maior rótulo que o atravessa; um rótulo que cruza vários corredores se reparte entre eles
4. **molduras** — o padding do grupo é *somado* ao vão da borda, nunca disputado com o rótulo que já mora ali. É isto que faz a moldura conter de fato
5. **posições** — soma acumulada, nós centrados na célula
6. **bordas** — retângulo do grupo pela união dos membros; lado de entrada e saída de cada aresta derivado da geometria final, entre quatro âncoras por nó

As medidas vêm de `src/flow/Measurer.tsx`, que renderiza cada cartão, cada rótulo e cada legenda fora da tela com o CSS real, espera `document.fonts.ready` e lê as caixas do DOM. O motor nunca estima largura de texto.

O motor também avisa quando um grupo é topologicamente impossível — um não-membro dentro do bloco retangular do grupo não tem padding que resolva.

## Auditoria

Screenshot prova que algo foi desenhado, não que está certo. `scripts/audit.mjs` sobe o build, lê as caixas do DOM e verifica:

1. nenhum par de cartões se sobrepõe
2. toda moldura contém seus membros
3. nenhuma moldura invade um nó que não é dela
4. nenhum rótulo de aresta cai sobre um cartão

```bash
bun run build
bunx vite preview --port 4173 &
bun run audit
```

Saída atual:

```
ok    kaivalya       8 nós · 1 molduras · 5 rótulos
ok    tattvas       28 nós · 5 molduras · 8 rótulos
ok    guna           4 nós · 1 molduras · 4 rótulos
ok    antahkarana    6 nós · 1 molduras · 6 rótulos
ok    pramana        5 nós · 1 molduras · 3 rótulos

Geometria limpa.
```

## Rodando

```bash
bun install
bun dev
```

## Stack

Bun · Vite · React 19 · TypeScript · React Router 7 · [@xyflow/react](https://reactflow.dev) 12 · Playwright
