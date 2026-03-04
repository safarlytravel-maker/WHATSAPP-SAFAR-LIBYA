const express = require("express");
const app = express();

app.use(express.json());

const VERIFY_TOKEN = "safar123";

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified");
    return res.status(200).send(challenge);
  } else {
    return res.sendStatus(403);
  }
});

app.post("/webhook", async (req, res) => {

  const body = req.body;

  if (body.entry) {

    const message = body.entry[0].changes[0].value.messages?.[0];

    if (message) {

      const from = message.from;

      await fetch("https://graph.facebook.com/v18.0/994643217068788/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "BearerEAAMzNHWBHXMBQZCI1TUxbLnFWS3IdXvIBPfBj5Ekorkx5laVD9DAblUETtNx7Shf2W9ZBY8f3bW1ElDV3d4zqZBbiOk40ZBG2yEIyAzpjkhZAC67r3FVxdE8wBRSB5j6tQ7YkYDtekQsoctwFwpvmpKoRqZAYsw8O8BZBt4HZA46nnS2wzGlVmLZArOk4VwSnHZCtSWNSxbmZBQ7RRZCPJUdNLgVZAjB0WJ7sHfRLobkNLNhfeHL3NyXC0hJVkqsMYj9dfb5RuVgTr0kgQFbVVFscMlLqdgeyXuN1Wk9Qn6EhNAZDZD"
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: from,
          text: {
            body: "مرحبا بك في Safar Libya ✈️\n\n1️⃣ حجز تذاكر\n2️⃣ فنادق\n3️⃣ عروض سياحية"
          }
        })
      });

    }
  }

  res.sendStatus(200);
});
