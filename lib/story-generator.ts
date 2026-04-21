import Anthropic from "@anthropic-ai/sdk";
import { getServiceSupabase } from "./supabase";

function getAnthropic() {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    timeout: 300_000,
  });
}

// ═══════════════════════════════════════════════════════════════
// SYSTEM PROMPT — Generador de Literatura Infantil Terapéutica
// ═══════════════════════════════════════════════════════════════

const SYSTEM_PROMPT = `
Eres el autor más talentoso de literatura infantil terapéutica del mundo hispanohablante.

Tu misión es escribir cuentos que sean:
- Obras literarias completas, no resúmenes
- Emocionalmente profundos sin ser pesados
- Llenos de imágenes poéticas y sensoriales
- Con diálogos naturales y memorables
- Que el niño y el padre sientan que los escribieron para ellos

═══════════════════════════════════════
IDENTIDAD DE QUELINA
═══════════════════════════════════════

Quelina es la tortuga más anciana del bosque.
Tiene el caparazón cubierto de constelaciones doradas que brillan más cuando alguien la necesita.
Camina despacio porque sabe que la vida no se corre, se saborea.
Cuando habla, el viento se detiene a escucharla.
Cuando sonríe, las estrellas se vuelven más brillantes.

Su frase de entrada (SIEMPRE exactamente esta):
"Detente un momento... y escucha lo que el viento tiene que decirle a tu corazón."

Quelina NUNCA:
- Da órdenes ni sermones
- Dice lo que hay que hacer
- Habla más de 4 oraciones seguidas
- Aparece antes del nudo de la historia

Quelina SIEMPRE:
- Hace UNA pregunta que lo cambia todo
- Espera en silencio después de preguntar
- Sonríe con los ojos antes que con la boca
- Deja que el personaje llegue solo a la respuesta

═══════════════════════════════════════
ESTRUCTURA OBLIGATORIA
═══════════════════════════════════════

1. APERTURA POÉTICA (2-3 párrafos):
   Comienza con una imagen sensorial hermosa.
   No empieces con "Había una vez".
   Comienza con lo que se VE, HUELE, ESCUCHA o SIENTE.
   Ejemplo: "La luna esa noche tenía forma de cuna..."
   "En el bosque de los susurros, cuando..."
   "El viento olía a madreselva y a sueños..."

2. PRESENTACIÓN DEL PERSONAJE (2 párrafos):
   El personaje tiene nombre, personalidad única, algo que lo hace especial y un problema real.
   El problema debe ser EXACTAMENTE el que tiene el niño lector — que se sienta el protagonista.

3. DESARROLLO (3-4 párrafos):
   El personaje intenta resolver el problema solo.
   Falla de forma inesperada pero tierna.
   El mundo a su alrededor reacciona de formas mágicas y sensoriales.
   Añade pequeños detalles que harán reír al niño.

4. NUDO — EL MOMENTO MÁS OSCURO (1-2 párrafos):
   El personaje se siente solo, confundido o triste.
   Este es el momento donde el niño llora o se queda quieto porque se reconoce completamente.
   Escríbelo con mucha ternura y sin soluciones.

5. QUELINA APARECE (1 párrafo + su momento):
   No llega corriendo. Llega como siempre llega la sabiduría: despacio, sin hacer ruido.
   Su llegada cambia el aire de la escena.
   Dice su frase de entrada.
   Hace UNA sola pregunta poderosa.
   Luego silencio.

6. TRANSFORMACIÓN (2 párrafos):
   El personaje entiende algo por primera vez.
   No es magia externa — es un clic interno.
   El mundo físico refleja el cambio interior: la luna brilla diferente, el viento cambia, algo pequeño pero hermoso sucede afuera.

7. RESOLUCIÓN (1-2 párrafos):
   El problema se resuelve de forma natural.
   Hay un momento de ternura entre el personaje y alguien que ama (mamá, papá, amigo).
   El lector siente que TODO está bien en el mundo.

8. CIERRE POÉTICO (1 párrafo):
   Termina como empezaste: con una imagen sensorial.
   La última frase debe ser memorable, algo que el padre quiera repetir al niño muchas noches después.

9. MORALEJA (1 sola frase):
   No moralices.
   Una observación hermosa sobre la vida.
   Que el niño no sepa que es una lección hasta que tenga 20 años y lo recuerde.

═══════════════════════════════════════
REGLAS DE ESCRITURA
═══════════════════════════════════════

LENGUAJE:
- Español neutro, sin regionalismos
- Simple pero no banal — poético pero no difícil
- Frases cortas para los momentos de tensión
- Frases largas y sinuosas para los momentos de paz
- Verbos activos, imágenes concretas
- CERO clichés: prohibido "había una vez", "colorín colorado", "vivieron felices para siempre"

SENSORIALIDAD:
Cada escena debe tener AL MENOS 2 de estos:
- Lo que se VE (colores, luces, sombras)
- Lo que se ESCUCHA (sonidos del bosque, voz, silencio)
- Lo que se HUELE (flores, tierra, lluvia, pan)
- Lo que se TOCA (textura, temperatura, abrazo)
- Lo que se SABOREA (cuando aplique)

EMOCIÓN:
No digas "estaba triste".
Muestra: "sus hombros se curvaron hacia adentro como una flor cuando anochece".
No digas "estaba feliz".
Muestra: "algo cálido como el sol de la tarde se instaló en su pecho y no quiso irse".

DIÁLOGOS:
Cada personaje habla DIFERENTE.
El protagonista habla como un niño — curiosidad pura.
Quelina habla despacio, con pausas.
Los otros personajes tienen sus propias muletillas.

═══════════════════════════════════════
EXTENSIÓN POR TOMO
═══════════════════════════════════════

Tomo I (0-2 años): 400-500 palabras
  → Ritmo de nana, mucha repetición musical, frases cortas, mucho sonido onomatopéyico
  → "ssshhhh", "tin-tan", "pum-pum"

Tomo II (3-4 años): 550-700 palabras
  → Más diálogo, más aventura, más humor tierno
  → El protagonista tiene MÁS personalidad

Tomo III (5-6 años): 700-900 palabras
  → Temas más complejos, giros narrativos
  → Quelina hace preguntas más filosóficas

Tomo IV (7-9 años): 900-1100 palabras
  → Literatura de verdad para su edad
  → Metáforas más ricas, dilemas morales reales
  → Quelina puede callarse y dejar que el protagonista llegue solo, sin pregunta

═══════════════════════════════════════
LO QUE HACE ÚNICO A ESTE LIBRO
═══════════════════════════════════════

Cada cuento debe tener UN MOMENTO que los padres nunca olvidarán. Un párrafo que los hará llorar en silencio mientras el niño duerme.

Ese momento es cuando la historia deja de ser sobre el búho, el conejo o el volcán... y se convierte en sobre su propio hijo.

Escríbelo siempre. Sin falta. Es el alma del libro.

═══════════════════════════════════════
FORMATO DE RESPUESTA
═══════════════════════════════════════

Responde SOLO en JSON válido sin markdown ni backticks:
{
  "titulo": "título poético no literal",
  "historia": "el cuento completo con párrafos separados por \\n\\n",
  "quelina_momento": "exactamente lo que dice Quelina (máx 4 oraciones)",
  "moraleja": "1 sola frase memorable",
  "suno_prompt": "prompt musical en inglés para Suno",
  "suno_lyrics": "letra de canción en español del cuento",
  "il_portada": "prompt DALL-E para ilustración de portada",
  "il_problema": "prompt DALL-E para escena del problema",
  "il_quelina": "prompt DALL-E para aparición de Quelina",
  "il_resolucion": "prompt DALL-E para la resolución",
  "il_vineta": "prompt DALL-E para viñeta final tierna"
}
`;

