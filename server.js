const express = require("express");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

// Captura do corpo em JSON e guarda o rawBody para validar a assinatura da Meta
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString("utf8");
    },
  })
);

// Token configurado na Meta
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "flowreply_verify_token_2026";
const APP_SECRET = process.env.META_APP_SECRET || "";

// ── 1. Rota GET: Validação com a Meta (Handshake) ──
app.get(["/", "/webhook", "/api/instagram/webhook"], (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("[FlowReply Webhook] Validação aceita com sucesso pela Meta!");
    return res.status(200).send(challenge);
  }

  console.warn("[FlowReply Webhook] Falha de validação. Token inválido.");
  return res.status(403).send("Verification failed");
});

// ── 2. Rota POST: Recepção de Comentários, DMs e Menções ──
app.post(["/", "/webhook", "/api/instagram/webhook"], (req, res) => {
  // A Meta EXIGE resposta 200 IMEDIATA para não bloquear o webhook
  res.status(200).send("EVENT_RECEIVED");

  // Processamento em segundo plano
  const body = req.body;
  console.log("[FlowReply Webhook] Evento recebido da Meta:", JSON.stringify(body, null, 2));

  // Aqui você pode repassar para o Firebase Firestore ou direto para a IA
});

app.listen(PORT, () => {
  console.log(`[FlowReply] Webhook ativo e escutando na porta ${PORT}`);
});