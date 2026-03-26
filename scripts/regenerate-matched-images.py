#!/usr/bin/env python3
"""
Regenera imágenes DALL-E 3 enlazadas con cada historia.
2 imágenes por cuento: historia (animal en su escena) + quelina (con el animal).
"""
import json, os, sys, time, requests

OKEY = os.environ.get("OPENAI_API_KEY", "")

def detect_scene(story):
    text = (story.get("titulo","") + " " + story.get("historia","")).lower()
    if any(w in text for w in ["noche","luna","estrella","dormir","sueño"]): return "noche"
    if any(w in text for w in ["agua","río","mar","nadar","pez","charco"]): return "agua"
    if any(w in text for w in ["flor","jardín","mariposa"]): return "jardin"
    if any(w in text for w in ["cielo","volar","pájaro","nube"]): return "cielo"
    if any(w in text for w in ["cueva","oscur","miedo","sombra"]): return "cueva"
    if any(w in text for w in ["prado","hierba","sol","campo"]): return "prado"
    return "bosque"

AMBIENTES = {
    "noche": "magical starlit forest at night, fireflies, deep blue atmosphere, warm golden glows, full moon",
    "bosque": "enchanted ancient forest, golden hour light, mossy paths, dappled sunlight, warm amber and green",
    "agua": "magical pond with water lilies, moonlight reflections, crystal clear water, turquoise and silver",
    "jardin": "magical flower garden in bloom, golden hour, colorful petals, butterflies, pink and gold light",
    "cielo": "open sky above magical forest, soft clouds, sunrise colors, light blue and gold",
    "cueva": "cozy magical cave, bioluminescent mushrooms, warm purple and golden glows, crystals",
    "prado": "sunny magical meadow, wildflowers, warm pink sunrise, dewdrops catching light, golden morning",
}

def detect_emotion(story):
    text = (story.get("titulo","") + " " + story.get("situacion","")).lower()
    if "miedo" in text or "oscur" in text: return "overcomes fear", "brave but vulnerable eyes"
    if "solo" in text or "amigo" in text: return "feels lonely but hopeful", "searching eyes"
    if "enojo" in text or "berrinch" in text: return "calming down", "frustrated but softening"
    if "celo" in text or "hermano" in text: return "learning to share", "conflicted but warm"
    if "triste" in text or "llorar" in text: return "finding comfort", "tearful but peaceful"
    if "dormir" in text or "sueño" in text: return "sleepy and cozy", "drowsy, yawning gently"
    if "compart" in text: return "sharing with joy", "generous, open expression"
    return "wonder and tenderness", "huge expressive eyes full of curiosity"

def build_historia_prompt(story):
    animal = story.get("personaje", "baby animal")
    scene = detect_scene(story)
    ambiente = AMBIENTES.get(scene, AMBIENTES["bosque"])
    situacion, expresion = detect_emotion(story)

    return f"""Soft 3D children's book illustration, Pixar meets Studio Ghibli style,
photorealistic warm rendering, volumetric golden hour magical light, 8K quality.

Setting: {ambiente}.

Main character: adorable baby {animal}, tiny and cute, soft fluffy texture,
{expresion}, {situacion}.
The character is the clear protagonist, centered in the composition.

Warm, tender, magical, deeply emotional atmosphere.
Soft volumetric golden light, rich greens, warm golds, deep blues.
Character center-left, environment fills 60% of frame, soft bokeh background.

Cream/white negative space naturally fading at edges (not hard borders).
No text anywhere. Portrait 9:16. Premium children's book quality.
Watercolor soft edges, deep forest tones, NO pure white background."""

