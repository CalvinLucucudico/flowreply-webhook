const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

// URL de produção do seu FlowReply
const FLOWREPLY_APP_URL = process.env.FLOWREPLY_APP_URL || "https://ais-dev-shjinlju4z5hluwasdli4l-243664163495.europe-west1.run.app";
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "flowreply_verify_token_2026";

app.use(express.json());

// ── 1. Rota GET: Verificação da Meta (Handshake Oficial) ──
app.get(["/", "/webhook", "/api/instagram/webhook"], (req, res) => {
  const mode = req.query["hub.mode"] || req.query["hub_mode"];
  const token = req.query["hub.verify_token"] || req.query["hub_verify_token"];
  const challenge = req.query["hub.challenge"] || req.query["hub_challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("[FlowReply Railway] Validação com a Meta bem-sucedida!");
    return res.status(200).send(challenge);
  }

  return res.status(403).send("Token de verificação inválido.");
});

// ── 2. Rota POST: Recepção instantânea e encaminhamento para a IA ──
app.post(["/", "/webhook", "/api/instagram/webhook"], async (req, res) => {
  // Resposta imediata para a Meta (evita cancelamento de subscrição e timeouts)
  res.status(200).send("EVENT_RECEIVED");

  const body = req.body;
  console.log("[FlowReply Railway] Evento recebido da Meta! Encaminhando para o FlowReply...");

  try {
    const response = await fetch(`${FLOWREPLY_APP_URL}/api/instagram/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Hub-Signature-256": req.headers["x-hub-signature-256"] || "",
        "User-Agent": "FlowReply-Railway-Relay/1.0"
      },
      body: JSON.stringify(body)
    });
    console.log(`[FlowReply Railway] Encaminhado! Status do FlowReply: ${response.status}`);
  } catch (error) {
    console.error("[FlowReply Railway] Erro ao repassar para o FlowReply:", error.message);
  }
});

app.listen(PORT, () => {
  console.log(`[FlowReply Railway] Servidor ativo e operante na porta ${PORT}`);
});
