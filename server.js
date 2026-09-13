const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

// URL do nosso servidor FlowReply principal
const FLOWREPLY_APP_URL = process.env.FLOWREPLY_APP_URL || "https://ais-dev-shjinlju4z5hluwasdli4l-243664163495.europe-west1.run.app";
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "flowreply_verify_token_2026";

app.use(express.json());

// ── 1. Rota GET: Verificação da Meta (Handshake) ──
app.get(["/", "/webhook", "/api/instagram/webhook"], (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("[FlowReply Railway] Validação com a Meta realizada com sucesso!");
    return res.status(200).send(challenge);
  }

  return res.status(403).send("Token inválido");
});

// ── 2. Rota POST: Recepção de Eventos e Envio para a IA ──
app.post(["/", "/webhook", "/api/instagram/webhook"], async (req, res) => {
  // A Meta EXIGE resposta imediata para não cancelar a subscrição
  res.status(200).send("EVENT_RECEIVED");

  const body = req.body;
  console.log("[FlowReply Railway] Evento recebido da Meta!");

  // Encaminha de forma assíncrona para o motor de IA e Firestore do FlowReply
  try {
    await fetch(`${FLOWREPLY_APP_URL}/api/instagram/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Hub-Signature-256": req.headers["x-hub-signature-256"] || "",
        "User-Agent": "FlowReply-Railway-Relay/1.0"
      },
      body: JSON.stringify(body)
    });
    console.log("[FlowReply Railway] Encaminhado com sucesso para o FlowReply!");
  } catch (error) {
    console.error("[FlowReply Railway] Erro ao repassar para o FlowReply:", error.message);
  }
});

app.listen(PORT, () => {
  console.log(`[FlowReply Railway] Webhook online na porta ${PORT}`);
});
