const express = require("express");
const fetch = require("node-fetch");
const Amadeus = require("amadeus");

const amadeus = new Amadeus({
  clientId: "4GznDEeUB3sgpFlI6ZZddXulaJX2GAKO",
  clientSecret: "AAeL7corEdJ9dWhl"
});
const app = express();
app.use(express.json());

const VERIFY_TOKEN = "safar123";
const ACCESS_TOKEN = "EAAMzNHWBHXMBQ5z3dqZAutEtZAf2ZBJxBBe2YjKgbT4KSV1EzSV4HZBWfiy81ZBuXZC9gVB3o4CJfce1WsN4jKZAOZBZBbM6zHSVegGtVZAr2ZAqUNXMjfCO9S7gfV2rnknhRUFcQtlrqMLcNFgMUg3lZAKTISTNqbLRwn2irYj2jwKWJFlPUD8H1R9lrIc4ugPxGdCnX71TeoUu5ZC661Xaocr4fcrQGnQjh5NEVCKpib1azpVqNcFG5VkGG5ygtZAtBxSL6GEQEfcZBipmwd4SKDPxBnlNtItfRHClF11LBXVAgZDZD";
const PHONE_NUMBER_ID = "994643217068788";
const airportCodes = {
  benghazi: "BEN",
  tripoli: "MJI",
  sirte: "SRX",
  cairo: "CAI",
  alex: "HBE",
  tunis: "TUN",
  jeddah: "JED"
};
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

const value = body.entry[0].changes[0].value;

if (!value.messages) {
  return res.sendStatus(200);
}

const message = value.messages[0];
const messageId = message.id;

if (!global.processed) {
  global.processed = new Set();
}

if (global.processed.has(messageId)) {
  return res.sendStatus(200);
}

global.processed.add(messageId);
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
 if (userState[from].step === "from" && listReply && listReply.startsWith("from_")) {

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
  if (userState[from].step === "to" && listReply && listReply.startsWith("to_")) {

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
    let formattedDate = text;

if (text.includes("-")) {

const parts = text.split("-");

if (parts[0].length === 2) {
formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
}

}
const origin = airportCodes[userState[from].from];
const destination = airportCodes[userState[from].to];

const response = await amadeus.shopping.flightOffersSearch.get({
  originLocationCode: origin,
  destinationLocationCode: destination,
  departureDate: text,
  adults: "1",
  max: "3"
});

const flight = response.data[0];

const airline = flight.validatingAirlineCodes[0];
const price = flight.price.total;
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
         body: `✈️ أفضل رحلة

من: ${userState[from].from}
إلى: ${userState[from].to}

شركة الطيران: ${airline}
السعر: ${price} EUR
التاريخ: ${text}

سنقوم بتأكيد الحجز معك قريباً`
}
})
});

    delete userState[from];

    return;
  }

}

}

res.sendStatus(200);

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
console.log("Server running on port " + PORT);
});