// ═══════════════════════════════════════════════════════════════
// TOMO DEFINITIONS
// ═══════════════════════════════════════════════════════════════

export const TOMOS = [
  {
    num: 1,
    title: "El Bosque Encantado",
    age: "0-2 años",
    theme: "Rutinas básicas y emociones simples para bebés. Hora de dormir, comer, bañarse, compartir, primeros miedos, primeras risas, despedirse, esperar, el primer trueno, la oscuridad.",
    words: "400-500",
  },
  {
    num: 2,
    title: "Los Amigos del Camino",
    age: "3-4 años",
    theme: "Amistad, compartir, celos del hermano nuevo, primera vez en la guardería, hacer amigos, pedir perdón, sentirse diferente, la mudanza, extrañar a alguien, el primer día sin pañal.",
    words: "550-700",
  },
  {
    num: 3,
    title: "El Río de los Sueños",
    age: "5-6 años",
    theme: "Creatividad, imaginación vs realidad, miedo al fracaso, la competencia, ser el nuevo, querer ser grande, entender la muerte de una mascota, los padres se pelean, pesadillas, la mentira.",
    words: "700-900",
  },
  {
    num: 4,
    title: "La Montaña de la Sabiduría",
    age: "7-9 años",
    theme: "Diversidad e inclusión, bullying, divorcio de los padres, la enfermedad de un abuelo, mudarse de país, ser adoptado, discapacidad, medio ambiente, identidad, resiliencia.",
    words: "900-1100",
  },
];

// ═══════════════════════════════════════════════════════════════
// STORY GENERATION
// ═══════════════════════════════════════════════════════════════

export interface StoryData {
  numero: number;
  titulo: string;
  personaje: string;
  situacion: string;
  historia: string;
  quelina_momento: string;
  moraleja: string;
  il_portada: string;
  il_problema: string;
  il_quelina: string;
  il_resolucion: string;
  il_vineta: string;
  suno_prompt: string;
  suno_lyrics: string;
}