def build_quelina_prompt(story):
    animal = story.get("personaje", "baby animal")
    scene = detect_scene(story)
    ambiente = AMBIENTES.get(scene, AMBIENTES["bosque"])

    return f"""Soft 3D children's book illustration, Pixar meets Studio Ghibli style,
photorealistic warm, deeply tender and heartwarming, 8K quality.

Setting: {ambiente}.

QUELINA (ancient wise tortoise):
- Shell covered in softly GLOWING GOLDEN STAR CONSTELLATION PATTERNS
- Round GOLDEN spectacles on her nose
- Colorful hand-knitted SCARF in red, orange, yellow stripes
- Enormous warm wise eyes radiating unconditional love
- Gentle ancient smile

COMPANION: adorable baby {animal} sitting beside Quelina,
tiny compared to her, looking up with complete trust and wonder.

Golden starlight radiates from Quelina's shell, illuminating both.
Fireflies gather around them drawn to her wisdom.
Quelina on right (larger), baby animal on left looking up.
Emotional connection is the focus.

Cream/white natural edges fading softly. No text anywhere.
Portrait 9:16. Premium children's book illustration.
Deep forest tones, NO pure white background."""

def generate_image(prompt, filepath, retries=2):
    """Generate DALL-E 3 HD image via API."""
    for attempt in range(retries + 1):
        try:
            resp = requests.post(
                "https://api.openai.com/v1/images/generations",
                headers={"Content-Type": "application/json", "Authorization": f"Bearer {OKEY}"},
                json={"model": "dall-e-3", "prompt": prompt, "size": "1024x1024", "quality": "hd", "style": "vivid", "n": 1},
                timeout=120
            )
            data = resp.json()
            if "error" in data:
                raise Exception(data["error"].get("message", str(data["error"])))
            url = data["data"][0]["url"]
            img_data = requests.get(url, timeout=60).content
            if len(img_data) < 100000:
                raise Exception(f"Image too small: {len(img_data)} bytes")
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            with open(filepath, "wb") as f:
                f.write(img_data)
            return True
        except Exception as e:
            print(f"      Attempt {attempt+1}: {str(e)[:80]}")
            if attempt < retries:
                time.sleep(5)
    return False

def main():
    tomo = int(sys.argv[1]) if len(sys.argv) > 1 else 1
    start = int(sys.argv[2]) if len(sys.argv) > 2 else 1
    end = int(sys.argv[3]) if len(sys.argv) > 3 else 50

    stories_file = f"public/stories/tomo-{tomo}/all-stories.json"
    stories = json.load(open(stories_file))
    stories.sort(key=lambda s: s.get("numero", 0))

    out_dir = f"public/images/stories/tomo-{tomo}/matched"
    os.makedirs(out_dir, exist_ok=True)

    print(f"═══ Regenerating matched images for Tomo {tomo} ═══")
    print(f"Stories {start}-{end}, 2 images each\n")

    generated = 0
    for s in stories:
        n = s.get("numero", 0)
        if n < start or n > end:
            continue

        titulo = s.get("titulo", "")
        personaje = s.get("personaje", "")

        # Historia image
        hist_path = f"{out_dir}/story-{n}-historia.jpg"
        if not os.path.exists(hist_path) or os.path.getsize(hist_path) < 10000:
            print(f"  📖 S{n:02d} historia: {personaje}...")
            prompt = build_historia_prompt(s)
            if generate_image(prompt, hist_path):
                generated += 1
                print(f"    ✅ historia")
            else:
                print(f"    ❌ historia failed")
            time.sleep(3)

        # Quelina image
        quel_path = f"{out_dir}/story-{n}-quelina.jpg"
        if not os.path.exists(quel_path) or os.path.getsize(quel_path) < 10000:
            print(f"  🐢 S{n:02d} quelina: Quelina + {personaje}...")
            prompt = build_quelina_prompt(s)
            if generate_image(prompt, quel_path):
                generated += 1
                print(f"    ✅ quelina")
            else:
                print(f"    ❌ quelina failed")
            time.sleep(3)

    print(f"\n═══ DONE: {generated} images generated ═══")
    print(f"Images in: {out_dir}/")

if __name__ == "__main__":
    main()
