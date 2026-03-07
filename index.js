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

     await fetch(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`, {
method: "POST",
headers: {
"Content-Type": "application/json",
"Authorization": Bearer ${ACCESS_TOKEN}
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
title: "🛫 VIP المطار",
description: "خدمة كبار الشخصيات"
},

{
id: "agent",
title: "👨‍💼 التواصل مع موظف",
description: "خدمة العملاء"
}
]
}
]
}
})
});

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
     else if (text.match(/\d{1,2}-\d{1,2}-\d{4}/)) {

reply = `✈️ طلب الحجز تم استلامه

المسار: بنغازي → اسطنبول
التاريخ: ${text}

سيتم إرسال أفضل الرحلات قريباً.`;

}   
else if (text.includes("-")) {

let cities = text.split("-");

let fromCity = cities[0].trim();
let toCity = cities[1].trim();
})
});
reply = `✈️ طلب حجز طيران
من: ${fromCity}
إلى: ${toCity}

يرجى كتابة تاريخ السفر.`;

}
  
      else {
        reply = "اكتب hi لعرض قائمة خدمات Safar Libya ✈";
      }

      await fetch(`https://graph.facebook.com/v18.0/994643217068788/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer EAAMzNHWBHXMBQ1KuiSjFd9AZAZC8gslyDZA7pPaovTTJartIOpoI5M30RBFYEOxtqaO5mWwB3hBbYLuch3M7zPMIUJS15w7ZAFyt9c9iYuGgBoLMncMrMDpywr3jD6bzoEGu2grcQZBXfhMqElB9SI6uE3tuSOZCaDBVlx7mcVV0t4bR1m65nsJRlNBgaQiCZCNXmqO8aYoLIZAiJ4J5zNTumB7j88rRbbreK7BaOjL4ZAOh9HCTWRxLUH7aK8Pi4KCWadZBRlfRIR7wec7dE1ZBJpt82vltmspeZAN2FdZAAFxoZD"
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
