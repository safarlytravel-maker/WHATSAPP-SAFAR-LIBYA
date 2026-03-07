const express = require("express");

const app = express();
app.use(express.json());

const VERIFY_TOKEN = "safar123";
const ACCESS_TOKEN = "EAAMzNHWBHXMBQ6vjm8lYT1gnnwKAzeaQabKZAv9q4m2HBMVSIy03D3jvIqZAAZALtivwgdARK1C70m2dAHpUaacpwd6eBEhuCXpZBPXjHMVIirdqk77qTFd3Jg8JzsJ2v2Gp66se429cem30hhsTbrWZBaZCtAjvYIYpyaxQgTONDcZB2Qkiom6OoT0GMZBc0jKEBQagDlGLtgibNv6flVf04UilHSqbkc7CX5rf03MohB2fYPvX2YfzbgbKwZBYZBPrO5V6U1uGOjaL0K82ZAGR4um6fSSXHaya0Mij7uYOgZDZD";
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

      let reply = "";

    if (text === "hi") {

await fetch(
https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages,
{
method: "POST",
headers: {
"Content-Type": "application/json",
Authorization: Bearer ${ACCESS_TOKEN}
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

      else if (text === "1") {

        reply = "✈️ حجز الطيران\nاكتب:\nبنغازي - اسطنبول";

      }

      else if (text.includes("-")) {

        let cities = text.split("-");

        let fromCity = cities[0].trim();
        let toCity = cities[1].trim();

        reply = `✈️ طلب حجز طيران

من: ${fromCity}
إلى: ${toCity}

اكتب تاريخ السفر مثال:
25-03-2026`;

      }

      else if (text.match(/\d{2}-\d{2}-\d{4}/)) {

        reply = `✈️ تم استلام الطلب

التاريخ: ${text}

سيتم إرسال أفضل الرحلات قريباً`;

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
            "Authorization": `Bearer ${ACCESS_TOKEN}`
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
