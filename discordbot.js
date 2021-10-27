// var http = require('http');
//
// http.createServer(function (req, res) {
//   console.log(req.rawBody);
//   if(req.method !== 'POST' || req.url!== '/'){
//     res.writeHead(404, {'Content-Type': 'text/plain'});
//     return res.end('404 not found');
//   }
//   res.write('Hello World!');
//   res.end();
// }).listen(8000);

let express = require('express');
const fs = require('fs');
let app = express();
let ed = require("ed25519");
const fetch = require('node-fetch');
// app.use(express.json());
app.use (function(req, res, next) {
    var data='';
    req.setEncoding('utf8');
    req.on('data', function(chunk) {
       data += chunk;
    });

    req.on('end', function() {
        req.body = data;
        next();
    });
});

let wicku = [];
let battu = [];
let highu = [];

{
const dataz = JSON.parse(fs.readFileSync("peple.json"));
for(const jakey in dataz){
  if(jakey!="ban")
  battu.push(jakey);
}
wicku = battu.slice();
highu = battu.slice();
battu.sort((a,b)=>{
  return dataz[b]["runs"]-dataz[a]["runs"];
});
wicku.sort((a,b)=>{
  return dataz[b]["wicks"]-dataz[a]["wicks"];
});
highu.sort((a,b)=>{
  return dataz[b]["high"]-dataz[a]["high"];
});
}

