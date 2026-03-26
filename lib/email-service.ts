import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM = "Quelina <info@latortugasabia.com>";
const BASE = "https://latortugasabia.vercel.app";

function wrap(content: string) {
  return `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #050d12; color: #FEFAE0;">
      ${content}
      <p style="font-style: italic; color: #C9882A; margin-top: 30px; text-align: center;">
        "Detente un momento... y escucha lo que el viento tiene que decirle a tu corazón."
      </p>
      <hr style="border: none; border-top: 1px solid rgba(201,136,42,0.2); margin: 30px 0;" />
      <p style="color: #666; font-size: 11px; text-align: center;">
        © 2025 CUBALIVE · PASSKAL LLC · Las Vegas, Nevada<br/>
        <a href="${BASE}" style="color: #2D6A4F;">latortugasabia.com</a>
      </p>
    </div>
  `;
}

export async function sendPurchaseEmail(
  email: string,
  name: string,
  product: string,
  downloadUrl: string
) {
  const firstName = name.split(" ")[0];
  const resend = getResend();

  return resend.emails.send({
    from: FROM,
    to: email,
    subject: `🐢 ${firstName}, tu libro de Quelina está listo`,
    html: wrap(`
      <h1 style="color: #C9882A; font-size: 24px; text-align: center;">¡Bienvenido al mundo de Quelina!</h1>
      <p style="font-size: 16px;">Hola ${firstName}, 🌿</p>
      <p>Las estrellas me avisaron que vendrías... y aquí está tu libro. 🌙</p>
      <p>Tu pequeño va a descubrir 50 cuentos mágicos llenos de aventuras, emociones y la sabiduría de Quelina.</p>
      ${product === "digital" || product === "premium" ? `
        <div style="text-align: center; margin: 30px 0;">
          <a href="${downloadUrl}" style="background: #2D6A4F; color: #FEFAE0; padding: 15px 30px; border-radius: 12px; text-decoration: none; font-size: 16px; display: inline-block;">
            📖 Descargar tu PDF
          </a>
        </div>
      ` : `
        <p style="color: #C9882A;">📦 Tu libro físico está en camino. Recibirás un email con el tracking en 24-48 horas.</p>
      `}
      <p>Mientras tanto, puedes hablar con Quelina en nuestro chat mágico:</p>
      <div style="text-align: center; margin: 20px 0;">
        <a href="${BASE}/susurro" style="color: #C9882A; text-decoration: none; font-size: 14px;">✒️ El Susurro de Quelina →</a>
      </div>
    `),
  });
}

export async function sendWelcomeEmail(email: string, name: string = "Querido padre") {
  const firstName = name.split(" ")[0];
  const resend = getResend();

  return resend.emails.send({
    from: FROM,
    to: email,
    subject: `${firstName}, Quelina tiene algo para ti... 🌙`,
    html: wrap(`
      <h1 style="color: #C9882A; font-size: 24px; text-align: center;">Bienvenida al bosque, ${firstName} 🌙</h1>
      <p>Las estrellas le susurraron a Quelina que tú eres especial.</p>
      <p>Quelina es la tortuga más anciana del bosque encantado. Tiene constelaciones doradas en su caparazón y una sabiduría que hace que el viento se detenga a escucharla.</p>
      <p>Ella creó 50 cuentos terapéuticos para acompañar a tu hijo en sus primeros años — desde el miedo a la oscuridad hasta aprender a compartir.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${BASE}/#pricing" style="background: #2D6A4F; color: #FEFAE0; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-size: 14px; display: inline-block;">
          🐢 Descubrir los cuentos
        </a>
      </div>
      <p style="font-size: 14px; color: #999;">PD: Puedes hablar con Quelina ahora mismo en <a href="${BASE}/susurro" style="color: #C9882A;">El Susurro</a>.</p>
    `),
  });
}

