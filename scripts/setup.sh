#!/usr/bin/env bash
#
# Setup do ambiente do je-visualize, do zero até a auditoria passando.
# Idempotente: rodar de novo não estraga nada, só confirma.
#
#   ./scripts/setup.sh          # dentro de um clone
#   bash setup.sh               # de fora: clona antes
#
# O que ele garante, nesta ordem:
#   1. bun no PATH (instala se faltar; exige curl e unzip)
#   2. o repositório (clona se rodado de fora dele)
#   3. dependências do projeto (bun install)
#   4. um chromium que o Playwright encontre (respeita
#      PLAYWRIGHT_BROWSERS_PATH se o ambiente já trouxer um pré-instalado,
#      como os sandboxes que definem /opt/pw-browsers)
#   5. build de produção
#   6. preview servindo e a auditoria completa passando
#
# Credenciais: nada aqui. O repositório é público, clone não pede token.
# Push pede: exporte GITHUB_TOKEN antes (a skill de github do dono documenta
# a fonte) e use o remote https com o token embutido, nunca comitado.

set -euo pipefail

REPO="https://github.com/JoaoHenriqueBarbosa/je-visualize.git"
DIR="je-visualize"

say() { printf '\n\033[1m== %s\033[0m\n' "$*"; }

# ---------------------------------------------------------------- 1. bun
if ! command -v bun > /dev/null 2>&1; then
  if [ -x "$HOME/.bun/bin/bun" ]; then
    export PATH="$HOME/.bun/bin:$PATH"
  else
    say "instalando bun"
    curl -fsSL https://bun.sh/install | bash
    export PATH="$HOME/.bun/bin:$PATH"
  fi
fi
say "bun $(bun --version)"

# ------------------------------------------------------------ 2. repositório
if [ ! -f package.json ] || ! grep -q '"name": "je-visualize"' package.json 2> /dev/null; then
  if [ -d "$DIR" ]; then
    cd "$DIR"
  else
    say "clonando $REPO"
    git clone "$REPO" "$DIR"
    cd "$DIR"
  fi
fi
say "repo em $(pwd)"

# ---------------------------------------------------------- 3. dependências
say "bun install"
bun install

# ------------------------------------------------------------- 4. chromium
# O audit lança o chromium do Playwright. Três situações possíveis:
#   a. o ambiente traz browsers pré-instalados e aponta
#      PLAYWRIGHT_BROWSERS_PATH para eles — nada a fazer;
#   b. já baixado no cache padrão (~/.cache/ms-playwright) — nada a fazer;
#   c. nada disso — baixar. --with-deps também instala libs de sistema,
#      mas exige root; sem root, tenta sem e torce para as libs existirem.
say "chromium para o playwright"
if node -e "require('playwright').chromium.executablePath()" > /dev/null 2>&1 \
  && [ -x "$(node -e "process.stdout.write(require('playwright').chromium.executablePath())")" ]; then
  echo "já disponível: $(node -e "process.stdout.write(require('playwright').chromium.executablePath())")"
else
  if [ "$(id -u)" = "0" ]; then
    bunx playwright install --with-deps chromium
  else
    bunx playwright install chromium || {
      echo "download falhou; se faltar lib de sistema, rode com root: bunx playwright install --with-deps chromium"
      exit 1
    }
  fi
fi

# ----------------------------------------------------------------- 5. build
say "build"
bun run build

# ------------------------------------------------- 6. preview + auditoria
# O preview NÃO sobrevive entre invocações de shell em ambientes que matam
# processos ao fim do comando — por isso o setup valida tudo numa tacada só,
# e o fluxo de trabalho depois deve subir preview e rodar audit no MESMO
# comando. O nohup aqui é melhor esforço, não promessa.
say "preview + auditoria"
pkill -f "vite preview" 2> /dev/null || true
sleep 1
nohup bun run preview > /tmp/je-visualize-preview.log 2>&1 &
sleep 5
if ! curl -sf -o /dev/null http://localhost:4173/; then
  echo "preview não respondeu; veja /tmp/je-visualize-preview.log"
  exit 1
fi
bun run audit

say "pronto"
echo "dev:      bun dev"
echo "audit:    bun run build && (nohup bun run preview >/tmp/p.log 2>&1 &) && sleep 5 && bun run audit [visualização]"