app.post('/', async function (req, res) {
  const key = "ee1b9cbe622894447731f6a23903f6a98dd65a1be5db664f9f1bc920173c30b2";
  const sig = req.get('X-Signature-Ed25519');
  const time = req.get('X-Signature-Timestamp');
  if(!sig||!time)
    return res.status(404).end();
  let veri = await ed.Verify(Buffer.from(time+req.body, 'utf8'), Buffer.from(sig, 'hex'), Buffer.from(key, 'hex'));
  if(!veri)
    return res.status(401).end('invalid request signature');
  const jsan = JSON.parse(req.body);
  // console.log(jsan);
  if(jsan.type == 1){
    return res.send(JSON.stringify({
        "type": 1
    })).end();
  }else if(jsan.type == 2){
    res.header('Content-Type','application/json');
    {
      const data = JSON.parse(fs.readFileSync("peple.json"));
      if(data.ban.includes(jsan.member.user.id)){
        return res.send(JSON.stringify({"type": 4,"data": {
          "content": `You been banned from this bot. To use this bot, an admin must unban you.`,
          "allowed_mentions": {"parse": []}
        }})).end();
      }
    }
    if(jsan.data.name=="setup"){
      let user = jsan.member.user.id;
      const options = jsan.data.options;
      if(options[4]){
        if(!jsan.member.roles.includes("784299787473649724")&& !(user == "583609260110381059")){
          return res.send(JSON.stringify({"type": 4,"data": {
            "content": "You must be an admin to setup someone else <:Moyaifacepalm:885852804961419274>!"
          }})).end();
        }
        user = options[4].value;
      }
      const data = JSON.parse(fs.readFileSync("peple.json"));
      if(data.ban.includes(user)){
        return res.send(JSON.stringify({"type": 4,"data": {
            "content": `<@!${user}> has been banned from this bot by an admin. To setup their profile, an admin must unban them.`,
            "allowed_mentions": {"parse": []}
        }})).end();
      }
      if(options[0].value.length > 60){
        return res.send(JSON.stringify({"type": 4,"data": {
            "content": "This name is too long <:Jerry:879208560255438889>! Names can be 60 characters max (emojis take up many characters)."
        }})).end();
      }
      if(options[1].value < 0 || options[2].value < 0 || options[3].value < 0){
        return res.send(JSON.stringify({"type": 4,"data": {
            "content": "You sussy baka, you can't provide negative numbers as values! <:LMFAO:879206667747733554>"
        }})).end();
      }
      if(options[1].value < options[3].value){
        return res.send(JSON.stringify({"type": 4,"data": {
            "content": "How can your high score be more than your runs? You lookin real sus there <:RoshikMoment:887204117850763264>."
        }})).end();
      }
      let sussy = false;
      if(data[user])sussy = true;
      data[user] = {"name": options[0].value, "runs": options[1].value, "wicks": options[2].value, "high": options[3].value};
      fs.writeFileSync("peple.json", JSON.stringify(data));
      updateList(battu, user, "runs");
      updateList(wicku, user, "wicks");
      updateList(highu, user, "high");
      if(sussy)
        return res.send(JSON.stringify({"type": 4,"data": {
            "content": `<@!${user}> has already been setup, so I have edited their info <:Thumbsup:895548389691891732>.`,
            "allowed_mentions": {"parse": []}
        }})).end();
      else
        return res.send(JSON.stringify({"type": 4,"data": {
            "content": `Succesfully set up <@!${user}> <:Thumbsup:895548389691891732>.`,
            "allowed_mentions": {"parse": []}
        }})).end();

    }else if(jsan.data.name=="edit"){
      let user = jsan.member.user.id;
      const options = jsan.data.options;
      if(options[2]){
        if(!jsan.member.roles.includes("784299787473649724")&& !(user == "583609260110381059")){
          return res.send(JSON.stringify({"type": 4,"data": {
              "content": "You must be an admin to edit someone else <:Moyaifacepalm:885852804961419274>!"
          }})).end();
        }
        user = options[2].value;
      }
      const data = JSON.parse(fs.readFileSync("peple.json"));
      if(!data[user]){
        return res.send(JSON.stringify({"type": 4,"data": {
            "content": `<:Yoda:885852765711126548> <@!${user}> hasn't been set up yet! Use /setup to setup them.`,
            "allowed_mentions": {"parse": []}
        }})).end();
      }
      if(options[0].value == "name" && options[1].value.length > 60){
        return res.send(JSON.stringify({"type": 4,"data": {
            "content": "This name is too long <:Jerry:879208560255438889>! Names can be 60 characters max (emojis take up many characters)."
        }})).end();
      }
      if(options[0].value != "name" && (!Number.isInteger(Number(options[1].value))||Number(options[1].value)<0)){
        return res.send(JSON.stringify({"type": 4,"data": {
            "content": "You sussy baka, you can't provide negative numbers or decimals as values! <:LMFAO:879206667747733554>"
        }})).end();
      }
      if(options[0].value == "high" && Number(options[1].value) > data[user].runs){
        return res.send(JSON.stringify({"type": 4,"data": {
            "content": "How can your high score be more than your runs? You lookin real sus there <:RoshikMoment:887204117850763264>."
        }})).end();
      }
      if(options[0].value == "name")
        data[user]["name"] = options[1].value;
      else
        data[user][options[0].value] = Number(options[1].value);
      fs.writeFileSync("peple.json", JSON.stringify(data));
      if(options[0].value != "name")updateList({"runs":battu,"wicks":wicku,"high":highu}[options[0].value], user, options[0].value);
      return res.send(JSON.stringify({"type": 4,"data": {
        "content": `Succesfully edited <@!${user}> <:Thumbsup:895548389691891732>.`,
        "allowed_mentions": {"parse": []}
      }})).end();

    }else if(jsan.data.name=="update"){
      let user = jsan.member.user.id;
      const options = jsan.data.options;
      if(options[2]){
        if(!jsan.member.roles.includes("784299787473649724")&& !(user == "583609260110381059")){
          return res.send(JSON.stringify({"type": 4,"data": {
              "content": "You must be an admin to update someone else <:Moyaifacepalm:885852804961419274>!"
          }})).end();
        }
        user = options[2].value;
      }
      const data = JSON.parse(fs.readFileSync("peple.json"));
      if(!data[user]){
        return res.send(JSON.stringify({"type": 4,"data": {
            "content": `<:Yoda:885852765711126548> <@!${user}> hasn't been set up yet! Use /setup to setup them.`,
            "allowed_mentions": {"parse": []}
        }})).end();
      }
      if(options[0].value < 0 || options[1].value < 0){
        return res.send(JSON.stringify({"type": 4,"data": {
            "content": "You sussy baka, you can't provide negative numbers as values! <:LMFAO:879206667747733554>"
        }})).end();
      }
      let becket = false;
      data[user]["runs"]+=options[0].value;
      data[user]["wicks"]+=options[1].value;
      if(data[user]["high"]<options[0].value){
        becket = true;
        data[user]["high"]=options[0].value;
      }
      fs.writeFileSync("peple.json", JSON.stringify(data));
      updateList(battu, user, "runs");
      updateList(wicku, user, "wicks");
      if(becket)updateList(highu, user, "high");
      return res.send(JSON.stringify({"type": 4,"data": {
        "content": `<@!${user}> has ${data[user]["runs"]} runs and ${data[user]["wicks"]} wickets.`,
        "allowed_mentions": {"parse": []}
      }})).end();
    }else if(jsan.data.name=="profile"){
      let user = jsan.member.user.id;
      let mem = jsan.member;
      let uses = jsan.member.user;
      const options = jsan.data.options;
      if(options){
        user = options[0].value;
        mem = jsan.data.resolved.members[user];
        uses = jsan.data.resolved.users[user];
      }
      const data = JSON.parse(fs.readFileSync("peple.json"));
      if(!data[user])
        return res.send(JSON.stringify({"type": 4,"data": {
            "content": `<:Yoda:885852765711126548> <@!${user}> hasn't been set up yet! Use /setup to setup them.`,
            "allowed_mentions": {"parse": []}
        }})).end();
      return res.send(JSON.stringify({"type": 4,"data": {
          "embeds": [{
            "title": `${data[user]["name"]}'s profile`,
            "author": {
              "name": `${uses.username}#${uses.discriminator}${mem.nick==null?"":` AKA ${mem.nick}`}`,
              "icon_url": "https://cdn.discordapp.com/"+(uses.avatar?`avatars/${user}/${uses.avatar}.png`:`embed/avatars/${uses.discriminator%5}.png`)
            },
            "color": 16738151,
            "fields": [{
              "name": "Runs",
              "value": data[user]["runs"],
              "inline": true
            },{
              "name": "Wickets",
              "value": data[user]["wicks"],
              "inline": true
            },{
              "name": "High Score",
              "value": data[user]["high"],
              "inline": true
            },{
              "name": "Batting Rank",
              "value": battu.indexOf(user)+1,
              "inline": true
            },{
              "name": "Wickets Rank",
              "value": wicku.indexOf(user)+1,
              "inline": true
            },{
              "name": "High Score Rank",
              "value": highu.indexOf(user)+1,
              "inline": true
            }]
          }]
      }})).end();
    }else if(jsan.data.name=="runs"){
      const data = JSON.parse(fs.readFileSync("peple.json"));
      let message = `**Runs Leaderboard${battu.includes(jsan.member.user.id)?` (you are rank #${battu.indexOf(jsan.member.user.id)+1})`:""}:**\n`;
      for(let i = 0; i < battu.length; i++){
        message+=`${i+1}. ${data[battu[i]]["name"]}: ${data[battu[i]]["runs"]} runs\n`;
      }
      return res.send(JSON.stringify({"type": 4,"data": {
          "content": message,
      }})).end();
    }else if(jsan.data.name=="wickets"){
      const data = JSON.parse(fs.readFileSync("peple.json"));
      let message = `**Wickets Leaderboard${wicku.includes(jsan.member.user.id)?` (you are rank #${wicku.indexOf(jsan.member.user.id)+1})`:""}:**\n`;
      for(let i = 0; i < wicku.length; i++){
        message+=`${i+1}. ${data[wicku[i]]["name"]}: ${data[wicku[i]]["wicks"]} wickets\n`;
      }
      return res.send(JSON.stringify({"type": 4,"data": {
          "content": message,
      }})).end();
    }else if(jsan.data.name=="highscores"){
      const data = JSON.parse(fs.readFileSync("peple.json"));
      let message = `**Highscore Leaderboard${highu.includes(jsan.member.user.id)?` (you are rank #${highu.indexOf(jsan.member.user.id)+1})`:""}:**\n`;
      for(let i = 0; i < highu.length; i++){
        message+=`${i+1}. ${data[highu[i]]["name"]}: ${data[highu[i]]["high"]} runs\n`;
      }
      return res.send(JSON.stringify({"type": 4,"data": {
          "content": message,
      }})).end();
    }else if(jsan.data.name=="reset"){
      if(!jsan.member.roles.includes("784299787473649724") && !(user == "583609260110381059")){
        return res.send(JSON.stringify({"type": 4,"data": {
            "content": "You must be an admin to reset someone <:Moyaifacepalm:885852804961419274>!"
        }})).end();
      }
      const options = jsan.data.options;
      user = options[0].value;
      const data = JSON.parse(fs.readFileSync("peple.json"));
      if(!data[user])
        return res.send(JSON.stringify({"type": 4,"data": {
            "content": `<:Yoda:885852765711126548> <@!${user}> hasn't been set up yet! Use /setup to setup them.`,
            "allowed_mentions": {"parse": []}
        }})).end();
      data[user]=undefined;
      removeElem(battu, user);
      removeElem(wicku, user);
      removeElem(highu, user);
      fs.writeFileSync("peple.json", JSON.stringify(data));
      return res.send(JSON.stringify({"type": 4,"data": {
          "content": `I have reset <@!${user}> <:Thumbsup:895548389691891732>.`,
          "allowed_mentions": {"parse": []}
      }})).end();
    }else if(jsan.data.name=="ban-toggle"){
      const options = jsan.data.options;
      let mem = jsan.data.resolved.members[options[0].value];
      let user = options[0].value;
      if(!jsan.member.roles.includes("784299787473649724") && !(jsan.member.user.id == "583609260110381059")){
        return res.send(JSON.stringify({"type": 4,"data": {
            "content": "You must be an admin to ban or unban someone <:Moyaifacepalm:885852804961419274>!"
        }})).end();
      }
      if(mem.roles.includes("784299787473649724") || user == "583609260110381059"){
        return res.send(JSON.stringify({"type": 4,"data": {
            "content": "You can't ban or unban an admin <:YouSure:900621590478344233>!"
        }})).end();
      }
      const data = JSON.parse(fs.readFileSync("peple.json"));
      if(data.ban.includes(user)){
        data.ban.splice(data.ban.indexOf(user), 1);
        fs.writeFileSync("peple.json", JSON.stringify(data));
        return res.send(JSON.stringify({"type": 4,"data": {
            "content": `<@!${user}> has been unbanned <:NaruDab:885852911299608576>! They do have to re-setup their profile as it has been deleted.`,
            "allowed_mentions": {"parse": []}
        }})).end();
      }else{
        if(data[user]){
          data[user]=undefined;
          removeElem(battu, user);
          removeElem(wicku, user);
          removeElem(highu, user);
        }
        data.ban.push(user);
        fs.writeFileSync("peple.json", JSON.stringify(data));
        return res.send(JSON.stringify({"type": 4,"data": {
            "content": `<@!${user}> has been banned from using this bot <:Sadboi:900621511654789161>! Their profile has also been permanently deleted. You can use this same command again to unban them.`,
            "allowed_mentions": {"parse": []}
        }})).end();
      }
    }
    return res.send(JSON.stringify({
      "type": 4,
      "data": {
        "content": "Work in progress!"
      }
    })).end();
  }
})

function removeElem(array, item){
  var i = array.length;
  while(i--){
    if(array[i] === item){
      array.splice(array.indexOf(item), 1);
    }
  }
}

function updateList(array, item, thang){
  removeElem(array, item);
  const data = JSON.parse(fs.readFileSync("peple.json"));
  let baka = true;
  for(let j = 0; j<array.length; j++){
    if(data[array[j]][thang]<data[item][thang]){
      array.splice(j, 0, item);
      baka = false;
      break;
    }
  }
  if(baka)array.push(item);
}


{
async function makecommand(){
  let bruh = await fetch("https://discord.com/api/v8/applications/873093661276123167/guilds/783891723045568532/commands",
    {
      "method": "POST",
      "headers": {'Content-Type': 'application/json',
        "Authorization": "Bot ODczMDkzNjYxMjc2MTIzMTY3.YQzZ1g.qK20gJMEa2nRP7nKyaWxJmaZaJE"},
      "body": JSON.stringify({
        "name": "ban-toggle",
        "type": 1,
        "description": "Ban (or unban if they are already banned) a user from using this bot.",
        "options": [{
            "name": "user",
            "description": "Which user do you want to ban or unban?",
            "type": 6,
            "required": true
        }]
        // "description": "Testing command" /guilds/738263333517394030
      })
    });
  console.log(await bruh.json());
}

// makecommand();

async function getcommands(){
  let bruh = await fetch("https://discord.com/api/v8/applications/873093661276123167/commands",
    {
      "method": "GET",
      "headers": {"Authorization": "Bot ODczMDkzNjYxMjc2MTIzMTY3.YQzZ1g.qK20gJMEa2nRP7nKyaWxJmaZaJE"}
        // "description": "Testing command" /guilds/738263333517394030
  });
  console.log(await bruh.json());
}

// getcommands();

function deletecommand(id){
  fetch("https://discord.com/api/v8/applications/873093661276123167/guilds/783891723045568532/commands/"+id,{
      "method": "DELETE",
      "headers": {"Authorization": "Bot ODczMDkzNjYxMjc2MTIzMTY3.YQzZ1g.qK20gJMEa2nRP7nKyaWxJmaZaJE"}
  });
}

// deletecommand("902755246185525268");
}
let server = app.listen(process.env.PORT || 3000, function () {
  let host = server.address().address;
  let port = server.address().port;

  console.log("Example app listening at http://%s:%s", host, port);
})
