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
const ACCESS_TOKEN = "EAAMzNHWBHXMBQ0hqMZCBvVZA5w0M6DMYjoIZAKLHhm1MSRhncXBoEZBroIYDSHicOsR6LZBUefoRXwmvvbd99dA9Wpk2SkKY7rZCteJfnDHhy0yAiDNxrVNZAGQ11Kz67fqaaStLujAJCKuZC5ka9vGWsoIVfeRJXVy2zmh3LMCW7MxzkKojtMtGwytRc9CEPTLRuvpBxNu2EFxHjFk3uZBJipz6RnQ9uMGvkEnP28Fqgpg8Gse4cseHJJtbpNZB9t5nW9ThcTZBGfGWVvg0zxNlYqIF7ZBlTFV3Q4sToPQEZAQZDZD";
const PHONE_NUMBER_ID = "WHATSAPP_PHONE_ID";

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

app.get("/",(req,res)=>{
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

if(!body.entry){
return res.sendStatus(200);
}

const message = body.entry[0].changes[0].value.messages?.[0];

if(!message){
return res.sendStatus(200);
}

const from = message.from;
const text = message.text?.body?.toLowerCase().trim();
const listReply = message.interactive?.list_reply?.id;
const buttonReply = message.interactive?.button_reply?.id;

if(!userState[from]){
userState[from] = {};
}

let state = userState[from];


// START

if (text && text.toLowerCase().trim() === "hi") {

userState[from] = {};

await sendMessage(from,
"✈️ مرحبا بك في Safar Libya\n\nاكتب المدن بهذا الشكل:\n\nبنغازي - القاهرة"
);

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

await sendMessage(from,
"📅 اكتب تاريخ السفر\nمثال:\n2026-05-10");

return res.sendStatus(200);

}


// إدخال التاريخ

if(state.step==="date" && text){

try{

let origin = airportCodes[state.from];
let destination = airportCodes[state.to];

const response =
await amadeus.shopping.flightOffersSearch.get({

originLocationCode: origin,
destinationLocationCode: destination,
departureDate: text,
adults: "1",
max: "5"

});

if(!response.data || response.data.length===0){

await sendMessage(from,"⚠️ لا توجد رحلات في هذا التاريخ");

return res.sendStatus(200);

}

state.flights = response.data.slice(0,3);
state.step = "chooseFlight";

await sendFlightList(from,state.flights);

}catch(e){

await sendMessage(from,"⚠️ حدث خطأ في البحث");

}

return res.sendStatus(200);

}


// اختيار الرحلة

if(state.step==="chooseFlight" && listReply){

let index = parseInt(listReply.replace("flight",""))-1;

state.flight = state.flights[index];
state.step = "name";

await sendMessage(from,"👤 اكتب الاسم كما في الجواز");

return res.sendStatus(200);

}


// الاسم

if(state.step==="name"){

state.name = text;
state.step="passport";

await sendMessage(from,"🛂 اكتب رقم الجواز");

return res.sendStatus(200);

}


// الجواز

if(state.step==="passport"){

state.passport = text;
state.step = "expiry";

await sendMessage(from,
"📅 اكتب تاريخ انتهاء الجواز\nمثال\n2028-10-01");

return res.sendStatus(200);

}


// انتهاء الجواز

if(state.step==="expiry"){

state.expiry = text;
state.step="payment";

await sendPaymentOptions(from);

return res.sendStatus(200);

}


// الدفع

if(state.step==="payment" && buttonReply){

await sendMessage(from,"💳 جاري إصدار التذكرة...");

setTimeout(()=>{
sendTicket(from,state);
},60000);

state.step="done";

return res.sendStatus(200);

}

res.sendStatus(200);

});


// ارسال رسالة

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

async function sendFlightList(user,flights){

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

type:"list",

body:{
text:"✈️ أفضل الرحلات"
},

action:{

button:"اختيار الرحلة",

sections:[
{
title:"Flights",

rows: flights.map((f,i)=>({

id:flight${i+1},
title:الرحلة ${i+1},
description:`${f.price.total} EUR`

}))

}

]

}

}

})

});

}


// الدفع

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

body:{
text:"💳 اختر طريقة الدفع"
},

action:{

buttons:[

{
type:"reply",
reply:{id:"pay1",title:"Edfa3ly"}
},

{
type:"reply",
reply:{id:"pay2",title:"MobiCash"}
},

{
type:"reply",
reply:{id:"pay3",title:"Musrufi"}
}

]

}

}

})

});

}


// ارسال التذكرة

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

console.log("Server running on port "+PORT);

});
