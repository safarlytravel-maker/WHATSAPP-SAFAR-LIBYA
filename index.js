const express = require("express");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Safar Libya WhatsApp Bot Running");
});

app.get("/webhook", (req, res) => {

  const VERIFY_TOKEN = "safar123";

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }

});

app.post("/webhook", async (req, res) => {

  const body = req.body;

  if (body.entry) {

    const message = body.entry[0].changes[0].value.messages?.[0];

    if (message) {

      const from = message.from;

      const ACCESS_TOKEN = "EAAMzNHWBHXMBQwzvPCV7D1PxnCElxZBDIZBTnKsgU6XfNmFmauZAwpG9oH65fnyGlGROVV57tH1ZBJ2ZCsqm0CSYF4z34DXBFHggC8pZCO8NRR1HZAf3TNE7URrWvsmDvdxMTDniSIaC89VVtyjdqH8jGK0xiHWo1BShdmZBEcNqbqpAtvYyXf6eNpvipp3uu1B7ambeRiOeeIIJ4bT6tKaVnLJZBaegIIZCrDsHZCD1eV3dIwUkvJts4ZBbVEq5V0xzaO6hcxNDwVDhqZAQ75Xw2pmAKSd6TcCxFu1j2a2rHQ6wZD";
      const PHONE_NUMBER_ID = "994643217068788";

      await fetch(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": Bearer ${ACCESS_TOKEN}
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: from,
          text: {
            body: "مرحبا بك في Safar Libya ✈️"
          }
        })
      });

    }

  }

  res.sendStatus(200);

});
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
