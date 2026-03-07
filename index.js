const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());

const VERIFY_TOKEN = "safar123";
const ACCESS_TOKEN = "EAAMzNHWBHXMBQZBdb8ZBwbi0bzSIvRy8Jd4ZCP7WTtVqOjOUHc7qDQKOBZBfCuLXW3mFEyMaqmjDbEBbFBBIx7jCsS4xGBYPZBupHylBrJtlEW6DFA947MdVLOAHE3cuzFlPLZC6LAoVyfczLYN0DT5ygw3Iv8d0wfPCzh6Rz2q016eRsg0kPWOq2yUQRNGqZBdRQ3friuZBvUXVA4tBF4CERrGmD474jXuovOxAzt8Fdle6SnfZCGC9pq4ciL9KMya6otByyjGmvydUjcppLEjuK6tM5FZC47F5ApRGM3o917";
const PHONE_NUMBER_ID = "994643217068788";

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

  // القائمة الرئيسية
  if (text === "hi") {

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
          body: {
            text: "✈️ Safar Libya\nاختر الخدمة"
          },
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

  // عند اختيار حجز طيران
  if (listReply === "flight") {

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
          body: {
            text: "✈️ اختر مدينة المغادرة"
          },
          action: {
            button: "اختيار المدينة",
            sections: [
              {
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
              }
            ]
          }
        }
      })
    });

    return;
  }

  // اختيار مدينة المغادرة
  if (listReply && listReply.startsWith("from_")) {

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
          body: {
            text: "🛬 اختر مدينة الوصول"
          },
          action: {
            button: "اختيار المدينة",
            sections: [
              {
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
              }
            ]
          }
        }
      })
    });

    return;
  }

  // اختيار مدينة الوصول
  if (listReply && listReply.startsWith("to_")) {

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

  // معالجة تاريخ السفر
  if (text && text.match(/\d{2}-\d{2}-\d{4}/)) {

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

📅 التاريخ: ${text}

سيقوم فريق Safar Libya بإرسال أفضل الرحلات قريباً ✈️`
}
})
});

    return;
  }

  // أي رسالة أخرى
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
        body: "اكتب hi لعرض الخدمات"
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
