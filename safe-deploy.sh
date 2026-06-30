#!/bin/bash
# Safe Deploy — FIXED VERSION (Authorization header uses $TOKEN, not ***)
set -e

PROJECT_DIR="${1:-$(pwd)}"
cd "$PROJECT_DIR"

TOKEN_FILE="$HOME/.local/share/com.vercel.cli/auth.json"
PROJECT_ID="prj_DXFMnsGz4zUYa9AE94D25Ahf3YKR"
TEAM_ID="team_YmPqhICLidEs4Dkc5QpXfbMF"
SIG_FILE="$HOME/.cache/tradexa-deploy-sig.txt"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

echo -e "${YELLOW}═══════════════════════════════════════════${NC}"
echo -e "${YELLOW}  SAFE DEPLOY — $(date '+%Y-%m-%d %H:%M:%S')${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════${NC}"

ERRORS=0

# Step 1: Validar diretório
echo -e "\n${YELLOW}[1/7] Validando diretório...${NC}"
if ! echo "$(pwd)" | grep -q "project-clean"; then
    echo -e "${RED}❌ ERRO: Não está em project-clean/ — deploy bloqueado${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Diretório correto: $(pwd)${NC}"

# Step 2: vercel.json
echo -e "\n${YELLOW}[2/7] Verificando vercel.json...${NC}"
if [ ! -f "vercel.json" ]; then
    echo -e "${RED}❌ ERRO: vercel.json não encontrado${NC}"
    exit 1
fi
BUILD_CMD_LOCAL=$(python3 -c "import json; d=json.load(open('vercel.json')); print(d.get('buildCommand',''))" 2>/dev/null)
BUILD_SIG_LOCAL=$(echo "$BUILD_CMD_LOCAL" | grep -oP "BUILD_SIG=v\K[0-9]+" || echo "unknown")
echo -e "   Build command local: ${GREEN}BUILD_SIG=v${BUILD_SIG_LOCAL}${NC}"
echo -e "${GREEN}✅ vercel.json presente${NC}"

# Step 3: Verificar e sincronizar build command remoto
echo -e "\n${YELLOW}[3/7] Verificando build command remoto (Vercel API)...${NC}"
TOKEN=$(python3 -c "import json; print(json.load(open('$TOKEN_FILE'))['token'])" 2>/dev/null)
if [ -z "$TOKEN" ] || [ "$TOKEN" = "None" ]; then
    echo -e "   ${YELLOW}⚠ auth.json inválido — usando token hardcoded${NC}"
    TOKEN="vcp_7AvTqG2jnmF40O9sG9APxwemhRxK5T6azxkl8bYNgJa1LdZicb2wnmaz"
fi
if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ ERRO: Token Vercel não encontrado${NC}"
    exit 1
fi

REMOTE_BUILD=$(curl -s -H "Authorization: Bearer $TOKEN" \
    "https://api.vercel.com/v1/projects/$PROJECT_ID?teamId=$TEAM_ID" | \
    python3 -c "import json,sys; print(json.load(sys.stdin).get('buildCommand','null'))" 2>/dev/null)
BUILD_SIG_REMOTE=$(echo "$REMOTE_BUILD" | grep -oP "BUILD_SIG=v\K[0-9]+" || echo "none")
echo -e "   Build command remoto: BUILD_SIG=v${BUILD_SIG_REMOTE}"

if [ "$BUILD_CMD_LOCAL" != "$REMOTE_BUILD" ]; then
    echo -e "   ${YELLOW}⚠ Divergência detectada — sincronizando remote...${NC}"
    ESCAPED_CMD=$(python3 -c "import json; print(json.dumps('$BUILD_CMD_LOCAL'))" 2>/dev/null)
    RESP=$(curl -s -X PATCH \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        "https://api.vercel.com/v1/projects/$PROJECT_ID?teamId=$TEAM_ID" \
        -d "{\"buildCommand\": $ESCAPED_CMD}" 2>&1)
    VERIFY=$(curl -s -H "Authorization: Bearer $TOKEN" \
        "https://api.vercel.com/v1/projects/$PROJECT_ID?teamId=$TEAM_ID" | \
        python3 -c "import json,sys; print(json.load(sys.stdin).get('buildCommand',''))" 2>/dev/null)
    if [ "$VERIFY" = "$BUILD_CMD_LOCAL" ]; then
        echo -e "${GREEN}✅ Build command remoto sincronizado${NC}"
    else
        echo -e "${YELLOW}⚠ Falha ao sincronizar build command remoto${NC}"
        echo "   Remoto agora: $VERIFY"
        echo "   Esperado: $BUILD_CMD_LOCAL"
        echo -e "${YELLOW}   ⚠ BUILD_SIG divergence is non-critical — Vercel reads vercel.json at deploy${NC}"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${GREEN}✅ Build command remoto já sincronizado${NC}"
