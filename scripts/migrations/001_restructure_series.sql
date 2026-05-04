-- ============================================================
-- La Tortuga Sabia — Migración 001: Reestructuración de Serie
-- Supabase: ebkwgrvqavutbfxkwore
-- ============================================================

CREATE TABLE IF NOT EXISTS stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tomo INTEGER NOT NULL CHECK (tomo BETWEEN 1 AND 7),
  numero_en_tomo INTEGER NOT NULL CHECK (numero_en_tomo BETWEEN 1 AND 33),
  titulo VARCHAR(200) NOT NULL,
  resumen TEXT,
  cuento_completo TEXT NOT NULL,
  moraleja TEXT NOT NULL,
  actividad_sugerida TEXT,
  tematica_terapeutica VARCHAR(100),
  edad_sugerida VARCHAR(20),
  grupo_edad VARCHAR(20) DEFAULT 'primario',
  palabras_count INTEGER,
  revisado_gramaticalmente BOOLEAN DEFAULT false,
  imagen_url TEXT,
  audio_url TEXT,
  pdf_url TEXT,
  tiene_imagen BOOLEAN DEFAULT false,
  tiene_audio BOOLEAN DEFAULT false,
  estado VARCHAR(20) DEFAULT 'borrador' CHECK (estado IN ('borrador', 'revision', 'publicado', 'archivado')),
  generado_en TIMESTAMPTZ DEFAULT now(),
  actualizado_en TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tomo, numero_en_tomo)
);

CREATE TABLE IF NOT EXISTS tomos (
  id INTEGER PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  subtitulo TEXT,
  descripcion TEXT,
  tematica_principal VARCHAR(200),
  grupo_edad VARCHAR(20) NOT NULL,
  edad_min INTEGER NOT NULL,
  edad_max INTEGER NOT NULL,
  total_cuentos INTEGER NOT NULL DEFAULT 33,
  cuentos_generados INTEGER DEFAULT 0,
  pdf_url TEXT,
  pdf_sin_imagenes_url TEXT,
  precio_pdf DECIMAL(10,2) DEFAULT 9.99,
  precio_pdf_audio DECIMAL(10,2) DEFAULT 19.99,
  precio_fisico DECIMAL(10,2) DEFAULT 24.99,
  portada_url TEXT,
  estado VARCHAR(20) DEFAULT 'en_progreso',
  creado_en TIMESTAMPTZ DEFAULT now(),
  actualizado_en TIMESTAMPTZ DEFAULT now()
);

-- Añadir columnas que pueden faltar si la tabla ya existía
ALTER TABLE tomos ADD COLUMN IF NOT EXISTS subtitulo TEXT;
ALTER TABLE tomos ADD COLUMN IF NOT EXISTS descripcion TEXT;
ALTER TABLE tomos ADD COLUMN IF NOT EXISTS tematica_principal VARCHAR(200);
ALTER TABLE tomos ADD COLUMN IF NOT EXISTS grupo_edad VARCHAR(20);
ALTER TABLE tomos ADD COLUMN IF NOT EXISTS edad_min INTEGER;
ALTER TABLE tomos ADD COLUMN IF NOT EXISTS edad_max INTEGER;
ALTER TABLE tomos ADD COLUMN IF NOT EXISTS total_cuentos INTEGER;
ALTER TABLE tomos ADD COLUMN IF NOT EXISTS cuentos_generados INTEGER DEFAULT 0;
ALTER TABLE tomos ADD COLUMN IF NOT EXISTS pdf_url TEXT;
ALTER TABLE tomos ADD COLUMN IF NOT EXISTS pdf_sin_imagenes_url TEXT;
ALTER TABLE tomos ADD COLUMN IF NOT EXISTS precio_pdf DECIMAL(10,2) DEFAULT 9.99;
ALTER TABLE tomos ADD COLUMN IF NOT EXISTS precio_pdf_audio DECIMAL(10,2) DEFAULT 19.99;
ALTER TABLE tomos ADD COLUMN IF NOT EXISTS precio_fisico DECIMAL(10,2) DEFAULT 24.99;
ALTER TABLE tomos ADD COLUMN IF NOT EXISTS portada_url TEXT;
ALTER TABLE tomos ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'en_progreso';
ALTER TABLE tomos ADD COLUMN IF NOT EXISTS creado_en TIMESTAMPTZ DEFAULT now();
ALTER TABLE tomos ADD COLUMN IF NOT EXISTS actualizado_en TIMESTAMPTZ DEFAULT now();

