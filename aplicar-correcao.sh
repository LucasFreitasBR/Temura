#!/usr/bin/env bash
# Rode este script na raiz do repositorio Temura, DEPOIS de substituir
# o package.json e adicionar o vercel.json.
set -e

echo "==> Versao do pnpm instalada nesta maquina:"
pnpm -v
echo "    Confira se o campo \"packageManager\" do package.json bate com esse numero."
echo

# O repo tem dois lockfiles (npm e pnpm). O projeto usa pnpm, entao o do npm sai.
if [ -f package-lock.json ]; then
  echo "==> Removendo package-lock.json"
  git rm -f package-lock.json
fi

echo "==> Regenerando o pnpm-lock.yaml"
pnpm install

echo "==> Conferindo se o lockfile ficou consistente (mesma checagem da Vercel)"
pnpm install --frozen-lockfile

echo "==> Testando o build do site"
pnpm run build:site

echo
echo "==> Tudo certo. Agora comite:"
echo "    git add package.json pnpm-lock.yaml vercel.json"
echo "    git commit -m 'fix: corrige packageManager e regenera lockfile'"
echo "    git push"
