export async function POST(request: Request) {
  try {
    const { name, details } = await request.json();

    if (!name?.trim() || !details?.trim()) {
      return Response.json({ error: 'Nombre y detalles son requeridos' }, { status: 400 });
    }

    const toEmail = 'josepquispe51@gmail.com';
    const apiKey  = process.env.RESEND_API_KEY;

    if (!apiKey) {
      return Response.json({ error: 'Servicio de correo no configurado' }, { status: 500 });
    }

    const html = `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a2e">
        <div style="background:#7c3aed;padding:28px 32px;border-radius:12px 12px 0 0">
          <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700">🎵 Nueva solicitud de contratación</h1>
          <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:14px">UCSP Tuna — Formulario de contacto</p>
        </div>
        <div style="background:#f9f8ff;padding:28px 32px;border:1px solid #e5e0f8;border-top:none;border-radius:0 0 12px 12px">
          <table style="width:100%;border-collapse:collapse">
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #ede8ff">
                <span style="font-size:12px;color:#7c3aed;font-weight:600;text-transform:uppercase;letter-spacing:.05em">Nombre de contacto</span><br/>
                <span style="font-size:16px;font-weight:600;color:#1a1a2e">${name}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 0 0">
                <span style="font-size:12px;color:#7c3aed;font-weight:600;text-transform:uppercase;letter-spacing:.05em">Detalles del evento</span><br/>
                <p style="margin:8px 0 0;font-size:15px;line-height:1.6;color:#374151;white-space:pre-wrap">${details}</p>
              </td>
            </tr>
          </table>
          <div style="margin-top:24px;padding-top:16px;border-top:1px solid #ede8ff;font-size:12px;color:#9ca3af">
            Este mensaje fue enviado desde el formulario de contacto de tunaucsp.vercel.app
          </div>
        </div>
      </div>
    `;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'UCSP Tuna <contacto@darrysdev.me>',
        to:   [toEmail],
        subject: `Nueva solicitud de contratación — ${name}`,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        err.message ?? err.name ?? `Resend error ${res.status}: ${res.statusText}`
      );
    }

    // Build WhatsApp deep-link message (for client-side redirect)
    const waMsgEncoded = encodeURIComponent(
      `🎵 *Nueva solicitud — UCSP Tuna*\n\n*Contacto:* ${name}\n\n*Detalles:*\n${details}`
    );
    const waUrl = `https://wa.me/51941178294?text=${waMsgEncoded}`;

    return Response.json({ ok: true, waUrl });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error desconocido';
    return Response.json({ error: msg }, { status: 500 });
  }
}
