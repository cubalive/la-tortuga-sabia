import fs from "fs";
import https from "https";
import path from "path";

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY!;
const OPENAI_KEY = process.env.OPENAI_API_KEY!;

// Extract SYSTEM_PROMPT from lib
const libSrc = fs.readFileSync(path.join(__dirname, "../lib/story-generator.ts"), "utf-8");
const spStart = libSrc.indexOf("const SYSTEM_PROMPT = `") + "const SYSTEM_PROMPT = `".length;
const spEnd = libSrc.indexOf("`;", spStart);
const SYSTEM_PROMPT = libSrc.slice(spStart, spEnd).trim();

function downloadImage(url: string, filepath: string): Promise<void> {
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on("finish", () => { file.close(); resolve(); });
    }).on("error", reject);
  });
}

// 50 stories for Tomo I — El Bosque Encantado (0-2 años)
const CATALOGO = [
  { num: 1, titulo: "El búho que no quería cerrar los ojos", personaje: "Búho bebé Buby", situacion: "No quiere dormir, miedo a perderse algo" },
  { num: 2, titulo: "La ranita que saltaba sin parar", personaje: "Rana bebé Lila", situacion: "No puede quedarse quieta, hiperactividad" },
  { num: 3, titulo: "El conejito que no quería compartir su zanahoria", personaje: "Conejo bebé Milo", situacion: "No quiere compartir sus juguetes" },
  { num: 4, titulo: "La mariposa que tenía miedo de volar", personaje: "Mariposa bebé Luna", situacion: "Miedo a lo desconocido, primeros pasos" },
  { num: 5, titulo: "El patito que no quería bañarse", personaje: "Pato bebé Plop", situacion: "Resiste la hora del baño" },
  { num: 6, titulo: "La hormiguita que cargaba demasiado", personaje: "Hormiga bebé Pía", situacion: "Quiere hacerlo todo sola, no pide ayuda" },
  { num: 7, titulo: "El gatito que arañaba todo", personaje: "Gato bebé Mishi", situacion: "Frustración, berrinches, no sabe expresarse" },
  { num: 8, titulo: "El pececito que no quería nadar solo", personaje: "Pez bebé Burbuja", situacion: "Ansiedad de separación, aferrarse a mamá" },
  { num: 9, titulo: "La tortugita que caminaba muy despacio", personaje: "Tortuga bebé Tita", situacion: "Sentirse diferente, ir a su propio ritmo" },
  { num: 10, titulo: "El cachorro que ladraba a la luna", personaje: "Perro bebé Trueno", situacion: "Miedo a los ruidos fuertes, truenos" },
  { num: 11, titulo: "La abejita que no encontraba su flor", personaje: "Abeja bebé Zuri", situacion: "Sentirse perdida, buscar su lugar" },
  { num: 12, titulo: "El elefantito que pisaba las flores", personaje: "Elefante bebé Trompi", situacion: "Torpeza, sentirse grande y torpe" },
  { num: 13, titulo: "La luciérnaga que perdió su luz", personaje: "Luciérnaga bebé Brilli", situacion: "Perder la confianza en sí misma" },
  { num: 14, titulo: "El pollito que no quería comer", personaje: "Pollito bebé Pico", situacion: "Selectivo con la comida, no quiere comer" },
  { num: 15, titulo: "La ardillita que escondía todo", personaje: "Ardilla bebé Nuca", situacion: "Acaparar cosas, miedo a perder lo que tiene" },
  { num: 16, titulo: "El osito que no quería soltar su manta", personaje: "Oso bebé Pelusa", situacion: "Apego a un objeto de consuelo" },
  { num: 17, titulo: "La cebrita que no le gustaban sus rayas", personaje: "Cebra bebé Zigzag", situacion: "No aceptar su apariencia, quererse diferente" },
  { num: 18, titulo: "El caracolito que se escondía siempre", personaje: "Caracol bebé Casita", situacion: "Timidez extrema, esconderse del mundo" },
  { num: 19, titulo: "La ovejita que no podía dormir sin su mamá", personaje: "Oveja bebé Lana", situacion: "Primer noche sola, independencia" },
  { num: 20, titulo: "El ratoncito que tenía miedo de la oscuridad", personaje: "Ratón bebé Bigotes", situacion: "Miedo a la oscuridad" },
  { num: 21, titulo: "La jirafa que no alcanzaba a sus amigos", personaje: "Jirafa bebé Cuello", situacion: "Sentirse diferente por su tamaño" },
  { num: 22, titulo: "El cerdito que se ensuciaba mucho", personaje: "Cerdo bebé Lodito", situacion: "Limpieza e higiene, aprender rutinas" },
  { num: 23, titulo: "La foquita que resbalaba en el hielo", personaje: "Foca bebé Desliz", situacion: "Caerse y levantarse, perseverancia" },
  { num: 24, titulo: "El león bebé que rugía muy bajito", personaje: "León bebé Rugido", situacion: "Sentirse pequeño, querer ser fuerte" },
  { num: 25, titulo: "La pingüinita que tenía frío", personaje: "Pingüina bebé Copo", situacion: "Necesitar un abrazo, pedir cariño" },
  { num: 26, titulo: "El camaleón que cambiaba de color sin querer", personaje: "Camaleón bebé Arcoíris", situacion: "Emociones desbordantes, no controlar lo que siente" },
  { num: 27, titulo: "La mariposita que extrañaba ser oruga", personaje: "Mariposa bebé Capullo", situacion: "Miedo a crecer, extrañar cómo era antes" },
  { num: 28, titulo: "El cangrejo que caminaba para atrás", personaje: "Cangrejo bebé Pinza", situacion: "Hacer las cosas diferente a los demás" },
  { num: 29, titulo: "La palomita que no quería volver al nido", personaje: "Paloma bebé Pluma", situacion: "No querer irse a casa, querer seguir jugando" },
  { num: 30, titulo: "El sapito que croaba muy fuerte", personaje: "Sapo bebé Croac", situacion: "Hablar muy alto, no medir su voz" },
  { num: 31, titulo: "La estrella de mar que se sentía sola", personaje: "Estrella de mar bebé Coral", situacion: "Soledad, querer un amigo" },
  { num: 32, titulo: "El koala que no quería bajarse del árbol", personaje: "Koala bebé Abrazo", situacion: "No querer separarse, aferrarse" },
  { num: 33, titulo: "La vaquita que mugía de noche", personaje: "Vaca bebé Manchita", situacion: "Pesadillas, miedos nocturnos" },
  { num: 34, titulo: "El delfín que salpicaba a todos", personaje: "Delfín bebé Splash", situacion: "No medir consecuencias de sus actos" },
  { num: 35, titulo: "La mariquita que perdió un puntito", personaje: "Mariquita bebé Puntitos", situacion: "Perder algo pequeño pero importante" },
  { num: 36, titulo: "El murciélago que tenía miedo del día", personaje: "Murciélago bebé Sombra", situacion: "Ser diferente, vivir al revés que los demás" },
  { num: 37, titulo: "La nutria que no quería soltar a su mamá", personaje: "Nutria bebé Flotis", situacion: "Primera vez en la guardería" },
  { num: 38, titulo: "El perezoso que se perdió la fiesta", personaje: "Perezoso bebé Lento", situacion: "Ir a su ritmo cuando todos van rápido" },
  { num: 39, titulo: "La tortolita que repetía todo", personaje: "Tórtola bebé Eco", situacion: "Etapa de repetir todo, aprender a hablar" },
  { num: 40, titulo: "El erizo que pinchaba sin querer", personaje: "Erizo bebé Púas", situacion: "Lastimar a otros sin intención" },
  { num: 41, titulo: "La cría de flamenco que no se sostenía", personaje: "Flamenco bebé Rosita", situacion: "Aprender a caminar, caerse" },
  { num: 42, titulo: "El lorito que decía no a todo", personaje: "Loro bebé Nono", situacion: "La etapa del no, oposición" },
  { num: 43, titulo: "La cría de cisne que se veía fea", personaje: "Cisne bebé Gris", situacion: "No sentirse bonito, autoestima" },
  { num: 44, titulo: "El hipopótamo que ocupaba mucho espacio", personaje: "Hipopótamo bebé Gordi", situacion: "Sentirse grande entre los demás" },
  { num: 45, titulo: "La cría de búfalo que embistió sin querer", personaje: "Búfalo bebé Toro", situacion: "Fuerza descontrolada, juego brusco" },
  { num: 46, titulo: "El puercoespín que quería un abrazo", personaje: "Puercoespín bebé Bolita", situacion: "Querer cariño pero tener miedo de acercarse" },
  { num: 47, titulo: "La cría de zorro que se perdió en el bosque", personaje: "Zorro bebé Rojo", situacion: "Perderse, encontrar el camino de vuelta" },
  { num: 48, titulo: "El grillito que cantaba cuando todos dormían", personaje: "Grillo bebé Cri-Cri", situacion: "Hacer ruido a deshoras, respetar el silencio" },
  { num: 49, titulo: "La luciérnaga que brillaba de día", personaje: "Luciérnaga bebé Solecito", situacion: "Brillar cuando nadie más lo hace, ser único" },
  { num: 50, titulo: "El nido vacío que esperaba", personaje: "Nido del bosque", situacion: "Despedirse, el último cuento del tomo" },
];

