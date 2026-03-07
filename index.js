const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());

const VERIFY_TOKEN = "safar123";
const ACCESS_TOKEN = "EAAMzNHWBHXMBQyD2cRKEvFBvooTlJaRrfh92IekzHzfmmUzFgEds7Cko29zIQwuQ42NHVQmvF37S26JLHiWN57d5IN5FVBPn2dUzfXX7EzZApf9EVuubjRm0p4cT9z2ihss4EQW1X0yFduEOrjFtNeWEPOO0xW9EonqXYeXVDYJ2WCR4KM1bMQST2jp04PmmaZBntmWtt0PLWEebGpWuqytX779gZAjv2TlpllaaddjJLxmx1kb5vZC4PlQzPQw0W96ukqafvkYqnm47XJHzC6yEJQi2y2fcVdDudQZDZD";
const PHONE_NUMBER_ID = "994643217068788";

let userState = {};

app.get("/", (req, res) => {
res.send("Safar Libya Bot Running");
});

app.get("/webhook", (req, res) => {
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
  const listReply = message.interactive?.list_reply?.id;

  if (!userState[from]) userState[from] = {};

  // القائمة الرئيسية
  if (text === "hi") {

    userState[from] = {};

    await fetch(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: from,
        type: "interactive",
        interactive: {
          type: "list",
          body: { text: "✈️ Safar Libya\nاختر الخدمة" },
          action: {
            button: "عرض الخدمات",
            sections: [
              {
                title: "خدمات السفر",
                rows: [
                  { id: "flight", title: "✈️ حجز طيران" },
                  { id: "hotel", title: "🏨 حجز فنادق" },
                  { id: "visa", title: "📄 تأشيرات" },
                  { id: "vip", title: "⭐ VIP المطار" }
                ]
              }
            ]
          }
        }
      })
    });

    return;
  }

  // اختيار حجز طيران
  if (listReply === "flight") {

    userState[from].step = "from";

    await fetch(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: from,
        type: "interactive",
        interactive: {
          type: "list",
          body: { text: "✈️ اختر مدينة المغادرة" },
          action: {
            button: "اختيار المدينة",
            sections: [{
              title: "المدن",
              rows: [
                { id: "from_benghazi", title: "بنغازي" },
                { id: "from_tripoli", title: "طرابلس" },
                { id: "from_sirte", title: "سرت" },
                { id: "from_cairo", title: "القاهرة" },
                { id: "from_alex", title: "اسكندرية" },
                { id: "from_tunis", title: "تونس" },
                { id: "from_jeddah", title: "جدة" }
              ]
            }]
          }
        }
      })
    });

    return;
  }

  // اختيار مدينة المغادرة
  if (listReply && listReply.startsWith("from_")) {

    userState[from].from = listReply.replace("from_", "");
    userState[from].step = "to";

    await fetch(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: from,
        type: "interactive",
        interactive: {
          type: "list",
          body: { text: "🛬 اختر مدينة الوصول" },
          action: {
            button: "اختيار المدينة",
            sections: [{
              title: "المدن",
              rows: [
                { id: "to_benghazi", title: "بنغازي" },
                { id: "to_tripoli", title: "طرابلس" },
                { id: "to_sirte", title: "سرت" },
                { id: "to_cairo", title: "القاهرة" },
                { id: "to_alex", title: "اسكندرية" },
                { id: "to_tunis", title: "تونس" },
                { id: "to_jeddah", title: "جدة" }
              ]
            }]
          }
        }
      })
    });

    return;
  }

  // اختيار مدينة الوصول
  if (listReply && listReply.startsWith("to_")) {

    userState[from].to = listReply.replace("to_", "");
    userState[from].step = "date";

    await fetch(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: from,
        text: {
          body: "✈️ اكتب تاريخ السفر مثال:\n25-03-2026"
        }
      })
    });

    return;
  }

  // إدخال التاريخ
  if (userState[from].step === "date" && text) {

    await fetch(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: from,
        text: {
          body: `✅ تم استلام طلبك

✈️ الرحلة
من: ${userState[from].from}
إلى: ${userState[from].to}

📅 التاريخ: ${text}

سيتم إرسال أفضل الرحلات قريباً.`
}
})
});

    userState[from] = {};

    return;
  }

}

}

res.sendStatus(200);

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
console.log("Server running on port " + PORT);
})
