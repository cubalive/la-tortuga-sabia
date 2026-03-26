#!/bin/bash
set -euo pipefail
cd /home/user/la-tortuga-sabia
source .env.local
AKEY="$ANTHROPIC_API_KEY"
DIR="public/stories/tomo-2"
mkdir -p "$DIR"

SYSPROMPT=$(python3 -c "
t = open('lib/story-generator.ts').read()
s = t.index('const SYSTEM_PROMPT = \`') + len('const SYSTEM_PROMPT = \`')
e = t.index('\`;', s)
base = t[s:e].strip()
# Add Tomo II specific instructions
extra = '''

INSTRUCCIONES ESPECIALES PARA TOMO II (3-4 años):
- Los niños de esta edad YA tienen lenguaje
- Pueden expresar más emociones con palabras
- La amistad es central en su mundo
- Los conflictos con pares son frecuentes
- Quelina puede hacer preguntas más filosóficas
- Incluye MÁS diálogo y menos narración
- Cada cuento puede tener 2-3 personajes secundarios
- El humor es bienvenido: situaciones graciosas que los niños reconocen
- Extensión: 550-700 palabras
- El momento que hace llorar a los padres es sobre la infancia que pasa rápido'''
print(base + extra)
")

declare -a T P S
T[1]="El dragoncito que no podía controlar su fuego"; P[1]="Dragón bebé Llamitas"; S[1]="Ira, explosiones de enojo"
T[2]="La niña que tenía miedo de los truenos"; P[2]="Niña Valentina"; S[2]="Miedo a tormentas"
T[3]="El osito que no quería compartir sus juguetes"; P[3]="Oso Peluchín"; S[3]="Aprender a compartir"
T[4]="La mariposa que no se sentía bonita"; P[4]="Mariposa Celeste"; S[4]="Autoestima, comparación"
T[5]="El conejito que mintió sobre el pastel"; P[5]="Conejo Saltarín"; S[5]="Honestidad, consecuencias"
T[6]="El patito que era diferente a todos"; P[6]="Pato Arcoíris"; S[6]="Ser diferente, inclusión"
T[7]="La ranita celosa de su hermanita nueva"; P[7]="Rana Esmeralda"; S[7]="Celos de hermano nuevo"
T[8]="El lobito que no tenía amigos"; P[8]="Lobo Estrella"; S[8]="Soledad, hacer amigos"
T[9]="La princesa que tenía miedo a la oscuridad"; P[9]="Princesa Luna"; S[9]="Miedo a la noche"
T[10]="El elefante que se olvidó todo"; P[10]="Elefante Memo"; S[10]="Frustración, memoria"
T[11]="El pajarito que no quería volar solo"; P[11]="Pájaro Cielo"; S[11]="Independencia, miedo"
T[12]="La tortuga lenta que quería ganar"; P[12]="Tortuga Veloz"; S[12]="Comparación, esfuerzo"
T[13]="El gatito que arañó sin querer"; P[13]="Gato Terciopelo"; S[13]="Accidentes, pedir perdón"
T[14]="La niña que no quería ir al médico"; P[14]="Niña Sofía"; S[14]="Miedo al doctor"
T[15]="El oso que perdió su peluche favorito"; P[15]="Oso Bombón"; S[15]="Pérdida de objeto querido"
T[16]="El pollito que no quería comer verduras"; P[16]="Pollito Sol"; S[16]="Resistencia a comida nueva"
T[17]="La niña que no quería ir a la guardería"; P[17]="Niña Camila"; S[17]="Miedo a guardería"
T[18]="El cocodrilo que lloraba sin parar"; P[18]="Cocodrilo Lágrimas"; S[18]="Tristeza, expresar emociones"
T[19]="El niño que quería ser el primero siempre"; P[19]="Niño Rayo"; S[19]="Competitividad, esperar turno"
T[20]="La estrella que tenía vergüenza de brillar"; P[20]="Estrella Tímida"; S[20]="Vergüenza, timidez"
T[21]="El perrito que ladraba por miedo"; P[21]="Perro Valiente"; S[21]="Miedo disfrazado de enojo"
T[22]="La niña que no quería dormir la siesta"; P[22]="Niña Aurora"; S[22]="Resistencia al descanso"
T[23]="El ratoncito que tenía miedo al gato"; P[23]="Ratón Bigotón"; S[23]="Miedos irracionales"
T[24]="El niño que no quería pedir perdón"; P[24]="Niño Martín"; S[24]="Orgullo, disculpas"
T[25]="La jirafa que se sentía demasiado alta"; P[25]="Jirafa Nube"; S[25]="Ser diferente, aceptarse"
T[26]="El cachorro que mordía cuando estaba nervioso"; P[26]="Cachorro Nervio"; S[26]="Ansiedad, manejo emocional"
T[27]="La niña que tenía celos de su mejor amiga"; P[27]="Niña Isabella"; S[27]="Celos entre amigos"
T[28]="El niño que rompió el juguete de su hermano"; P[28]="Niño Tomás"; S[28]="Responsabilidad, reparar daño"
T[29]="La luna que se sentía sola"; P[29]="Luna Plateada"; S[29]="Soledad, amor propio"
T[30]="El árbol que perdió todas sus hojas"; P[30]="Árbol Sabio"; S[30]="Cambios, aceptar transformación"
T[31]="El niño que tenía miedo de los perros grandes"; P[31]="Niño Diego"; S[31]="Fobias específicas"
T[32]="La niña que no quería bañarse el cabello"; P[32]="Niña Mariana"; S[32]="Resistencia a rutinas"
T[33]="El oso polar que llegó a un lugar cálido"; P[33]="Oso Polar Copito"; S[33]="Adaptación a cambios"
T[34]="El niño que siempre decía malas palabras"; P[34]="Niño Marcos"; S[34]="Control del lenguaje"
T[35]="La gatita que tenía miedo de conocer gente"; P[35]="Gatita Seda"; S[35]="Ansiedad social"
T[36]="El conejito que quería todo ya mismo"; P[36]="Conejo Prisa"; S[36]="Paciencia, frustración"
T[37]="La niña que se portó mal en el supermercado"; P[37]="Niña Lucía"; S[37]="Comportamiento en público"
T[38]="El niño que no quería compartir a su mamá"; P[38]="Niño Mateo"; S[38]="Posesividad con padres"
T[39]="La pequeña sirena que tenía miedo del agua"; P[39]="Sirena Marina"; S[39]="Miedo al agua"
T[40]="El ratón que mentía para caer bien"; P[40]="Ratón Cascabel"; S[40]="Autenticidad, aceptación"
T[41]="El niño que golpeó a su amigo sin querer"; P[41]="Niño Sebastián"; S[41]="Consecuencias físicas"
T[42]="La niña que no quería que sus padres salieran"; P[42]="Niña Emma"; S[42]="Ansiedad de separación"
T[43]="El pollito que tenía miedo de crecer"; P[43]="Pollito Pequeñín"; S[43]="Miedo a los cambios"
T[44]="El niño que no sabía cómo hacer amigos"; P[44]="Niño Gabriel"; S[44]="Habilidades sociales"
T[45]="La niña que se sentía invisible en clase"; P[45]="Niña Violeta"; S[45]="Necesidad de atención"
T[46]="El dragón pequeño que quería ser valiente"; P[46]="Dragón Chispas"; S[46]="Valentía, superar miedos"
T[47]="El niño que no quería compartir a su papá"; P[47]="Niño Daniel"; S[47]="Rivalidad fraterna con papá"
T[48]="La tortuga que llegó tarde a todo"; P[48]="Tortuga Calma"; S[48]="Ritmos diferentes, paciencia"
T[49]="El niño que perdió a Quelina en el bosque"; P[49]="Tú (el lector)"; S[49]="Buscar la sabiduría interior"
T[50]="Quelina y el secreto de las constelaciones"; P[50]="Quelina"; S[50]="Misterio del Tomo III, despedida"

START_TIME=$(date +%s)
TOTAL_COST=0

for NUM in $(seq 1 50); do
  if [ -f "$DIR/story-${NUM}.json" ]; then
    echo "⏭️  $NUM/50 exists"
    continue
  fi

  echo ""
  echo "📖 $NUM/50: ${T[$NUM]}"
  echo "   ${P[$NUM]} — ${S[$NUM]}"

  SPECIAL=""
  if [ "$NUM" -eq 49 ]; then
    SPECIAL="IMPORTANTE: Este cuento usa 'tú' para hablar directamente al lector. El protagonista es el niño que lee. El niño busca a Quelina por el bosque y la encuentra al final. Quelina dice: '¿Ves? Siempre estuve aquí. Dentro de cada historia que te contaron, dentro de cada abrazo que te dieron. Yo nunca me voy.' Este cuento debe hacer llorar a los padres."
  fi
  if [ "$NUM" -eq 50 ]; then
    SPECIAL="IMPORTANTE: Este es el cuento puente al Tomo III. Quelina revela que hay un río mágico más allá del bosque. Las constelaciones de su caparazón muestran el camino. Termina con: '¿Tienes el valor de seguir?' Es el gancho para el siguiente tomo."
  fi

  BODY=$(python3 << PYEOF
import json
system = """$SYSPROMPT"""
prompt = f"""Genera el cuento #{$NUM} del Tomo 2 "El Bosque de los Sentimientos" para niños de 3-4 años.
Título: ${T[$NUM]}
Personaje: ${P[$NUM]}
Situación: ${S[$NUM]}
El cuento debe tener 550-700 palabras.
Sigue la ESTRUCTURA OBLIGATORIA.
${SPECIAL}
Responde en JSON (sin markdown):
{{"numero":$NUM,"titulo":"","personaje":"","situacion":"","historia":"cuento COMPLETO","quelina_momento":"","moraleja":"1 frase","il_portada":"DALL-E prompt English Ghibli watercolor golden autumn NO white background","suno_prompt":"music prompt","suno_lyrics":"letra español"}}"""
print(json.dumps({"model":"claude-sonnet-4-20250514","max_tokens":5000,"system":system,"messages":[{"role":"user","content":prompt}]}))
PYEOF
  )

  RESP=$(curl -s --max-time 180 https://api.anthropic.com/v1/messages \
    -H "Content-Type: application/json" \
    -H "x-api-key: $AKEY" \
    -H "anthropic-version: 2023-06-01" \
    -d "$BODY")

  python3 -c "
import json, sys
try:
    d = json.loads(sys.argv[1])
    if 'error' in d:
        print(f'  ❌ {d[\"error\"]}')
        sys.exit(1)
    text = d['content'][0]['text'].strip()
    if text.startswith('\`\`\`json'): text = text[7:]
    if text.startswith('\`\`\`'): text = text[3:]
    if text.endswith('\`\`\`'): text = text[:-3]
    story = json.loads(text.strip())
    json.dump(story, open('$DIR/story-${NUM}.json','w'), ensure_ascii=False, indent=2)
    words = len(story.get('historia','').split())
    print(f'  ✅ {words}w — {story.get(\"moraleja\",\"\")}')
except Exception as e:
    print(f'  ❌ {e}')
" "$RESP"
  TOTAL_COST=$(python3 -c "print(round($TOTAL_COST + 0.04, 2))")
  sleep 1
done

echo ""
echo "═══ MERGING ═══"
python3 -c "
import json, glob
stories = []
for f in sorted(glob.glob('$DIR/story-*.json'), key=lambda x: int(''.join(c for c in x.split('/')[-1].split('.')[0].replace('story-','') if c.isdigit()) or '0')):
    if 'all-' not in f:
        try: stories.append(json.load(open(f)))
        except: pass
stories.sort(key=lambda s: s.get('numero', 0))
seen = set()
unique = []
for s in stories:
    n = s.get('numero', 0)
    if n not in seen and n > 0:
        seen.add(n)
        unique.append(s)
json.dump(unique, open('$DIR/all-stories.json','w'), ensure_ascii=False, indent=2)
print(f'Merged {len(unique)} unique stories')
"

ELAPSED=$(( ($(date +%s) - START_TIME) / 60 ))
echo ""
echo "═══════════════════════════════════════"
echo "  TOMO II COMPLETE!"
echo "  Time: ${ELAPSED} minutes"
echo "  Cost: ~\$$TOTAL_COST"
echo "═══════════════════════════════════════"
