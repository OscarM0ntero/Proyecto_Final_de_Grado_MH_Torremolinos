// Plantilla común de los emails: cabecera, cuerpo y pie de M&H Torremolinos.
// Todos los correos deben usarla para que compartan el mismo aspecto.
export function plantillaEmail(contenido: string): string {
    return `
    <body style="margin:0;padding:0;background:#f4f4f0;font-family:Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f0;padding:32px 0;">
        <tr><td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;max-width:600px;width:100%;">
            <tr><td style="background:#3F4B3A;padding:28px 40px;text-align:center;">
              <h1 style="margin:0;font-family:Georgia,serif;color:#ffffff;font-size:22px;letter-spacing:1px;">M&amp;H Torremolinos</h1>
              <p style="margin:6px 0 0;color:#b8c4b3;font-size:13px;">Calle Loma de los Riscos 117 · Torremolinos, Málaga</p>
            </td></tr>
            <tr><td style="padding:36px 40px;">${contenido}</td></tr>
            <tr><td style="background:#f5f8f3;padding:20px 40px;text-align:center;border-top:1px solid #e0e0d8;">
              <p style="margin:0;font-size:13px;color:#888;">M&amp;H Torremolinos · <a href="mailto:info@mhtorremolinos.com" style="color:#3F4B3A;text-decoration:none;">info@mhtorremolinos.com</a></p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>`;
}

// Tabla de dos columnas (etiqueta / valor) con filas alternas, para los detalles de la reserva
export function filaEmail(etiqueta: string, valor: string, alterna = false): string {
    return `<tr${alterna ? ' style="background:#f5f8f3;"' : ''}>
        <td style="padding:10px 14px;color:#555;width:45%;">${etiqueta}</td>
        <td style="padding:10px 14px;font-weight:700;text-align:right;">${valor}</td>
    </tr>`;
}