function httpPost(url: string, headers: Record<string, string>, body: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const data = JSON.stringify(body);
    const req = https.request({
      hostname: u.hostname,
      path: u.pathname,
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json", "Content-Length": Buffer.byteLength(data) },
      timeout: 180_000,
    }, (res) => {
      let body = "";
      res.on("data", (c: Buffer) => body += c.toString());
      res.on("end", () => { try { resolve(JSON.parse(body)); } catch { reject(new Error("JSON parse: " + body.substring(0, 100))); } });
    });
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("timeout")); });
    req.write(data);
    req.end();
  });
}

async function callClaude(systemPrompt: string, userPrompt: string, retries = 2): Promise<string | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const data = await httpPost("https://api.anthropic.com/v1/messages", {
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      }, {
        model: "claude-sonnet-4-6",
        max_tokens: 4000,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      });
      if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
      return data.content[0].text;
    } catch (e: any) {
      console.error(`    Retry ${attempt + 1}: ${e.message?.substring(0, 80)}`);
      if (attempt < retries) await new Promise(r => setTimeout(r, 5000));
    }
  }
  return null;
}

async function callDallE(prompt: string, retries = 2): Promise<string | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const data = await httpPost("https://api.openai.com/v1/images/generations", {
        "Authorization": `Bearer ${OPENAI_KEY}`,
      }, {
        model: "dall-e-3",
        prompt: prompt + " Watercolor children book illustration, Studio Ghibli style, warm colors, no text, cute magical.",
        n: 1, size: "1024x1024", quality: "hd", style: "vivid",
      });
      if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
      return data.data[0].url;
    } catch (e: any) {
      console.error(`    DALL-E retry ${attempt + 1}: ${e.message?.substring(0, 80)}`);
      if (attempt < retries) await new Promise(r => setTimeout(r, 5000));
    }
  }
  return null;
}

