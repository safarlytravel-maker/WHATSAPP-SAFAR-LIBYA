const express = require("express");

const app = express();
app.use(express.json());

const ACCESS_TOKEN = process.env.ACCESS_TOKEN || "PUT_YOUR_TOKEN_HERE";
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID || "994643217068788";
const VERIFY_TOKEN = "safar123";

app.get("/", (req, res) => {
  res.send("Safar Libya WhatsApp Bot Running");
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
      const text = message.text?.body || "";

      let reply = "";

      if (text === "hi" || text === "Hi") {
        await fetch(
          https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: Bearer ${ACCESS_TOKEN},
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              to: from,
              type: "interactive",
              interactive: {
                type: "list",
                body: {
                  text: "✈️ Safar Libya\nاختر الخدمة",
                },
                action: {
                  button: "عرض الخدمات",
                  sections: [
                    {
                      title: "خدمات السفر",
                      rows: [
                        {
                          id: "flight",
                          title: "✈️ حجز طيران",
                          description: "البحث عن أفضل الرحلات",
                        },
                        {
                          id: "hotel",
                          title: "🏨 حجز فنادق",
                          description: "أفضل أسعار الفنادق",
                        },
                        {
                          id: "visa",
                          title: "📄 تأشيرات",
                          description: "استخراج الفيزا",
                        },
                        {
                          id: "vip",
                          title: "🛫 VIP المطار",
                          description: "خدمة كبار الشخصيات",
                        },
                        {
                          id: "agent",
                          title: "👨‍💼 التواصل مع موظف",
                          description: "خدمة العملاء",
                        },
                      ],
                    },
                  ],
                },
              },
            }),
          }
        );
      } else if (text === "1") {
        reply = "✈ حجز الطيران\nمن أي مدينة تريد السفر؟";
      } else if (text === "2") {
        reply = "🏨 حجز الفنادق\nاكتب اسم المدينة وتاريخ الوصول.";
      } else if (text === "3") {
        reply = "📄 التأشيرات\nاكتب الدولة التي تريد استخراج التأشيرة لها.";
      } else if (text === "4") {
        reply = "⭐ خدمة VIP في المطار\nاكتب المطار وتاريخ الرحلة.";
      } else if (text === "5") {
        reply = "👨‍💼 سيتم تحويلك إلى موظف خدمة العملاء.";
      } else if (text.match(/\d{1,2}-\d{1,2}-\d{4}/)) {
        reply = `✈️ طلب الحجز تم استلامه

المسار: بنغازي → اسطنبول
التاريخ: ${text}

سيتم إرسال أفضل الرحلات قريباً.`;
      } else if (text.includes("-")) {
        let cities = text.split("-");
        let fromCity = cities[0].trim();
        let toCity = cities[1].trim();

        reply = `✈️ طلب حجز طيران
من: ${fromCity}
إلى: ${toCity}

يرجى كتابة تاريخ السفر (مثال: 25-03-2026).`;
      } else {
        reply = "اكتب hi لعرض قائمة خدمات Safar Libya ✈";
      }

      if (reply) {
        await fetch(
          https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: Bearer ${ACCESS_TOKEN},
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              to: from,
              text: { body: reply },
            }),
          }
        );
      }
    }
  }

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