INSERT INTO tomos (id, titulo, subtitulo, tematica_principal, grupo_edad, edad_min, edad_max, total_cuentos, precio_pdf, precio_pdf_audio, precio_fisico)
VALUES
  (1,'El Despertar de Quelina','Cuentos de autoconocimiento y primeras emociones','Autoconocimiento, emociones básicas, curiosidad','primario',4,8,33,9.99,19.99,24.99),
  (2,'El Bosque de los Miedos','Cuentos de valentía y confianza','Valentía, superar el miedo, confianza en sí mismo','primario',4,8,33,9.99,19.99,24.99),
  (3,'El Mar de las Amistades','Cuentos de amistad y trabajo en equipo','Amistad, trabajo en equipo, diversidad','primario',5,8,33,9.99,19.99,24.99),
  (4,'La Montaña de los Sueños','Cuentos de perseverancia y creatividad','Perseverancia, creatividad, imaginación','primario',5,8,33,9.99,19.99,24.99),
  (5,'El Jardín de las Palabras','Cuentos de comunicación y empatía','Comunicación, expresión, empatía, resolución de conflictos','primario',6,8,33,9.99,19.99,24.99),
  (6,'El Cielo de Quelina','Cuentos de gratitud, amor y nuevos comienzos','Gratitud, familia, amor propio, despedida y nuevos comienzos','primario',6,8,33,9.99,19.99,24.99),
  (7,'Quelina y el Mundo Grande','Cuentos para crecer con sabiduría','Identidad, responsabilidad, cambio social, mundo moderno','avanzado',9,12,30,11.99,21.99,27.99)
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo, subtitulo = EXCLUDED.subtitulo,
  tematica_principal = EXCLUDED.tematica_principal,
  grupo_edad = EXCLUDED.grupo_edad, edad_min = EXCLUDED.edad_min,
  edad_max = EXCLUDED.edad_max, total_cuentos = EXCLUDED.total_cuentos,
  actualizado_en = now();

CREATE TABLE IF NOT EXISTS paquetes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  tomos_incluidos INTEGER[] NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  precio_original DECIMAL(10,2),
  descuento_porcentaje INTEGER,
  tipo VARCHAR(20) DEFAULT 'pdf',
  activo BOOLEAN DEFAULT true,
  creado_en TIMESTAMPTZ DEFAULT now()
);

INSERT INTO paquetes (nombre, descripcion, tomos_incluidos, precio, precio_original, descuento_porcentaje, tipo)
VALUES
  ('Pack 6 Tomos — PDF','Los 6 tomos principales en PDF',ARRAY[1,2,3,4,5,6],49.99,59.94,17,'pdf'),
  ('Pack Completo 7 Tomos — PDF','Colección completa en PDF',ARRAY[1,2,3,4,5,6,7],59.99,71.93,17,'pdf'),
  ('Pack 6 Tomos — PDF + Audio','Los 6 tomos con narración',ARRAY[1,2,3,4,5,6],89.99,119.94,25,'pdf_audio'),
  ('Pack Completo 7 Tomos — PDF + Audio','Colección completa con audio',ARRAY[1,2,3,4,5,6,7],109.99,151.93,28,'pdf_audio')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS generacion_progreso (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tomo INTEGER NOT NULL,
  numero_en_tomo INTEGER NOT NULL,
  estado VARCHAR(20) DEFAULT 'pendiente',
  intentos INTEGER DEFAULT 0,
  error_mensaje TEXT,
  iniciado_en TIMESTAMPTZ,
  completado_en TIMESTAMPTZ,
  UNIQUE(tomo, numero_en_tomo)
);

INSERT INTO generacion_progreso (tomo, numero_en_tomo)
SELECT t.tomo, s.num
FROM (VALUES (1),(2),(3),(4),(5),(6)) AS t(tomo)
CROSS JOIN generate_series(1, 33) AS s(num)
UNION ALL SELECT 7, generate_series(1, 30)
ON CONFLICT (tomo, numero_en_tomo) DO NOTHING;

ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tomos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "stories_public_read" ON stories;
CREATE POLICY "stories_public_read" ON stories FOR SELECT USING (estado = 'publicado');

DROP POLICY IF EXISTS "stories_admin_all" ON stories;
CREATE POLICY "stories_admin_all" ON stories FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "tomos_public_read" ON tomos;
CREATE POLICY "tomos_public_read" ON tomos FOR SELECT TO PUBLIC USING (true);

CREATE OR REPLACE FUNCTION update_tomo_cuento_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE tomos SET cuentos_generados = (
    SELECT COUNT(*) FROM stories WHERE tomo = NEW.tomo AND estado = 'publicado'
  ) WHERE id = NEW.tomo;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS stories_count_trigger ON stories;
CREATE TRIGGER stories_count_trigger
  AFTER INSERT OR UPDATE ON stories
  FOR EACH ROW EXECUTE FUNCTION update_tomo_cuento_count();

CREATE OR REPLACE VIEW v_progreso_tomos AS
SELECT
  tomos.id,
  tomos.titulo,
  tomos.grupo_edad,
  tomos.edad_min,
  tomos.edad_max,
  tomos.total_cuentos,
  tomos.cuentos_generados,
  ROUND((tomos.cuentos_generados::DECIMAL / tomos.total_cuentos * 100), 1) AS porcentaje_completado,
  COUNT(stories.id) FILTER (WHERE stories.revisado_gramaticalmente = true) AS cuentos_revisados,
  tomos.estado
FROM tomos
LEFT JOIN stories ON stories.tomo = tomos.id
GROUP BY tomos.id, tomos.titulo, tomos.grupo_edad, tomos.edad_min, tomos.edad_max,
         tomos.total_cuentos, tomos.cuentos_generados, tomos.estado
ORDER BY tomos.id;
