import "server-only";
import nodemailer from "nodemailer";
import { env } from "./env";
import { logger } from "./logger";

export interface SmtpTransportConfig {
  host: string;
  port: number;
  secure?: boolean;
  user?: string;
  pass?: string;
  from?: string;
}

export interface MailInput { to: string; subject: string; text: string; html?: string }

/** ส่งอีเมลผ่าน Custom SMTP config หรือ Fallback เป็น ENV SMTP — ไม่มี SMTP เขียนลง log คืน delivered:false */
export async function sendMail(input: MailInput, custom?: SmtpTransportConfig): Promise<{ delivered: boolean }> {
  const e = env();
  const host = custom?.host || e.SMTP_HOST;
  const port = custom?.port || e.SMTP_PORT;
  const user = custom ? custom.user : e.SMTP_USER;
  const pass = custom ? custom.pass : e.SMTP_PASS;
  const from = custom?.from || e.SMTP_FROM;

  if (!host) {
    logger.info("mail (no SMTP, logged only)", { to: input.to, subject: input.subject, text: input.text });
    return { delivered: false };
  }

  try {
    const transport = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: user ? { user, pass } : undefined,
    });
    await transport.sendMail({ from, to: input.to, subject: input.subject, text: input.text, html: input.html });
    return { delivered: true };
  } catch (err) {
    logger.error("mail send failed", { to: input.to, err: err instanceof Error ? err.message : String(err) });
    return { delivered: false };
  }
}