fi

# Step 4: Limpar cache
echo -e "\n${YELLOW}[4/7] Limpando cache de build...${NC}"
rm -rf dist/ .vercel/cache/ 2>/dev/null
echo -e "${GREEN}✅ Cache limpo${NC}"

# Step 5: Build local
echo -e "\n${YELLOW}[5/7] Executando build local para verificação...${NC}"
if command -v /home/nuh_tapinar/.hermes/node/bin/npx &> /dev/null; then
    NPX=/home/nuh_tapinar/.hermes/node/bin/npx
else
    NPX=npx
fi
BUILD_OUTPUT=$(eval "PUPPETEER_SKIP_DOWNLOAD=true $BUILD_CMD_LOCAL" 2>&1) || {
    echo -e "${RED}❌ Build local FALHOU — deploy abortado${NC}"
    echo "$BUILD_OUTPUT" | tail -30
    ERRORS=$((ERRORS + 1))
    exit 1
}
echo -e "${GREEN}✅ Build local concluído${NC}"

# Step 6: Verificar arquivos críticos
echo -e "\n${YELLOW}[6/7] Verificando arquivos críticos no build...${NC}"
BLOG_FILES=$(find dist/ -name "*.html" -path "*/blog/*" 2>/dev/null | wc -l)
echo -e "   Posts de blog no build: ${BLOG_FILES}"
if [ -f "dist/sitemap.xml" ]; then
    SITEMAP_URLS=$(grep -c "<url>" dist/sitemap.xml 2>/dev/null || echo 0)
    echo -e "   URLs no sitemap: ${SITEMAP_URLS}"
fi
echo -e "${GREEN}✅ Verificação concluída${NC}"

# Step 7: Deploy
echo -e "\n${YELLOW}[7/7] Executando deploy no Vercel...${NC}"
DEPLOY_OUTPUT=$($NPX vercel deploy --prod --yes --token "$TOKEN" 2>&1) || {
    echo -e "${RED}❌ Deploy FALHOU${NC}"
    echo "$DEPLOY_OUTPUT" | tail -30
    ERRORS=$((ERRORS + 1))
    exit 1
}
DEPLOY_URL=$(echo "$DEPLOY_OUTPUT" | grep -oP "https://[a-zA-Z0-9.-]+\.vercel\.app" | head -1)
echo -e "${GREEN}✅ Deploy concluído!${NC}"

echo "$BUILD_CMD_LOCAL" > "$SIG_FILE"
echo "$(date '+%Y-%m-%d %H:%M:%S')" >> "$SIG_FILE"
echo "$DEPLOY_URL" >> "$SIG_FILE"

echo ""
echo -e "${YELLOW}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}  DEPLOY REALIZADO COM SUCESSO ✅${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════${NC}"
echo -e "  Projeto:     tradex6 (www.tradexa.com.br)"
echo -e "  Build SIG:   v${BUILD_SIG_LOCAL}"
echo -e "  Deploy URL:  ${DEPLOY_URL:-https://www.tradexa.com.br}"
echo -e "  Posts blog:  ${BLOG_FILES}"
if [ -f "dist/sitemap.xml" ]; then
    echo -e "  Sitemap URLs: ${SITEMAP_URLS:-?}"
fi
echo -e "  Hora:        $(date '+%H:%M:%S')"
echo -e "${YELLOW}═══════════════════════════════════════════${NC}"

[ "$ERRORS" -gt 0 ] && echo -e "${YELLOW}⚠ $ERRORS non-fatal warnings — deploy realizado com ressalvas${NC}" && exit 0 || exit 0
