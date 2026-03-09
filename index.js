const express = require("express");
const fetch = require("node-fetch");
const Amadeus = require("amadeus");

const app = express();
app.use(express.json());

const amadeus = new Amadeus({
  clientId: "4GznDEeUB3sgpFlI6ZZddXulaJX2GAKO",
  clientSecret: "AAeL7corEdJ9dWhl"
});

const VERIFY_TOKEN = "safar123";
const ACCESS_TOKEN = "EAAMzNHWBHXMBQ9gjokiIdC0loqSRGZBSLhbvWpBRRF0BwEYl9EpyKotZAzrCnAzKv2ZBRIefWGVa5jThqDsIDXa1ZCFaTkdDUa3uQFJp0rnUy8LprX8mC3yKAaSA8zBKdtICDjDE77AXCCf70RZBYDAh8haZBN3BqYCegNKKaljxGSl7f8FsXLkB59BdyjvfpWYI6YzcdcpRd9EUToBLfvZB4oOxCy68nDTJygtRZCaNqULJ4mgwjutfmvgq5YrP4p5XkvI8URnnbhlN8X3F0xWkc3Siwpx9cgd3cOwPiAZDZD";
const PHONE_NUMBER_ID = "994643217068788";

const airportCodes = {
  benghazi: "BEN",
  tripoli: "MJI",
  cairo: "CAI",
  tunis: "TUN",
  jeddah: "JED"
};

const cityNames = {
  benghazi: "بنغازي",
  tripoli: "طرابلس",
  cairo: "القاهرة",
  tunis: "تونس",
  jeddah: "جدة"
};

let userState = {};

app.get("/", (req,res)=>{
res.send("Safar Libya Bot Running");
});

app.get("/webhook",(req,res)=>{

const mode = req.query["hub.mode"];
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if(mode==="subscribe" && token===VERIFY_TOKEN){
res.status(200).send(challenge);
}else{
res.sendStatus(403);
}

});

app.post("/webhook",async(req,res)=>{

const body = req.body;

if(!body.entry) return res.sendStatus(200);

const message = body.entry[0].changes[0].value.messages?.[0];

if(!message) return res.sendStatus(200);

const from = message.from;
const text = message.text?.body;
const listReply = message.interactive?.list_reply?.id;
const buttonReply = message.interactive?.button_reply?.id;

if(!userState[from]) userState[from] = {};

let state = userState[from];


// HI

if(text && text.toLowerCase()==="hi"){

await sendMessage(from,"✈️ مرحبا بك في Safar Libya\nاكتب hi للبدء");

return;

}


// اختيار المدن

if(text && text.includes("-")){

let parts = text.split("-");

let fromCity = parts[0].trim().toLowerCase();
let toCity = parts[1].trim().toLowerCase();

state.from = fromCity;
state.to = toCity;
state.step = "date";

await sendMessage(from,"اكتب تاريخ السفر مثال\n2026-05-10");

return;

}


// إدخال التاريخ

if(state.step==="date" && text){

let origin = airportCodes[state.from];
let destination = airportCodes[state.to];

const response = await amadeus.shopping.flightOffersSearch.get({
originLocationCode:origin,
destinationLocationCode:destination,
departureDate:text,
adults:"1",
max:"3"
});

if(!response.data || response.data.length===0){

await sendMessage(from,"لا توجد رحلات");

return;

}

state.flights = response.data.slice(0,3);
state.step = "chooseFlight";

await sendFlightList(from,state.flights);

return;

}


// اختيار الرحلة

if(state.step==="chooseFlight" && listReply){

let index = parseInt(listReply.replace("flight",""))-1;

state.flight = state.flights[index];
state.step = "name";

await sendMessage(from,"اكتب الاسم كما في الجواز");

return;

}


// الاسم

if(state.step==="name"){

state.name = text;
state.step="passport";

await sendMessage(from,"اكتب رقم الجواز");

return;

}


// الجواز

if(state.step==="passport"){

state.passport=text;
state.step="expiry";

await sendMessage(from,"اكتب تاريخ انتهاء الجواز\n2028-10-01");

return;

}


// انتهاء الجواز

if(state.step==="expiry"){

state.expiry=text;
state.step="payment";

await sendPaymentOptions(from);

return;

}


// اختيار الدفع

if(state.step==="payment" && buttonReply){

await sendMessage(from,"جاري إصدار التذكرة...");

setTimeout(()=>{
sendTicket(from,state);
},60000);

state.step="done";

return;

}

res.sendStatus(200);

});


// إرسال نص

async function sendMessage(user,text){

await fetch(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,{

method:"POST",

headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${ACCESS_TOKEN}`
},

body:JSON.stringify({
messaging_product:"whatsapp",
to:user,
text:{body:text}
})

});

}


// قائمة الرحلات

async function sendFlightList(user, flights) {

await fetch(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`, {

method: "POST",

headers: {
"Content-Type": "application/json",
Authorization: `Bearer ${ACCESS_TOKEN}`
},

body: JSON.stringify({

messaging_product: "whatsapp",

to: user,

type: "interactive",

interactive: {

type: "list",

body: {
text: "✈️ أفضل الرحلات"
},

action: {

button: "اختيار الرحلة",

sections: [
{
title: "Flights",

rows: [
{
id: "flight1",
title: "الرحلة 1",
description: ${flights[0].price.total} EUR
},
{
id: "flight2",
title: "الرحلة 2",
description: ${flights[1].price.total} EUR
},
{
id: "flight3",
title: "الرحلة 3",
description: ${flights[2].price.total} EUR
}
]

}

]

}

}

})

});

}


// طرق الدفع

async function sendPaymentOptions(user){

await fetch(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,{

method:"POST",

headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${ACCESS_TOKEN}`
},

body:JSON.stringify({

messaging_product:"whatsapp",

to:user,

type:"interactive",

interactive:{

type:"button",

header:{
type:"image",
image:{link:"https://yourserver.com/payments.jpg"}
},

body:{text:"اختر طريقة الدفع"},

action:{

buttons:[

{type:"reply",reply:{id:"pay1",title:"Edfa3ly"}},

{type:"reply",reply:{id:"pay2",title:"MobiCash"}},

{type:"reply",reply:{id:"pay3",title:"Musrufi"}}

]

}

}

})

});

}


// إرسال التذكرة

async function sendTicket(user,state){

await fetch(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,{

method:"POST",

headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${ACCESS_TOKEN}`
},

body:JSON.stringify({

messaging_product:"whatsapp",

to:user,

type:"document",

document:{
link:"https://yourserver.com/ticket.pdf",
filename:"SafarLibyaTicket.pdf"
}

})

});

}


const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{

console.log("Server running");

});
