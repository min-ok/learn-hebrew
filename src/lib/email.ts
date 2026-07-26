const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM ?? "Иврит <onboarding@resend.dev>";
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL;

async function sendEmail(options: { to: string; subject: string; html: string; replyTo?: string }) {
  if (!RESEND_API_KEY) {
    console.log(
      `[email] RESEND_API_KEY не задан — письмо не отправлено.\nКому: ${options.to}\nТема: ${options.subject}\n${options.html}`,
    );
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      ...(options.replyTo ? { reply_to: options.replyTo } : {}),
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("Resend error", res.status, text);
    throw new Error("Не удалось отправить письмо");
  }
}

function codeBlock(code: string) {
  return `
    <p style="margin: 24px 0;">
      <span style="display:inline-block;background:#f5f5f4;color:#1c1917;font-size:32px;font-weight:700;letter-spacing:8px;padding:14px 24px;border-radius:8px;font-family:monospace;">
        ${code}
      </span>
    </p>
  `;
}

export async function sendVerificationEmail(to: string, name: string, code: string) {
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>Привет, ${escapeHtml(name)}!</h2>
      <p>Подтвердите свой email, чтобы начать пользоваться карточками и стриком на сайте «Иврит». Введите этот код на сайте:</p>
      ${codeBlock(code)}
      <p style="color:#78716c;font-size:13px;">Код действителен 15 минут. Если вы не регистрировались — просто проигнорируйте это письмо.</p>
    </div>
  `;

  await sendEmail({ to, subject: "Код подтверждения email — Иврит", html });
}

export async function sendEmailChangeVerification(to: string, name: string, code: string) {
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>Привет, ${escapeHtml(name)}!</h2>
      <p>Вы запросили смену email на этот адрес в настройках профиля на сайте «Иврит». Введите этот код на сайте, чтобы завершить смену:</p>
      ${codeBlock(code)}
      <p style="color:#78716c;font-size:13px;">Код действителен 15 минут. Пока вы его не введёте, вход остаётся по старому email. Если это были не вы — просто проигнорируйте это письмо.</p>
    </div>
  `;

  await sendEmail({ to, subject: "Код подтверждения нового email — Иврит", html });
}

export async function sendPasswordResetEmail(to: string, name: string, code: string) {
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>Привет, ${escapeHtml(name)}!</h2>
      <p>Мы получили запрос на сброс пароля для вашего аккаунта на сайте «Иврит». Введите этот код на сайте:</p>
      ${codeBlock(code)}
      <p style="color:#78716c;font-size:13px;">Код действителен 15 минут. Если вы не запрашивали сброс пароля — просто проигнорируйте это письмо, пароль останется прежним.</p>
    </div>
  `;

  await sendEmail({ to, subject: "Код сброса пароля — Иврит", html });
}

export async function sendSupportEmail(fromName: string, fromEmail: string, message: string) {
  if (!SUPPORT_EMAIL) {
    console.log(
      `[email] SUPPORT_EMAIL не задан — обращение не отправлено.\nОт: ${fromName} <${fromEmail}>\n${message}`,
    );
    return;
  }

  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>Новое обращение в поддержку</h2>
      <p><strong>От:</strong> ${escapeHtml(fromName)} (${escapeHtml(fromEmail)})</p>
      <p style="white-space: pre-line; border-left: 3px solid #0f766e; padding-left: 12px; margin: 16px 0;">${escapeHtml(message)}</p>
    </div>
  `;

  await sendEmail({
    to: SUPPORT_EMAIL,
    subject: `Поддержка: сообщение от ${fromName}`,
    html,
    replyTo: fromEmail,
  });
}

function escapeHtml(text: string) {
  return text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
