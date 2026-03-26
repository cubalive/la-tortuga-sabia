#!/bin/bash
set -euo pipefail
cd /home/user/la-tortuga-sabia
source .env.local

AKEY="$ANTHROPIC_API_KEY"
OKEY="$OPENAI_API_KEY"
STORY_DIR="public/stories/tomo-1"
IMG_DIR="public/images/stories/tomo-1"
mkdir -p "$STORY_DIR" "$IMG_DIR"

# Read SYSTEM_PROMPT from lib file
SYSPROMPT=$(python3 -c "
t = open('lib/story-generator.ts').read()
s = t.index('const SYSTEM_PROMPT = \`') + len('const SYSTEM_PROMPT = \`')
e = t.index('\`;', s)
print(t[s:e].strip())
")

# Catalog of 50 stories
declare -a TITLES CHARS SITUS
TITLES[1]="El búho que no quería cerrar los ojos"; CHARS[1]="Búho bebé Buby"; SITUS[1]="No quiere dormir"
TITLES[2]="La ranita que saltaba sin parar"; CHARS[2]="Rana bebé Lila"; SITUS[2]="No puede quedarse quieta"
TITLES[3]="El conejito que no quería compartir"; CHARS[3]="Conejo bebé Milo"; SITUS[3]="No quiere compartir juguetes"
TITLES[4]="La mariposa que tenía miedo de volar"; CHARS[4]="Mariposa bebé Luna"; SITUS[4]="Miedo a lo desconocido"
TITLES[5]="El patito que no quería bañarse"; CHARS[5]="Pato bebé Plop"; SITUS[5]="Resiste la hora del baño"
TITLES[6]="La hormiguita que cargaba demasiado"; CHARS[6]="Hormiga bebé Pía"; SITUS[6]="No pide ayuda"
TITLES[7]="El gatito que arañaba todo"; CHARS[7]="Gato bebé Mishi"; SITUS[7]="Berrinches y frustración"
TITLES[8]="El pececito que no quería nadar solo"; CHARS[8]="Pez bebé Burbuja"; SITUS[8]="Ansiedad de separación"
TITLES[9]="La tortugita que caminaba muy despacio"; CHARS[9]="Tortuga bebé Tita"; SITUS[9]="Ir a su propio ritmo"
TITLES[10]="El cachorro que ladraba a la luna"; CHARS[10]="Perro bebé Trueno"; SITUS[10]="Miedo a ruidos fuertes"
TITLES[11]="La abejita que no encontraba su flor"; CHARS[11]="Abeja bebé Zuri"; SITUS[11]="Sentirse perdida"
TITLES[12]="El elefantito que pisaba las flores"; CHARS[12]="Elefante bebé Trompi"; SITUS[12]="Sentirse torpe"
TITLES[13]="La luciérnaga que perdió su luz"; CHARS[13]="Luciérnaga bebé Brilli"; SITUS[13]="Perder confianza"
TITLES[14]="El pollito que no quería comer"; CHARS[14]="Pollito bebé Pico"; SITUS[14]="Selectivo con comida"
TITLES[15]="La ardillita que escondía todo"; CHARS[15]="Ardilla bebé Nuca"; SITUS[15]="Acaparar cosas"
TITLES[16]="El osito que no quería soltar su manta"; CHARS[16]="Oso bebé Pelusa"; SITUS[16]="Apego a objeto de consuelo"
TITLES[17]="La cebrita que no le gustaban sus rayas"; CHARS[17]="Cebra bebé Zigzag"; SITUS[17]="No aceptar su apariencia"
TITLES[18]="El caracolito que se escondía siempre"; CHARS[18]="Caracol bebé Casita"; SITUS[18]="Timidez extrema"
TITLES[19]="La ovejita que no podía dormir sola"; CHARS[19]="Oveja bebé Lana"; SITUS[19]="Primera noche sola"
TITLES[20]="El ratoncito que tenía miedo a la oscuridad"; CHARS[20]="Ratón bebé Bigotes"; SITUS[20]="Miedo a la oscuridad"
TITLES[21]="La jirafa que no alcanzaba a sus amigos"; CHARS[21]="Jirafa bebé Cuello"; SITUS[21]="Sentirse diferente"
TITLES[22]="El cerdito que se ensuciaba mucho"; CHARS[22]="Cerdo bebé Lodito"; SITUS[22]="Aprender rutinas de higiene"
TITLES[23]="La foquita que resbalaba en el hielo"; CHARS[23]="Foca bebé Desliz"; SITUS[23]="Caerse y levantarse"
TITLES[24]="El león bebé que rugía bajito"; CHARS[24]="León bebé Rugido"; SITUS[24]="Querer ser fuerte"
TITLES[25]="La pingüinita que tenía frío"; CHARS[25]="Pingüina bebé Copo"; SITUS[25]="Necesitar un abrazo"
TITLES[26]="El camaleón que cambiaba de color"; CHARS[26]="Camaleón bebé Arcoíris"; SITUS[26]="Emociones desbordantes"
TITLES[27]="La mariposita que extrañaba ser oruga"; CHARS[27]="Mariposa bebé Capullo"; SITUS[27]="Miedo a crecer"
TITLES[28]="El cangrejo que caminaba para atrás"; CHARS[28]="Cangrejo bebé Pinza"; SITUS[28]="Hacer cosas diferente"
TITLES[29]="La palomita que no quería volver al nido"; CHARS[29]="Paloma bebé Pluma"; SITUS[29]="No querer ir a casa"
TITLES[30]="El sapito que croaba muy fuerte"; CHARS[30]="Sapo bebé Croac"; SITUS[30]="No medir su voz"
TITLES[31]="La estrella de mar que se sentía sola"; CHARS[31]="Estrella bebé Coral"; SITUS[31]="Querer un amigo"
TITLES[32]="El koala que no quería bajarse"; CHARS[32]="Koala bebé Abrazo"; SITUS[32]="Aferrarse, no separarse"
TITLES[33]="La vaquita que mugía de noche"; CHARS[33]="Vaca bebé Manchita"; SITUS[33]="Pesadillas nocturnas"
TITLES[34]="El delfín que salpicaba a todos"; CHARS[34]="Delfín bebé Splash"; SITUS[34]="No medir consecuencias"
TITLES[35]="La mariquita que perdió un puntito"; CHARS[35]="Mariquita bebé Puntitos"; SITUS[35]="Perder algo importante"
TITLES[36]="El murciélago que tenía miedo del día"; CHARS[36]="Murciélago bebé Sombra"; SITUS[36]="Vivir al revés de los demás"
TITLES[37]="La nutria que no quería soltar a mamá"; CHARS[37]="Nutria bebé Flotis"; SITUS[37]="Primera vez en guardería"
TITLES[38]="El perezoso que se perdió la fiesta"; CHARS[38]="Perezoso bebé Lento"; SITUS[38]="Ir a su ritmo"
TITLES[39]="La tortolita que repetía todo"; CHARS[39]="Tórtola bebé Eco"; SITUS[39]="Aprender a hablar"
TITLES[40]="El erizo que pinchaba sin querer"; CHARS[40]="Erizo bebé Púas"; SITUS[40]="Lastimar sin intención"
TITLES[41]="El flamenco que no se sostenía"; CHARS[41]="Flamenco bebé Rosita"; SITUS[41]="Aprender a caminar"
TITLES[42]="El lorito que decía no a todo"; CHARS[42]="Loro bebé Nono"; SITUS[42]="La etapa del no"
TITLES[43]="El cisne que se veía feo"; CHARS[43]="Cisne bebé Gris"; SITUS[43]="Autoestima"
TITLES[44]="El hipopótamo que ocupaba mucho espacio"; CHARS[44]="Hipopótamo bebé Gordi"; SITUS[44]="Sentirse grande"
TITLES[45]="El búfalo que embestía sin querer"; CHARS[45]="Búfalo bebé Toro"; SITUS[45]="Juego brusco"
TITLES[46]="El puercoespín que quería un abrazo"; CHARS[46]="Puercoespín bebé Bolita"; SITUS[46]="Miedo de acercarse"
TITLES[47]="El zorrito que se perdió en el bosque"; CHARS[47]="Zorro bebé Rojo"; SITUS[47]="Encontrar el camino"
TITLES[48]="El grillito que cantaba de noche"; CHARS[48]="Grillo bebé Cri-Cri"; SITUS[48]="Respetar el silencio"
TITLES[49]="La luciérnaga que brillaba de día"; CHARS[49]="Luciérnaga bebé Solecito"; SITUS[49]="Ser único"
TITLES[50]="El nido vacío que esperaba"; CHARS[50]="El bosque entero"; SITUS[50]="Despedirse, cerrar ciclo"

START_TIME=$(date +%s)
TOTAL_COST=0

for NUM in $(seq 1 50); do
  # Skip if already done
  if [ -f "$STORY_DIR/story-${NUM}.json" ] && [ -f "$IMG_DIR/story-${NUM}-portada.jpg" ]; then
    SIZE=$(stat -c%s "$IMG_DIR/story-${NUM}-portada.jpg" 2>/dev/null || echo 0)
    if [ "$SIZE" -gt 1000 ]; then
      echo "⏭️  $NUM/50: ${TITLES[$NUM]} (done)"
      continue
    fi
  fi

  echo ""
  echo "📖 $NUM/50: ${TITLES[$NUM]}"
  echo "   ${CHARS[$NUM]} — ${SITUS[$NUM]}"

  # Generate story with Claude
  BODY=$(python3 -c "
import json
system = open('/dev/stdin').read()
prompt = 'Genera el cuento #$NUM del Tomo 1 \"El Bosque Encantado\" para niños de 0-2 años.\n\nTítulo: ${TITLES[$NUM]}\nPersonaje: ${CHARS[$NUM]}\nSituación: ${SITUS[$NUM]}\n\nEl cuento debe tener 400-500 palabras.\nSigue la ESTRUCTURA OBLIGATORIA.\n\nResponde en JSON (sin markdown):\n{\"numero\":$NUM,\"titulo\":\"\",\"personaje\":\"\",\"situacion\":\"\",\"historia\":\"cuento COMPLETO\",\"quelina_momento\":\"\",\"moraleja\":\"1 frase\",\"il_portada\":\"DALL-E prompt English Ghibli watercolor\",\"il_problema\":\"DALL-E prompt\",\"il_quelina\":\"DALL-E prompt\",\"il_resolucion\":\"DALL-E prompt\",\"il_vineta\":\"DALL-E prompt\",\"suno_prompt\":\"music prompt English\",\"suno_lyrics\":\"letra español\"}'
print(json.dumps({'model':'claude-sonnet-4-20250514','max_tokens':4000,'system':system,'messages':[{'role':'user','content':prompt}]}))
" <<< "$SYSPROMPT")

  RESP=$(curl -s --max-time 180 https://api.anthropic.com/v1/messages \
    -H "Content-Type: application/json" \
    -H "x-api-key: $AKEY" \
    -H "anthropic-version: 2023-06-01" \
    -d "$BODY" 2>&1)

  # Parse story
  STORY=$(python3 -c "
import json, sys
try:
    d = json.loads(sys.argv[1])
    if 'error' in d:
        print('ERROR:' + str(d['error']), file=sys.stderr)
        sys.exit(1)
    text = d['content'][0]['text'].strip()
    if text.startswith('\`\`\`json'): text = text[7:]
    if text.startswith('\`\`\`'): text = text[3:]
    if text.endswith('\`\`\`'): text = text[:-3]
    story = json.loads(text.strip())
    json.dump(story, open('$STORY_DIR/story-${NUM}.json','w'), ensure_ascii=False, indent=2)
    words = len(story.get('historia','').split())
    print(f'   ✅ Story: {words} words — {story.get(\"moraleja\",\"\")}')
except Exception as e:
    print(f'   ❌ {e}', file=sys.stderr)
    sys.exit(1)
" "$RESP" 2>&1) || { echo "   ❌ Story generation failed"; continue; }
  echo "$STORY"
  TOTAL_COST=$(python3 -c "print(round($TOTAL_COST + 0.03, 2))")

  # Generate 5 illustrations
  for IL in portada problema quelina resolucion vineta; do
    IMGFILE="$IMG_DIR/story-${NUM}-${IL}.jpg"
    if [ -f "$IMGFILE" ] && [ "$(stat -c%s "$IMGFILE" 2>/dev/null || echo 0)" -gt 1000 ]; then
      echo "   ⏭️  $IL exists"
      continue
    fi

    # Build DALL-E request JSON safely via python (avoids shell quoting issues)
    DALLE_BODY=$(python3 << PYEOF
import json
s = json.load(open("$STORY_DIR/story-${NUM}.json"))
p = s.get("il_${IL}", "cute baby animal in magical forest")
p += " Watercolor children book illustration, Studio Ghibli style, warm colors, no text, cute magical, soft color wash background in deep forest greens and midnight blues, NO white background, atmospheric depth, painted paper texture, dreamy."
print(json.dumps({"model":"dall-e-3","prompt":p,"n":1,"size":"1024x1024","quality":"hd","style":"vivid"}))
PYEOF
    )

    IMGURL=$(curl -s --max-time 120 https://api.openai.com/v1/images/generations \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $OKEY" \
      -d "$DALLE_BODY" 2>&1 \
      | python3 -c "import sys,json; print(json.load(sys.stdin)['data'][0]['url'])" 2>/dev/null)

    if [ -n "$IMGURL" ] && [ "$IMGURL" != "None" ]; then
      curl -s -o "$IMGFILE" --max-time 30 "$IMGURL"
      echo "   ✅ $IL"
    else
      echo "   ❌ $IL failed"
    fi
    TOTAL_COST=$(python3 -c "print(round($TOTAL_COST + 0.08, 2))")
    sleep 3
  done

  ELAPSED=$(( ($(date +%s) - START_TIME) / 60 ))
  echo "✅ Cuento $NUM/50 completado (${ELAPSED}min, ~\$$TOTAL_COST)"
done

# Merge all stories
python3 -c "
import json, glob
stories = []
for f in sorted(glob.glob('$STORY_DIR/story-*.json'), key=lambda x: int(x.split('-')[-1].split('.')[0])):
    if 'literary' not in f and 'all-' not in f and 'progress' not in f:
        stories.append(json.load(open(f)))
json.dump(stories, open('$STORY_DIR/all-stories.json','w'), ensure_ascii=False, indent=2)
print(f'Merged {len(stories)} stories into all-stories.json')
"

ELAPSED=$(( ($(date +%s) - START_TIME) / 60 ))
echo ""
echo "═══════════════════════════════════════"
echo "  TOMO I COMPLETE!"
echo "  Time: ${ELAPSED} minutes"
echo "  Cost: ~\$$TOTAL_COST"
echo "═══════════════════════════════════════"