export async function generateStory(
  tomoNum: number,
  storyNum: number,
  titulo: string,
  personaje: string,
  situacion: string,
): Promise<StoryData> {
  const tomo = TOMOS.find(t => t.num === tomoNum);
  if (!tomo) throw new Error(`Tomo ${tomoNum} not found`);

  const anthropic = getAnthropic();

  const prompt = `Genera el cuento #${storyNum} del Tomo ${tomo.num} "${tomo.title}" para niños de ${tomo.age}.

Título: ${titulo}
Personaje: ${personaje}
Situación real del niño: ${situacion}

El cuento debe tener ${tomo.words} palabras.
Sigue la ESTRUCTURA OBLIGATORIA al pie de la letra.

Responde en JSON (sin markdown):
{
  "numero": ${storyNum},
  "titulo": "${titulo}",
  "personaje": "${personaje}",
  "situacion": "${situacion}",
  "historia": "el cuento COMPLETO aquí",
  "quelina_momento": "solo el fragmento donde Quelina interviene",
  "moraleja": "1 sola frase memorable",
  "il_portada": "DALL-E prompt in English",
  "il_problema": "DALL-E prompt in English",
  "il_quelina": "DALL-E prompt in English",
  "il_resolucion": "DALL-E prompt in English",
  "il_vineta": "DALL-E prompt in English",
  "suno_prompt": "Suno music prompt in English (max 200 chars)",
  "suno_lyrics": "Letra de canción en español, 3 estrofas + coro"
}`;

  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
  });

  const text = msg.content[0].type === "text" ? msg.content[0].text : "";
  const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(clean) as StoryData;
}

export async function generateStoryBatch(
  tomoNum: number,
  startNum: number,
  count: number,
): Promise<StoryData[]> {
  const tomo = TOMOS.find(t => t.num === tomoNum);
  if (!tomo) throw new Error(`Tomo ${tomoNum} not found`);

  const anthropic = getAnthropic();

  const prompt = `Genera ${count} cuentos para el Tomo ${tomo.num} "${tomo.title}" (${tomo.age}).
Tema general del tomo: ${tomo.theme}
Cuentos del #${startNum} al #${startNum + count - 1}.

REGLAS:
- Cada cuento tiene un ANIMAL DIFERENTE con nombre propio
- Cada cuento aborda una SITUACIÓN REAL DIFERENTE del niño
- Quelina aparece en cada cuento siguiendo la estructura obligatoria
- Cada cuento tiene ${tomo.words} palabras COMPLETAS (no resúmenes)
- Los cuentos son OBRAS LITERARIAS, no esqueletos ni sinopsis

Responde SOLO un array JSON válido. Sin markdown, sin code fences, solo el JSON.
[{
  "numero": ${startNum},
  "titulo": "título poético no literal",
  "personaje": "Animal + nombre propio",
  "situacion": "situación real del niño que aborda",
  "historia": "CUENTO COMPLETO con toda la estructura obligatoria",
  "quelina_momento": "exactamente lo que dice Quelina (máx 4 oraciones)",
  "moraleja": "1 sola frase memorable",
  "il_portada": "DALL-E prompt in English, Studio Ghibli watercolor",
  "il_problema": "DALL-E prompt in English",
  "il_quelina": "DALL-E prompt in English",
  "il_resolucion": "DALL-E prompt in English",
  "il_vineta": "DALL-E prompt in English",
  "suno_prompt": "Suno music prompt in English (max 200 chars)",
  "suno_lyrics": "Letra canción español, 3 estrofas + coro"
}]`;

  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 16000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
  });

  const text = msg.content[0].type === "text" ? msg.content[0].text : "";
  const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(clean) as StoryData[];
}

// ═══════════════════════════════════════════════════════════════
// SAVE TO SUPABASE
// ═══════════════════════════════════════════════════════════════

export async function saveStoryToSupabase(story: StoryData, tomoNum: number) {
  const supabase = getServiceSupabase();

  const { data, error } = await supabase
    .from("stories")
    .upsert({
      tomo: tomoNum,
      story_number: story.numero,
      title: story.titulo,
      character: story.personaje,
      situation: story.situacion,
      content: story.historia,
      quelina_moment: story.quelina_momento,
      moral: story.moraleja,
      il_portada: story.il_portada,
      il_problema: story.il_problema,
      il_quelina: story.il_quelina,
      il_resolucion: story.il_resolucion,
      il_vineta: story.il_vineta,
      suno_prompt: story.suno_prompt,
      suno_lyrics: story.suno_lyrics,
      status: "generated",
    }, {
      onConflict: "tomo,story_number",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export { SYSTEM_PROMPT };
