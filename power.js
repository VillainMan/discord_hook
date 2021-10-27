const Newcopp = require('./newcopp.js');
const fs = require('fs');

const bot = new Newcopp();

bot.onReady = ()=>{
  console.log(`Bot logged in as ${bot.user.id}`);
};

bot.onMesg = async function(mesg){
  if(mesg.author.bot/* || bot.cache.channels.get(mesg.channel_id).type != 1*/) return;
  const bruh = await bot.postMessage(mesg.channel_id, {
    "content": "testing",
    "sticker_ids": ["749054660769218631"]
  });
  console.log(JSON.parse(bruh));
};

// bot.message(async (mesg)=>{
//   if(mesg.author.bot || bot.cache.channels.get(mesg.channel_id).type != 1) return;
// //   if(mesg.content == "panda"){
// //     return bot.postMessage(mesg.channel_id, "You are now part of the Panda Secret Society (PANS).\n\
// // You must now set your status to DM me the word \"panda\".\n\
// // Do not tell anyone about the society UNLESS they DM you the word \"panda\", in which case send them this message exactly.\n\
// // You are also immune to any other virus or status changer (on discord).\n\
// // \n\
// // If you would like to join the PANS server (so you can access perks), use this link: <https://discord.gg/SXUQszmza8> and DM the bot in the server (Panda Butler) this exact passcode (don't include the quotes): \"panda_secret_society_forever\"");
// //   }
// //   else if(mesg.content == "panda_secret_society_forever"){
// //     const bruh = await bot.addRole("864502033037393950", mesg.author.id, "881942907953770577");
// //     if(bruh[0] != "204")
// //       return bot.postMessage(mesg.channel_id, "Join this server before using the command.\nhttps://discord.gg/SXUQszmza8");
// //     return bot.postMessage(mesg.channel_id, "Entry accepted. You are now officially a member of the Panda Secret Society. The perks of joining this society is more Panda Butler money and early updates! Our headquarters are located here: <#881945770817912912>.");
// //   }
// });

// bot.login("ODUwNjMwNzg4NzM0MTI0MDMy.YLshpw.adP2dKTr-_T859FC4X8FG_KM2pY");

bot.connect("OTAyNDcwNTQ5NzczNjMxNDg4.YXe5Mg.f7xYyT0LEpaMWFlOul2PKliZwbo");
