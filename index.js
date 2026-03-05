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
      const text = message.text?.body;

      let reply = "";

      if (text === "hi" || text === "Hi") {

        reply = `✈ Safar Libya

مرحبا بك في خدمات السفر

1️⃣ حجز طيران
2️⃣ حجز فنادق
3️⃣ تأشيرات
4️⃣ خدمة VIP في المطار
5️⃣ التواصل مع موظف

اكتب رقم الخدمة`;

      }

      else if (text === "1") {
        reply = "✈ حجز الطيران\nمن أي مدينة تريد السفر؟";
      }

      else if (text === "2") {
        reply = "🏨 حجز الفنادق\nاكتب اسم المدينة وتاريخ الوصول.";
      }

      else if (text === "3") {
        reply = "📄 التأشيرات\nاكتب الدولة التي تريد استخراج التأشيرة لها.";
      }

      else if (text === "4") {
        reply = "⭐ خدمة VIP في المطار\nاكتب المطار وتاريخ الرحلة.";
      }

      else if (text === "5") {
        reply = "👨‍💼 سيتم تحويلك إلى موظف خدمة العملاء.";
      }

      else {
        reply = "اكتب hi لعرض قائمة خدمات Safar Libya ✈";
      }

      await fetch(`https://graph.facebook.com/v18.0/994643217068788/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer EAAMzNHWBHXMBQzF5Thal7mmHL1KafMfEhIabNZAZAlnkc1Q0w5nD8o1YReFb4QG9I74ZBe1YXjCDwhQ1hEO1w7U8QNGIJ1PYFfNX1VSEpZCb4S7wCVV6om9NnCw3WjHSfhjjY2dHg9ZAEuR3iYWEVRU7KE1UZCaOoWRKAY9rnxjW3avtU41thHuVwXlAluMnoEYTSZAjWeLLH5nzcsl48DG1ZC9cvYfMxIn0RBB02ALsZAhcqed1NWIbMQZAJWJMH27oMAQNOCKEJXg6NmWjp03iOhLzWPkrmxRuZBiqAvjAwZDZD"
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: from,
          text: { body: reply }
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