export async function sendDay2FollowUp(email: string, name: string) {
  const firstName = name.split(" ")[0];
  const resend = getResend();

  return resend.emails.send({
    from: FROM,
    to: email,
    subject: `${firstName}, ¿ya leíste el primer cuento? 🌙`,
    html: wrap(`
      <p style="font-size: 16px;">${firstName}, ¿ya leíste el primer cuento? 🦉</p>
      <p>Buby el búho pregunta por ti...</p>
      <p>El primer cuento de La Tortuga Sabia se llama <strong>"Las estrellas que susurran"</strong>. Es perfecto para leer antes de dormir — solo toma 3 minutos.</p>
      <p style="background: rgba(201,136,42,0.1); padding: 20px; border-radius: 12px; border-left: 3px solid #C9882A;">
        <em>"Cuando tú duermes, las estrellas te guardan en sus sueños. Y cuando despiertas, tienes un poquito de su luz dentro de ti."</em><br/>
        <small style="color: #C9882A;">— Quelina, a Buby</small>
      </p>
      <p>¿Tu pequeño ya tiene su cuento favorito? Cuéntale a Quelina:</p>
      <div style="text-align: center; margin: 20px 0;">
        <a href="${BASE}/susurro" style="color: #C9882A; text-decoration: none;">✒️ Hablar con Quelina →</a>
      </div>
    `),
  });
}

export async function sendDay7CheckIn(email: string, name: string) {
  const firstName = name.split(" ")[0];
  const resend = getResend();

  return resend.emails.send({
    from: FROM,
    to: email,
    subject: `${firstName}, Quelina quiere saber algo 🌿`,
    html: wrap(`
      <p style="font-size: 16px;">${firstName}, Quelina te pregunta algo... 🌿</p>
      <p>Las estrellas me cuentan que llevas una semana leyendo con tu pequeño, ${firstName}. Eso me hace sonreír con los ojos antes que con la boca. 🐢</p>
      <p>¿Sabías que los niños que escuchan cuentos antes de dormir tienen un vocabulario 40% más rico a los 4 años?</p>
      <p>Pero lo más importante no son las palabras. Es el momento: tú, tu hijo, y un cuento que los conecta de una forma que nada más puede.</p>
      <p style="color: #C9882A; font-weight: bold;">¿Cuál es el cuento favorito de tu hijo hasta ahora?</p>
      <p style="font-size: 13px; color: #999;">Simplemente responde a este email — me encantaría saberlo.</p>
    `),
  });
}

export async function sendDay14Upsell(email: string, name: string) {
  const firstName = name.split(" ")[0];
  const resend = getResend();

  return resend.emails.send({
    from: FROM,
    to: email,
    subject: `${firstName}, reserva tu lugar para el Tomo II 🌟`,
    html: wrap(`
      <p style="font-size: 16px;">${firstName}, el Tomo II está casi listo 🌟</p>
      <p>Sé que a ti y a tu hijo les encantó el Tomo I, ${firstName}. Las constelaciones de mi caparazón brillan más fuerte cuando pienso en ustedes. 🐢</p>
      <p><strong>El Tomo II — "Los Amigos del Camino"</strong> trae 50 nuevos cuentos para niños de 3-4 años:</p>
      <ul style="color: #FEFAE0; line-height: 2;">
        <li>Compartir con el hermano nuevo</li>
        <li>El primer día en la guardería</li>
        <li>Hacer amigos</li>
        <li>Pedir perdón</li>
        <li>Sentirse diferente</li>
      </ul>
      <div style="text-align: center; margin: 30px 0; padding: 20px; background: rgba(45,106,79,0.15); border-radius: 12px;">
        <p style="color: #C9882A; font-size: 18px; margin-bottom: 10px;">🌿 Precio de pre-venta: $7.99</p>
        <p style="font-size: 12px; color: #999;">(Precio normal: $9.99)</p>
        <a href="${BASE}/#pricing" style="background: #C9882A; color: #050d12; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-size: 14px; display: inline-block; margin-top: 10px;">
          Reservar ahora →
        </a>
      </div>
    `),
  });
}