async function generateStory(entry: typeof CATALOGO[0]): Promise<any> {
  const prompt = `Genera el cuento #${entry.num} del Tomo 1 "El Bosque Encantado" para niños de 0-2 años.

Título: ${entry.titulo}
Personaje: ${entry.personaje}
Situación real del niño: ${entry.situacion}

El cuento debe tener 400-500 palabras.
Sigue la ESTRUCTURA OBLIGATORIA al pie de la letra.

Responde en JSON (sin markdown, sin code fences):
{
  "numero": ${entry.num},
  "titulo": "",
  "personaje": "",
  "situacion": "",
  "historia": "el cuento COMPLETO",
  "quelina_momento": "solo el fragmento donde Quelina interviene",
  "moraleja": "1 sola frase memorable",
  "il_portada": "DALL-E prompt in English, Studio Ghibli watercolor style",
  "il_problema": "DALL-E prompt in English",
  "il_quelina": "DALL-E prompt in English",
  "il_resolucion": "DALL-E prompt in English",
  "il_vineta": "DALL-E prompt in English",
  "suno_prompt": "Suno music prompt in English (max 200 chars)",
  "suno_lyrics": "Letra canción español, 3 estrofas + coro"
}`;

  const text = await callClaude(SYSTEM_PROMPT, prompt);
  if (!text) return null;
  try {
    const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(clean);
  } catch {
    console.error("    JSON parse failed");
    return null;
  }
}

