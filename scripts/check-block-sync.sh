#!/bin/bash
# check-block-sync.sh — проверка соответствия Payload schema ↔ Frontend components
# Использование: bash /var/www/shkola-pk/scripts/check-block-sync.sh
#
# Проверяет что frontend-компоненты читают те же поля, что Payload schema описывает.
# Если есть несоответствие → exit 1 (deploy.sh отменит деплой).
set -euo pipefail

PROJECT_DIR="/var/www/shkola-pk"
SCHEMA_DIR="$PROJECT_DIR/payload-cms/src/blocks"
FRONTEND_DIR="$PROJECT_DIR/app-payload/src/components/blocks"
TYPES_FILE="$PROJECT_DIR/payload-cms/src/payload-types.ts"

PASS=0
FAIL=0

echo ""
echo "══════════════════════════════════════════════════════════"
echo "  BLOCK SYNC CHECK — $(date '+%Y-%m-%d %H:%M:%S')"
echo "══════════════════════════════════════════════════════════"
echo ""

# ═══ 1. Проверить что payload-types.ts существует ═══
echo "1. payload-types.ts exists"
if [ -f "$TYPES_FILE" ]; then
    echo "  ✓ Found: $TYPES_FILE"
    PASS=$((PASS + 1))
else
    echo "  ✗ NOT FOUND: $TYPES_FILE"
    echo "    Run: create payload-types.ts manually"
    FAIL=$((FAIL + 1))
fi

# ═══ 2. Проверить соответствие schema ↔ frontend для каждого блока ═══
echo ""
echo "2. Schema ↔ Frontend field correspondence"
echo ""

# Для каждого блока: извлечь slug и field names из schema,
# потом проверить что frontend читает те же поля

for schema_file in "$SCHEMA_DIR"/*.ts; do
    [ -f "$schema_file" ] || continue
    [[ "$schema_file" == *.before-* ]] && continue
    
    block_name=$(basename "$schema_file" .ts)
    slug=$(grep -oP "slug:\s*'([^']+)'" "$schema_file" | head -1 | sed "s/slug: '//;s/'//")
    
    if [ -z "$slug" ]; then
        continue
    fi
    
    # Найти соответствующий frontend файл
    frontend_file="$FRONTEND_DIR/${block_name}.tsx"
    if [ ! -f "$frontend_file" ]; then
        echo "  ⚠ $block_name: frontend file not found ($block_name.tsx)"
        continue
    fi
    
    # Извлечь field names из schema (name: 'xxx')
    schema_fields=$(grep -oP "name:\s*'([a-zA-Z0-9_]+)'" "$schema_file" | sed "s/name: '//;s/'//g" | sort -u)
    
    # Извлечь field names из frontend (data.xxx)
    frontend_fields=$(grep -oP "data\.([a-zA-Z0-9_]+)" "$frontend_file" | sed 's/data\.//' | sort -u)
    
    # Найти поля которые есть в schema но нет в frontend (potentially missing)
    MISSING=""
    for field in $schema_fields; do
        if ! echo "$frontend_fields" | grep -qw "$field"; then
            # Check if frontend has a fallback/alias
            if ! grep -qE "data\.$field|\\.$field\b" "$frontend_file" 2>/dev/null; then
                MISSING="$MISSING $field"
            fi
        fi
    done
    
    if [ -z "$MISSING" ]; then
        echo "  ✓ $block_name ($slug) — all fields in sync"
        PASS=$((PASS + 1))
    else
        echo "  ✗ $block_name ($slug) — schema fields not used in frontend:$MISSING"
        FAIL=$((FAIL + 1))
    fi
done

# ═══ 3. Проверить что все frontend блоки зарегистрированы в BlockRenderer ═══
echo ""
echo "3. All blocks registered in BlockRenderer"
RENDERER="$PROJECT_DIR/app-payload/src/components/BlockRenderer.tsx"
if [ -f "$RENDERER" ]; then
    RENDERER_CASES=$(grep -c 'case "' "$RENDERER" 2>/dev/null || echo "0")
    echo "  BlockRenderer handles $RENDERER_CASES block types"
    
    # Проверить что каждый slug из schema есть в BlockRenderer
    for schema_file in "$SCHEMA_DIR"/*.ts; do
        [ -f "$schema_file" ] || continue
        [[ "$schema_file" == *.before-* ]] && continue
        
        slug=$(grep -oP "slug:\s*'([^']+)'" "$schema_file" | head -1 | sed "s/slug: '//;s/'//")
        [ -z "$slug" ] && continue
        
        if grep -q "case \"$slug\"" "$RENDERER" 2>/dev/null; then
            : # OK
        else
            echo "  ✗ Block '$slug' NOT in BlockRenderer!"
            FAIL=$((FAIL + 1))
        fi
    done
    echo "  ✓ All schema blocks found in BlockRenderer"
    PASS=$((PASS + 1))
else
    echo "  ✗ BlockRenderer.tsx not found!"
    FAIL=$((FAIL + 1))
fi

# ═══ 4. Проверить что все блоки зарегистрированы в payload.config.ts ═══
echo ""
echo "4. All blocks registered in payload.config.ts"
CONFIG="$PROJECT_DIR/payload-cms/payload.config.ts"
if [ -f "$CONFIG" ]; then
    CONFIG_BLOCKS=$(grep -c "Block," "$CONFIG" 2>/dev/null || echo "0")
    echo "  payload.config.ts registers $CONFIG_BLOCKS blocks"
    PASS=$((PASS + 1))
else
    echo "  ✗ payload.config.ts not found!"
    FAIL=$((FAIL + 1))
fi

# ═══ ИТОГ ═══
echo ""
echo "══════════════════════════════════════════════════════════"
echo "  РЕЗУЛЬТАТ: $PASS passed, $FAIL failed"
echo "══════════════════════════════════════════════════════════"
echo ""

if [ "$FAIL" -gt 0 ]; then
    echo "⚠ BLOCK SYNC CHECK FAILED — $FAIL mismatches found"
    echo "  Fix: update frontend components to match Payload schema"
    exit 1
else
    echo "✓ BLOCK SYNC CHECK PASSED — all blocks in sync"
    exit 0
fi
