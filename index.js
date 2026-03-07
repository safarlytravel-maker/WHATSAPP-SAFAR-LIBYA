const express = require("express");
const fetch = require("node-fetch");
const app = express();
app.use(express.json());

const VERIFY_TOKEN = "safar123";
const ACCESS_TOKEN = "EAAMzNHWBHXMBQ2RaaJzCDFvxGzixLKKH6DJE2fQ7aZC11UTmxOeMwo9G7jhNDWtpPaMMzmoryM6dnlxdVwGfFKZCRZA2qsF4xuanZBuryC3n0ZCmyts2ZAXEJOlYm8tUI0dRSyZCMmkTV7UGfUiRKYJiyIZADY0fBMR5U3jPtcDfhWACSqZAiRCI74pCxNFXN1q6OF5UlJwHczgfGfZAQ4S47IZBng0yJTLoTOZBMpienKRnfabnDGGZCB0oe5Foe9X8NxXvloQannxgraUnbEbBA7ZCYHvZCTOdW5FLc4XPGvZChgZDZD";
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

      let reply = "";

      // القائمة الرئيسية
      if (text === "hi") {

        await fetch(
          `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
          {

            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${ACCESS_TOKEN}`
            },
                                return;

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
                        {
                          id: "flight",
                          title: "✈️ حجز طيران",
                          description: "البحث عن أفضل الرحلات"
                        },
                        {
                          id: "hotel",
                          title: "🏨 حجز فنادق",
                          description: "أفضل أسعار الفنادق"
                        },
                        {
                          id: "visa",
                          title: "📄 تأشيرات",
                          description: "استخراج الفيزا"
                        },
                        {
                          id: "vip",
                          title: "⭐ VIP المطار",
                          description: "خدمة كبار الشخصيات"
                        }
                      ]
                    }
                  ]
                }
              }
            })
          }
        );

        return;
      }

      // عند اختيار حجز طيران
      if (listReply === "flight") {

        await fetch(
          `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
          {
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
                                    return;

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
          }
        );

        return;
      }

      // بعد اختيار مدينة المغادرة
      if (listReply && listReply.startsWith("from_")) {

        await fetch(
          `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
          {
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
                                    return;

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
          }
        );

        return;
      }

      else {

        reply = "اكتب hi لعرض الخدمات";

      }

      await fetch(
        `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ACCESS_TOKEN}`
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: from,
            text: { body: reply }
          })
        }
      );

    }

  }

  res.sendStatus(200);

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