async function generateImage(prompt: string, filepath: string): Promise<boolean> {
  const url = await callDallE(prompt);
  if (!url) return false;
  try {
    await downloadImage(url, filepath);
    return true;
  } catch (e: any) {
    console.error(`    Download failed: ${e.message?.substring(0, 60)}`);
    return false;
  }
}

async function main() {
  const startTime = Date.now();
  console.log("═══════════════════════════════════════");
  console.log("  TOMO I — El Bosque Encantado");
  console.log("  50 cuentos + 5 ilustraciones cada uno");
  console.log("═══════════════════════════════════════\n");

  const dir = "public/stories/tomo-1";
  const imgDir = "public/images/stories/tomo-1";
  fs.mkdirSync(dir, { recursive: true });
  fs.mkdirSync(imgDir, { recursive: true });

  // Load existing progress
  const progressFile = `${dir}/progress.json`;
  let completed: number[] = [];
  if (fs.existsSync(progressFile)) {
    completed = JSON.parse(fs.readFileSync(progressFile, "utf-8"));
    console.log(`  Resuming — ${completed.length} already done\n`);
  }

  const allStories: any[] = [];
  // Load existing stories
  const allFile = `${dir}/all-stories.json`;
  if (fs.existsSync(allFile)) {
    allStories.push(...JSON.parse(fs.readFileSync(allFile, "utf-8")));
  }

  let totalImages = 0;
  let totalCost = 0;

  for (const entry of CATALOGO) {
    if (completed.includes(entry.num)) {
      console.log(`  ⏭️  ${entry.num}/50: ${entry.titulo} (already done)`);
      continue;
    }

    console.log(`\n  📖 ${entry.num}/50: ${entry.titulo}`);
    console.log(`     ${entry.personaje} — ${entry.situacion}`);

    // Generate story
    const story = await generateStory(entry);
    if (!story) {
      console.log(`  ❌ Story failed, skipping`);
      continue;
    }
    console.log(`     ✅ Story: ${story.historia?.split(" ").length || 0} words`);
    totalCost += 0.03; // Claude estimate

    // Generate 5 illustrations
    const ilKeys = ["il_portada", "il_problema", "il_quelina", "il_resolucion", "il_vineta"];
    const ilNames = ["portada", "problema", "quelina", "resolucion", "vineta"];

    for (let i = 0; i < 5; i++) {
      const imgPath = `${imgDir}/story-${entry.num}-${ilNames[i]}.jpg`;
      if (fs.existsSync(imgPath) && fs.statSync(imgPath).size > 1000) {
        console.log(`     ⏭️  ${ilNames[i]} exists`);
        totalImages++;
        continue;
      }
      const ok = await generateImage(story[ilKeys[i]] || "", imgPath);
      if (ok) {
        totalImages++;
        console.log(`     ✅ ${ilNames[i]}`);
      }
      totalCost += 0.08;
      await new Promise(r => setTimeout(r, 3000));
    }

    // Add image paths
    story.cover_image = `/images/stories/tomo-1/story-${entry.num}-portada.jpg`;

    // Save individual story
    fs.writeFileSync(`${dir}/story-${entry.num}.json`, JSON.stringify(story, null, 2));

    // Update all-stories
    const existing = allStories.findIndex((s: any) => s.numero === entry.num);
    if (existing >= 0) allStories[existing] = story;
    else allStories.push(story);
    allStories.sort((a: any, b: any) => a.numero - b.numero);
    fs.writeFileSync(allFile, JSON.stringify(allStories, null, 2));

    // Save progress
    completed.push(entry.num);
    fs.writeFileSync(progressFile, JSON.stringify(completed));

    const elapsed = ((Date.now() - startTime) / 60000).toFixed(1);
    console.log(`  ✅ Cuento ${entry.num}/50 completado (${elapsed}min, ~$${totalCost.toFixed(2)})`);
  }

  console.log("\n═══════════════════════════════════════");
  console.log("  TOMO I COMPLETE!");
  console.log(`  Stories: ${allStories.length}`);
  console.log(`  Images: ${totalImages}`);
  console.log(`  Cost: ~$${totalCost.toFixed(2)}`);
  console.log(`  Time: ${((Date.now() - startTime) / 60000).toFixed(1)} min`);
  console.log("═══════════════════════════════════════\n");

  allStories.forEach((s: any) => console.log(`  #${s.numero}: ${s.titulo} (${s.moraleja})`));
}

main().catch(console.error);
