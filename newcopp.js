const req = require('request');
const WebSocket = require('ws');
const Emitter = require('events');
const msgcall = new Emitter();
let thisobj;

/*
Events:
onReady()
onMesg(mesg)
onGuildJoin(guild)
onGuildLeave(guild)
onGuildMemberJoin(member)
onChannelCreate(channel)
onChannelDelete(channel)
onWebhookUpdate(webhook)
onEmoteUpdate(emote)
onReactionAdd(reaction)
onInteraction(interaction)

APIs:
postMessage(channel, message)
editMessage(channel, mesgid, message)
replyMessage(channel, message, reference)
getMessage(channel, message)
getWebhooks(channel)
makeWebhook(channel, name)
postWebhook(id, token, message, name, avatar)
deleteMessage(channel, message)
getWebhook(id, token)
postReaction(channel, mesg, emoji)
postInteraction(interaction, reply, text)
editInteraction(interaction, text)
*/

module.exports = class Newcopp {
  constructor(){
    this.cache = {};
    thisobj = this;
    this.cache.guilds = new Map();
    this.cache.channels = new Map();
    this.cache.emotes = new Map();
    this.waitses = {};
    this.channel = {};
    this.channel.text = 0;
    this.channel.dm = 1;
    this.channel.voice = 2;
    this.channel.group = 3;
    this.channel.category = 4;
    this.channel.news = 5;
    this.channel.store = 6;
    this.channel.stage = 13;
    this.perms = {};
    this.perms[1<<0] = "CREATE_INSTANT_INVITE";
    this.perms[1<<1] = "KICK_MEMBERS";
    this.perms[1<<2] = "BAN_MEMBERS";
    this.perms[1<<3] = "ADMINISTRATOR";
    this.perms[1<<4] = "MANAGE_CHANNELS";
    this.perms[1<<5] = "MANAGE_GUILD";
    this.perms[1<<6] = "ADD_REACTIONS";
    this.perms[1<<7] = "VIEW_AUDIT_LOG";
    this.perms[1<<8] = "PRIORITY_SPEAKER";
    this.perms[1<<9] = "STREAM";
    this.perms[1<<10] = "VIEW_CHANNEL";
    this.perms[1<<11] = "SEND_MESSAGES";
    this.perms[1<<12] = "SEND_TTS_MESSAGES";
    this.perms[1<<13] = "MANAGE_MESSAGES";
    this.perms[1<<14] = "EMBED_LINKS";
    this.perms[1<<15] = "ATTACH_FILES";
    this.perms[1<<16] = "READ_MESSAGE_HISTORY";
    this.perms[1<<17] = "MENTION_EVERYONE";
    this.perms[1<<18] = "USE_EXTERNAL_EMOJIS";
    this.perms[1<<19] = "VIEW_GUILD_INSIGHTS";
    this.perms[1<<20] = "CONNECT";
    this.perms[1<<21] = "SPEAK";
    this.perms[1<<22] = "MUTE_MEMBERS";
    this.perms[1<<23] = "DEAFEN_MEMBERS";
    this.perms[1<<24] = "MOVE_MEMBERS";
    this.perms[1<<25] = "USE_VAD";
    this.perms[1<<26] = "CHANGE_NICKNAME";
    this.perms[1<<27] = "MANAGE_NICKNAMES";
    this.perms[1<<28] = "MANAGE_ROLES";
    this.perms[1<<29] = "MANAGE_WEBHOOKS";
    this.perms[1<<30] = "MANAGE_EMOJIS";
    this.perms[1<<31] = "USE_SLASH_COMMANDS";
    this.perms[1<<32] = "REQUEST_TO_SPEAK";
    this.perms[1<<34] = "MANAGE_THREADS";
    this.perms[1<<35] = "USE_PUBLIC_THREADS";
    this.perms[1<<36] = "USE_PRIVATE_THREADS";
    this.colors = {
      "white": 0xffffff,
      "blue": 0x5865f2,
      "grey": 0x99aab5,
      "dark": 0x2c2f33,
      "shadow": 0x23272a,
      "green": 0x57f287,
      "yellow": 0xFEE75C,
      "fuschia": 0xEB459E,
      "red": 0xED4245,
      "black": 0x23272A,
      "brown": 0x8A5A44
    }
  }
  buttonWizard(color, name, value, dis){
    let obj = {
      "type": 2,
      "label": name,
      "style": color
    };
    if(color == 5){
      obj["url"] = value;
    }else{
      obj["custom_id"] = value;
    }
    if(dis===true)
      obj["disabled"] = true;
    return obj;
  }
  embedWizard(title, desc, url, color){
    if(typeof color != "number"){
      color = this.colors[color];
    }
    return {
      "title": title,
      "description": desc,
      "url": url,
      "color": color
    };
  }
  permissionWizard(memberp, guildp, chanp, ignore_over){
    const guild = this.cache.guilds.get(guildp);
    const member = guild.members.get(memberp);
    if(guild.owner_id == memberp){
      return "ALL";
    }
    let perms = Number(guild.roles.get(guildp).permissions);
    for(let role of guild.roles){
      role = role[1];
      if(!member.roles.includes(role.id)){
        continue;
      }
      perms |= Number(role.permissions);
    }
    if(perms & 8){
      return "ALL";
    }
    if(!ignore_over){
      let everyove;
      let roleove = [];
      let usove;
      const channel = this.cache.channels.get(chanp);
      for(const over of channel.permission_overwrites){
        if(over.id == guildp){
          everyove = over;
        }else if(member.roles.includes(over.id)){
          roleove.push(over);
        }else if(over.id == memberp){
          usove = over;
        }
      }
      if(everyove){
        perms &= ~Number(everyove.deny);
        perms |= Number(everyove.allow);
      }
      for(const gb of roleove){
        perms &= ~Number(gb.deny);
        perms |= Number(gb.allow);
      }
      if(usove){
        perms &= ~Number(usove.deny);
        perms |= Number(usove.allow);
      }
    }
    let krm = [];
    for(const ghjy in this.perms){
      if(perms & ghjy){
        krm.push(this.perms[ghjy]);
      }
    }
    return krm;
  }
  random(min, max) {// min included, max excluded
    return Math.floor(Math.random() * (max - min) ) + min;
  }
  memberWizard(member){
    const name = member.nick==null?member.user.username:member.nick;
    const avatar = member.user.avatar?`https://cdn.discordapp.`+
      `com/avatars/${member.user.id}/${member.user.avatar}.png`:
      `https://cdn.discordapp.com/embed/avatars/${member.user.discriminator%5}.png`;
    return {
      name: name,
      avatar: avatar
    }
  }
  timeWizard(seconds){
    seconds = Math.floor(seconds);
    let secs;
    let hours;
    let mins;
    let days;
    let weeks;

    let ssecs;
    let shours;
    // string hours, s and hours are separte not shours
    let smins;
    let sdays;
    let sweeks;

    let sarr = [];
    let smarr = [];
    let sand = "";

    if(seconds < 60){
      seconds = `${seconds} second${seconds==1?"":"s"}`;
    }else if(seconds < 3600){
      secs = seconds % 60;
      seconds -= secs;
      mins = seconds/60;
      ssecs = secs?` and ${secs} second${secs==1?"":"s"}`:"";
      seconds = `${mins} minute${mins==1?"":"s"}${ssecs}`;
    }else if(seconds < (3600*24)){
      secs = seconds%60;
      seconds -= secs;
      mins = (seconds%3600)/60;
      //console.log(mins);
      seconds -= mins*60;
      //console.log(times);
      hours = seconds/3600;

      sarr[0] = mins?`${mins} minute${mins==1?"":"s"}`:"";
      sarr[1] = secs?`${secs} second${secs==1?"":"s"}`:"";
      for(const f in sarr){
        if(sarr[f])smarr.push(f);
      }
      if(smarr.length == 1){
        sarr[smarr[0]] = " and "+sarr[smarr[0]];
      }
      if(smarr.length > 1){
        for(const f in smarr){
          if(f == smarr.length-1){
            sarr[smarr[f]] = ", and "+sarr[smarr[f]];
          }else{
            sarr[smarr[f]] = ", "+sarr[smarr[f]];
          }
        }
      }
      seconds = `${hours} hour${hours==1?"":"s"}${sarr[0]}${sarr[1]}`;
    }else{
      secs = seconds%60;
      seconds -= secs;
      mins = (seconds%3600)/60;
      //console.log(mins);
      seconds -= mins*60;
      hours = (seconds%(3600*24))/(60*60);
      seconds -= hours*3600;
      days = seconds/(3600*24);


      sarr[0] = hours?`${hours} hour${hours==1?"":"s"}`:"";
      sarr[1] = mins?`${mins} minute${mins==1?"":"s"}`:"";
      sarr[2] = secs?`${secs} second${secs==1?"":"s"}`:"";
      for(const f in sarr){
        if(sarr[f])smarr.push(f);
      }
      if(smarr.length == 1){
        sarr[smarr[0]] = " and "+sarr[smarr[0]];
      }
      if(smarr.length >= 2){
        for(const f in smarr){
          if(f == smarr.length-1){
            sarr[smarr[f]] = ", and "+sarr[smarr[f]];
          }else{
            sarr[smarr[f]] = ", "+sarr[smarr[f]];
          }
        }
      }
      seconds = `${days} day${days==1?"":"s"}${sarr[0]}${sarr[1]}${sarr[2]}`;
      // seconds = `${days} day${days==1?"":"s"}, ${hours} hour${hours==1?"":"s"}, ${mins} minute${mins==1?"":"s"}, and ${secs} second${secs==1?"":"s"}`;
      // fix it so if a value is zero it shouldn't even appear
    }
    return seconds;
  }
  tableWizard(arr, corner="+", col="|", row="-"){
    let colsw = [];
    let data = ""
    let i = 0;
    while(i<arr[0].length){
      let frg = 0;
      let j = 0;
      while(j<arr.length){
        frg = Math.max(arr[j][i].length, frg);
        j++;
      }
      colsw[i]=frg;
      i++;
    }
    i = 0;
    let faor;
    while(i<arr.length){
      faor=corner;
      data+=col;
      let j =0;
      while(j<arr[0].length){
        data+=" "+arr[i][j]+" ".repeat(colsw[j]-arr[i][j].length)+" "+col;
        j++;
      }
      data+="\n"+corner;
      j=0;
      while(j<arr[0].length){
        const yuka = row.repeat(colsw[j]+2)+corner;
        faor+=yuka;
        data+=yuka;
        j++;
      }
      data+="\n"
      i++;
    }
    data = faor+"\n"+data;
    return data;
  }
  async collectMessage(channel, mesg, obj){
    /*
    obj = {
      time: ,
      success: ,
      total: ,
      validator:
    }
    */
    this.waitses[channel]=true;
    if(!obj.time&&!obj.successes&&!obj.total){
      return undefined;
    }
    let rfunc = function(bruhame){
      if(obj.total)obj.total--;
      if(obj.validator&&!obj.validator(bruhame)){
        return;
      }
      if(obj.success)obj.success--;
      mesg(bruhame);
      if(obj.total==0)mimih("total");
      if(obj.success==0)mimih("success");
    }
    let mimih = function(hjk){
      msgcall.removeListener("send", rfunc);
      delete thisobj.waitses[channel]
      return hjk;
    }
    msgcall.on("send", rfunc);
    if(obj.time){
      await new Promise((resolve, reject)=>{
        setTimeout(resolve, obj.time);
      });
      msgcall.removeListener("send", rfunc);
      delete thisobj.waitses[channel]
      return "time";
    }
  }
  postMessage(channel, message){ //post a message
    if(message.embed && typeof message.embed.color != "number"){
      message.embed.color = this.colors[message.embed.color];
    }
    return new Promise((resolve, reject) => {
      if(typeof message == "string"){
        message = {
          content: message
        }
      }
      const options = {
        url: `https://discord.com/api/v6/channels/${channel}/messages`,
        headers: {"Authorization": `Bot ${this.token}`, "Content-type": "application/json"},
        body: JSON.stringify(message)
      }
      req.post(options,
      (error, response, body) => {
        if(error){
          reject(error);
        }
        resolve(body);
      });
    });
  }
  postCommand(command, guild){
    let comstr;
    if(guild){
      comstr = `https://discord.com/api/v8/applications/${this.user.id}/guilds/${guild}/commands`;
    }else{
      comstr = `https://discord.com/api/v8/applications/${this.user.id}/commands`;
    }
    return new Promise((resolve, reject) => {
      const options = {
        url: comstr,
        headers: {"Authorization": `Bot ${this.token}`, "Content-type": "application/json"},
        body: JSON.stringify(command)
      }
      req.post(options,
      (error, response, body) => {
        if(error){
          reject(error);
        }
        resolve(body);
      });
    });
  }
  addRole(guild, id, role){
    return new Promise((resolve, reject) => {
      const options = {
        url: `https://discord.com/api/v8/guilds/${guild}/members/${id}/roles/${role}`,
        headers: {"Authorization": `Bot ${this.token}`, "Content-type": "application/json"},
      }
      req.put(options,
      (error, response, body) => {
        if(error){
          reject(error);
        }
        resolve([response.statusCode,body]);
      });
    });
  }
  getCommands(guild){
    let comstr;
    if(guild){
      comstr = `https://discord.com/api/v8/applications/${this.user.id}/guilds/${guild}/commands`;
    }else{
      comstr = `https://discord.com/api/v8/applications/${this.user.id}/commands`;
    }
    return new Promise((resolve, reject) => {
      const options = {
        url: comstr,
        headers: {"Authorization": `Bot ${this.token}`}
      }
      req.get(options,
      (error, response, body) => {
        if(error){
          reject(error);
        }
        resolve(body);
      });
    });
  }
  deleteCommand(command, guild){
    let comstr;
    if(guild){
      comstr = `https://discord.com/api/v8/applications/${this.user.id}/guilds/${guild}/commands/${command}`;
    }else{
      comstr = `https://discord.com/api/v8/applications/${this.user.id}/commands/${command}`;
    }
    return new Promise((resolve, reject) => {
      const options = {
        url: comstr,
        headers: {"Authorization": `Bot ${this.token}`}
      }
      req.delete(options,
      (error, response, body) => {
        if(error){
          reject(error);
        }
        resolve(body);
      });
    });
  }
  editMessage(channel, mesgid, message){
    if(message.embed && typeof message.embed.color != "number"){
      message.embed.color = this.colors[message.embed.color];
    }
    return new Promise((resolve, reject) => {
      if(typeof message == "string"){
        message = {
          content: message
        }
      }
      const options = {
        url: `https://discord.com/api/v6/channels/${channel}/messages/${mesgid}`,
        headers: {"Authorization": `Bot ${this.token}`, "Content-type": "application/json"},
        body: JSON.stringify(message)
      }
      req.patch(options,
      (error, response, body) => {
        if(error){
          reject(error);
        }
        resolve(body);
      });
    });
  }
  replyMessage(channel, message, reference){
    if(message.embed && typeof message.embed.color != "number"){
      message.embed.color = this.colors[message.embed.color];
    }
    return new Promise((resolve, reject) => {
      if(typeof message == "string"){
        message = {
          content: message
        }
      }
      message.message_reference = {
        message_id: reference
      };
      const options = {
        url: `https://discord.com/api/v8/channels/${channel}/messages`,
        headers: {"Authorization": `Bot ${this.token}`, "Content-type": "application/json"},
        body: JSON.stringify(message)
      }
      req.post(options,
      (error, response, body) => {
        if(error){
          reject(error);
        }
        resolve(body);
      });
    });
  }
  getMessage(channel, message){
    return new Promise((resolve, reject) => {
      const options = {
        url: `https://discord.com/api/v6/channels/${channel}/messages/${message}`,
        headers: {"Authorization": `Bot ${this.token}`}
      }
      req.get(options,
      (error, response, body) => {
        if(error){
          reject(error);
        }
        resolve(body);
      });
    });
  }
  getWebhooks(channel){
    return new Promise((resolve, reject) => {
      const options = {
        url: `https://discord.com/api/v6/channels/${channel}/webhooks`,
        headers: {"Authorization": `Bot ${this.token}`}
      }
      req.get(options,
      (error, response, body) => {
        if(error){
          reject(error);
        }
        resolve(body);
      });
    })
  }
  makeWebhook(channel, name){
    return new Promise((resolve, reject) => {
      const options = {
        url: `https://discord.com/api/v6/channels/${channel}/webhooks`,
        headers: {"Authorization": `Bot ${this.token}`, "Content-type": "application/json"},
        body: JSON.stringify({name: name})
      };
      req.post(options,
      (error, response, body) => {
        if(error){
          reject(error);
        }
        resolve(body);
      });
    });
  }
  postWebhook(webhook, message, name, avatar){
    return new Promise((resolve, reject) => {
      const options = {
        url: `https://discord.com/api/v6/webhooks/${webhook.id}/${webhook.token}`,
        headers: {"Authorization": `Bot ${this.token}`, "Content-type": "application/json"},
        body: JSON.stringify({username: name, content: message, avatar_url : avatar})
      };
      req.post(options,
      (error, response, body) => {
        if(error){
          reject(error);
        }
        resolve(body);
      });
    })
  }
  deleteMessage(channel, message){
    return new Promise((resolve, reject) => {
      const options = {
        url: `https://discord.com/api/v6/channels/${channel}/messages/${message}`,
        headers: {"Authorization": `Bot ${this.token}`}
      };
      req.delete(options,
      (error, response, body) => {
        if(error){
          reject(error);
        }
        resolve(body);
      });
    })
  }
  getWebhook(id, token){
    return new Promise((resolve, reject) => {
      const options = {
        url: `https://discord.com/api/v6/webhooks/${id}/${token}`,
        headers: {"Authorization": `Bot ${this.token}`}
      };
      req.delete(options,
      (error, response, body) => {
        if(error){
          reject(error);
        }
        resolve(body);
      });
    })
  }
  postReaction(mesg, emoji){
    return new Promise((resolve, reject) => {
      const options = {
        url: `https://discord.com/api/v6/channels/${mesg.channel_id}/messages/${mesg.id}/reactions/${emoji}/@me`,
        headers: {"Authorization": `Bot ${this.token}`}
      };
      req.put(options,
      (error, response, body) => {
        if(error){
          reject(error);
        }
        resolve(body);
      });
    })
  }
  editUser(data){
    return new Promise((resolve, reject) => {
      const options = {
        url: `https://discord.com/api/v9/users/@me`,
        headers: {"Authorization": `Bot ${this.token}`, "Content-type": "application/json"},
        body: JSON.stringify(data)
      }
      req.patch(options,
      (error, response, body) => {
        if(error){
          reject(error);
        }
        resolve(body);
      });
    });
  }
  postInteraction(interaction, reply, text){
    const obj = {
      "reply": 1,
      "think": 2,
      "wait": 3,
      "edit": 4
    }
    if(text.embed && typeof text.embed.color != "number"){
      text.embed.color = this.colors[text.embed.color];
    }
    if(typeof(reply) == "string"){
      reply = obj[reply.toLowerCase()];
      if(!reply) return new Promise((resolve, reject) => {reject("Unknown reply")})
    }else if(typeof(reply) == "number"){
      if(![1,2,3,4].includes(reply))
        return new Promise((resolve, reject) => {reject("Unknown reply")})
    }else{
      return new Promise((resolve, reject) => {reject("Unknown reply")})
    }
    if(interaction.type == 2 && (reply == 3 || reply == 4)){
      return new Promise((resolve, reject) => {reject("Illegal reply")})
    }
    if(typeof text == "string"){
      text = {
        "content": text
      }
    }
    if(text.embed&&typeof text.embed != "string"){
      text.embeds = [text.embed];
      text.embed = undefined;
    }
    if(text.embed && typeof text.embed.color != "number"){
      text.embed.color = this.colors[text.embed.color];
    }
    return new Promise((resolve, reject) => {
      const options = {
        url: `https://discord.com/api/v9/interactions/${interaction.id}/${interaction.token}/callback`,
        headers: {"Authorization": `Bot ${this.token}`, "Content-Type": "application/json"},
        body: JSON.stringify({
          "type": reply+3,
          "data": text
        })
      };
      req.post(options,
      (error, response, body) => {
        if(error){
          reject(error);
        }
        resolve(body);
      });
    })
  }
  deleteInteraction(interaction){
    return new Promise((resolve, reject) => {
      const options = {
        url: `https://discord.com/api/v9/webhooks/${interaction.message.author.id}/${interaction.token}/messages/@original`,
        headers: {"Authorization": `Bot ${this.token}`}
      };
      req.delete(options,
      (error, response, body) => {
        if(error){
          reject(error);
        }
        resolve(body);
      });
    })
  }
  leaveGuild(id){
    return new Promise((resolve, reject) => {
      const options = {
        url: `https://discord.com/api/v9/users/@me/guilds/${id}`,
        headers: {"Authorization": `Bot ${this.token}`}
      };
      req.delete(options,
      (error, response, body) => {
        if(error){
          reject(error);
        }
        resolve(body);
      });
    })
  }
  editInteraction(interaction, text){
    if(typeof text == "string"){
      text = {
        "content": text
      }
    }
    if(text.embed&&typeof text.embed != "string"){
      text.embeds = [text.embed];
      text.embed = undefined;
    }
    if(text.embed && typeof text.embed.color != "number"){
      text.embed.color = this.colors[text.embed.color];
    }
    return new Promise((resolve, reject) => {
      const options = {
        url: `https://discord.com/api/v9/webhooks/${interaction.message.author.id}/${interaction.token}/messages/@original`,
        headers: {"Authorization": `Bot ${this.token}`, "Content-Type": "application/json"},
        body: JSON.stringify(text)
      };
      req.patch(options,
      (error, response, body) => {
        if(error){
          reject(error);
        }
        resolve(body);
      });
    })
  }
  postNewInteraction(interaction, text){
    if(typeof text == "string"){
      text = {
        "content": text
      }
    }
    if(text.embed&&typeof text.embed != "string"){
      text.embeds = [text.embed];
      text.embed = undefined;
    }
    if(text.embed && typeof text.embed.color != "number"){
      text.embed.color = this.colors[text.embed.color];
    }
    return new Promise((resolve, reject) => {
      const options = {
        url: `https://discord.com/api/v9/webhooks/${this.user.id}/${interaction.token}`,
        headers: {"Authorization": `Bot ${this.token}`, "Content-Type": "application/json"},
        body: JSON.stringify(text)
      };
      req.post(options,
      (error, response, body) => {
        if(error){
          reject(error);
        }
        resolve(body);
      });
    })
  }
  connect(p_token, resume){
    thisobj.heartbeat = 0;
    thisobj.sequence = null;
    thisobj.token = p_token;
    thisobj.clicon = new WebSocket("wss://gateway.discord.gg/?v=6&encoding=json"); // cli con is client connection
    thisobj.clicon.onerror = function(error){
      console.log(`There has been an error in the websocket thing. ${error}`);
      return 1;
    };
    if(resume){
      thisobj.clicon.onopen = function(){
        thisobj.clicon.send(JSON.stringify({
          "op": 6,
          "d": {
            "token": thisobj.token,
            "session_id": thisobj.session,
            "seq": thisobj.sequence
          }
        }));
      };
    }
    thisobj.clicon.onmessage = function(p_mesg){
      const message = JSON.parse(p_mesg.data);
      if(message.s){ //sets sequence
        thisobj.sequence = message.s;
      }
      if(message.op!=0)
        console.log(message.op);
      switch(message.op){
      case 10:
        thisobj.hbinterval = message.d.heartbeat_interval;
        thisobj.dubdub = setInterval(function(){ //MAKE SURE TO SET clearInterval(thisobj.dubdub);
          thisobj.clicon.send(JSON.stringify({
            "op": 1,
            "d": thisobj.sequence
          }));
          thisobj.heartbeat++;
          if(thisobj.hearbeat > 1){
            console.log("heartbeat non");
            thisobj.clicon.close(1006);
            clearInterval(thisobj.dubdub);
            thisobj.connect(thisobj.token, true);
          }
        }, thisobj.hbinterval);
        thisobj.clicon.send(JSON.stringify({
            "op": 2,
            "d": {
              "token": thisobj.token,
              "properties": {
                  "$os": "osx",
                  "$browser": "newcopp_js",
                  "$device": "newcopp_js"
              },
              "intents": 1 << 0|1 << 9|1 << 10|1 << 12, //GUILDS, GUILD_MESSAGES, GUILD_MESSAGE_REACTIONS,
//            DIRECT_MS
              "shard": [0, 1],
              "presence": {
                // "activities": [{
                //   "name": "dm me the word \"panda\"",
                //   "type": 0
                // }],
                "status": "invisible"
              }
            }
        }));
        break;
      case 11:
        thisobj.heartbeat--;
        break;
      case 7:
        console.log("asking to reconnect");
        thisobj.clicon.close(1006);
        clearInterval(thisobj.dubdub);
        thisobj.connect(thisobj.token, true);
        break;
      case 9:
        if(message.d){
          console.log("9 true");
          thisobj.clicon.close(1006);
          clearInterval(thisobj.dubdub);
          thisobj.connect(thisobj.token, true);
        }else{
          console.log("9 false");
          thisobj.clicon.close(1000);
          clearInterval(thisobj.dubdub);
          thisobj.connect(thisobj.token);
        }
        break;
      case 0:
        switch(message.t){
        case "READY":
          thisobj.session = message.d.session_id;
          thisobj.cache.guilds.clear();
          thisobj.cache.emotes.clear();
          thisobj.numguilds = message.d.guilds.length;
          thisobj.user = message.d.user;
          break;
        case "MESSAGE_CREATE":
          if(thisobj.waitses[message.d.channel_id]){
            msgcall.emit("send", message.d);
          }
          if(typeof thisobj.onMesg == "function"){
            thisobj.onMesg(message.d);
          }
          if(typeof thisobj.onUserMesg == "function"){
            thisobj.onUserMesg(message.d);
          }
          break;
        case "GUILD_CREATE":
          let mua = new Map();
          let tue = new Map();
          let vue = new Map();
          for(const yo of message.d.members){
            mua.set(yo.user.id, yo);
          }
          for(const yo of message.d.roles){
            tue.set(yo.id, yo);
          }
          for (const emote of message.d.emojis){
            emote.guild_id = message.d.id;
            thisobj.cache.emotes.set(emote.id, emote);
            let sorell = emote.name;
            if(vue.has(sorell)){
              let byt = 1;
              while(vue.has(sorell)){
                sorell = emote.name+"~"+byt;
                byt++;
              }
            }
            vue.set(sorell, emote);
          }
          message.d.members = mua;
          message.d.roles = tue;
          message.d.emojis = vue;
          thisobj.cache.guilds.set(message.d.id, message.d);
          for(const channel of message.d.channels){
            thisobj.cache.channels.set(channel.id, channel);
          }
          if(thisobj.numguilds > 0){
            console.log("guild "+message.d.id+" "+message.d.name);
            thisobj.numguilds--;
            if(thisobj.numguilds == 0){
              if(typeof thisobj.onReady == "function")
                thisobj.onReady();
              if(typeof thisobj.onUserReady == "function")
                thisobj.onUserReady();
            }
          }else if(thisobj.numguilds == 0){
            if(typeof thisobj.onGuildJoin == "function"){
              thisobj.onGuildJoin(Object.assign({}, message.d));
            }
          }
          break;
        case "GUILD_UPDATE":
          let gfue = new Map();
          for (const emote of message.d.emojis){
            thisobj.cache.emotes.set(emote.id, emote)
            let sorell = emote.name;
            if(gfue.has(sorell)){
              let byt = 1;
              while(vue.has(sorell)){
                sorell = emote.name+"~"+byt;
                byt++;
              }
            }
            gfue.set(sorell, emote);
          }
          message.d.emojis = gfue;
          thisobj.cache.guilds.set(message.d.id, {...thisobj.cache.guilds.get(message.d.id),...message.d});
          break;
        case "GUILD_DELETE":
          if(typeof thisobj.onGuildLeave == "function"){
            thisobj.onGuildLeave(Object.assign({"unavailable": message.d.unavailable}, cache.guilds.get(message.d.id)));
          }
          thisobj.cache.guilds.delete(message.d.id);
          break;
        case "CHANNEL_CREATE":
          thisobj.cache.channels.set(message.d.id, message.d);
          if(message.d.type != thisobj.channel.dm){
            thisobj.cache.guilds.get(message.d.guild_id).channels.push(message.d);
          }
          if(typeof thisobj.onChannelCreate == "function"){
            thisobj.onChannelCreate(Object.assign({}, message.d));
          }
          break;
        case "CHANNEL_UPDATE":
          thisobj.cache.channels.set(message.d.id, message.d);
          if(message.d.type != thisobj.channel.dm){
            const channels = thisobj.cache.guilds.get(message.d.guild_id).channels;
            for (const chan in channels){
              if(channels[chan].id == message.d.channel_id){
                thisobj.cache.guilds.get(message.d.guild_id).channels[chan] = message.d;
              }
            }
          }
          break;
        case "CHANNEL_DELETE":
          thisobj.cache.channels.delete(message.d.id);
          if(message.d.type != thisobj.channel.dm){
            const channels = thisobj.cache.guilds.get(message.d.guild_id).channels;
            for (const chan in channels){
              if(channels[chan].id == message.d.channel_id){
                thisobj.cache.guilds.get(message.d.guild_id).channels.splice(chan, 1);
              }
            }
          }
          if(typeof thisobj.onChannelDelete == "function"){
            thisobj.onChannelDelete(Object.assign({}, message.d));
          }
          break;
        case "WEBHOOK_UPDATE":
          if(typeof thisobj.onWebhookUpdate == "function"){
            thisobj.onWebhookUpdate(message.d);
          }
          break;
        case "GUILD_EMOJIS_UPDATE":
          for (const emoji of message.d.emojis){
            thisobj.cache.emotes.set(emoji.id, emoji);
          }
          if(typeof thisobj.onEmoteUpdate == "function"){
            thisobj.onEmoteUpdate(message.d);
          }
          break;
        case "MESSAGE_REACTION_ADD":
          if(typeof thisobj.onReactionAdd == "function"){
            thisobj.onReactionAdd(message.d);
          }
          break;
        case "INTERACTION_CREATE":
          if(typeof thisobj.onInteraction == "function"){
            thisobj.onInteraction(message.d);
          }
          if(typeof thisobj.onUserInteraction == "function"){
            thisobj.onUserInteraction(message.d);
          }
          break;
        case "GUILD_MEMBER_ADD":
          if(typeof thisobj.onGuildMemberJoin == "function"){
            thisobj.onGuildMemberJoin(message.d);
          }
          thisobj.cache.guilds.get(message.d.guild_id).member_count++;
          thisobj.cache.guilds.get(message.d.guild_id).members.set(message.d.user.id, message.d);
          break;
        case "GUILD_MEMBER_UPDATE":
          thisobj.cache.guilds.get(message.d.guild_id).members.set(message.d.user.id, message.d);
          break;
        case "GUILD_MEMBER_REMOVE":
          thisobj.cache.guilds.get(message.d.guild_id).member_count--;
          thisobj.cache.guilds.get(message.d.guild_id).members.delete(message.d.user.id);
          break;
        case "GUILD_ROLE_CREATE":
          thisobj.cache.guilds.get(message.d.guild_id).roles.set(message.d.role.id, message.d.role);
          break;
        case "GUILD_ROLE_UPDATE":
          thisobj.cache.guilds.get(message.d.guild_id).roles.set(message.d.role.id, message.d.role);
          break;
        case "GUILD_ROLE_DELETE":
          thisobj.cache.guilds.get(message.d.guild_id).roles.delete(message.d.role_id);
          break;
        default:
          break;
        }
        break;
      default:
        console.log(message.op + " idk");
        break;
      }
    };
  }
}
