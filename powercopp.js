const Newcopp = require('./newcopp.js');
const path = require('path');
const fs = require('fs');
module.exports = {
  Command: class {
    constructor(param){
      this.name = param.name;
      this.aliases = param.aliases;
      this.desc = param.description;
      this.args = param.args;/*[
        {
          "name": ,
          "type": one of text, number, user, role,
          "description": what should the bot ask for,
          "optional"
        }
      ]
      */
      this.usage = param.usage;
      this.group = param.group;
      this.cool = param.cooldown||param.cool;
      this.perms = param.permissions;
      this.uperms = param.user;
      this.oo = param.owner_only;
      this.go = param.guild_only; // if true, does not work in DMs
      this.mesglist = param.mesglist;
      this.slash = param.slash;
    }
    run(mesg, client){
    }
    static type(){
      return "command";
    }
    cooldown(time, client){
    }
  },
  Interaction: class {
    constructor(param){
      this.id = param.id;
      this.cool = param.cooldown;
      this.perms = param.permissions;
      this.uperms = param.user;
      this.oo = param.owner_only;
      this.go = param.guild_only;
    }
    static type(){
      return "button";
    }
    run(mesg, client){
    }
    cooldown(time, client){
    }
  },
  Menu: class {
    constructor(param){
      this.id = param.id;
      this.cool = param.cooldown;
      this.perms = param.permissions;
      this.uperms = param.user;
      this.oo = param.owner_only;
      this.go = param.guild_only;
    }
    static type(){
      return "menu";
    }
    run(mesg, client){
    }
    cooldown(time, client){
    }
  },
  Client: class extends Newcopp {
    constructor(pobj){
      super();
      this.prefix = pobj.prefix;
      if(typeof pobj.owners == "string"){
        pobj.owners = [pobj.owners];
      }else if(!pobj.owners){
        pobj.owners = [];
      }
      this.owner = pobj.owners;
      this.help = pobj.help;
      this.commands = new Map();
      this.buttons = new Map();
      this.menus = new Map();
      this.slash = new Map();
      this.comdir = pobj.dirs;
      this.groups = pobj.groups; // {"name": "description", ...}
    }
    login(p_token){
      for (const folder of this.comdir) {
        const commandFiles = fs.readdirSync(`./${folder}`).filter(file => file.endsWith(".js")&&!file.endsWith(".t.js"));
        for (const file of commandFiles) {
          const Command = require(`./${folder}/${file}`);
          const objg = new Command();
          if(Command.type()=="command"){
            this.commands.set(objg.name, objg);
            if(objg.slash)
              this.slash.set(objg.name, objg);
          }else if(Command.type()=="button")
            this.buttons.set(objg.id, objg);
          else if(Command.type()=="menu")
            this.menus.set(objg.id, objg);
        }
      }
      let groups = [];
      this.commands.forEach(command => {
        if(command.group == "command"){
          throw "Command group cannot be called 'command'. From command "+command.name;
        }
        if(!command.group){
          return;
        }
        let iny = false;
        for(const group of this.groups){
          if(group.name == command.group){
            iny = true;
            break;
          }
        }
        if(!iny){
          throw "Unregistered group. From command "+command.name;
        }
        if(!groups.includes(command.group)){
          groups.push(command.group);
        }
      }, this);
      let help1fields = [];
      let components = {
        type: 3,
        custom_id: "helpmenu",
        placeholder: "Smart help menu",
        options: [],
        min_values: 1,
        max_values: 1
      };
      for (const type of groups){
        help1fields[help1fields.length] = {
          "name": type,
          "value": `\nUse \`${this.prefix}${this.help} ${type}\`\n for more info.`,
          "inline": true,
        };
        components.options.push({
          label: type,
          value: type,
          description: `Get info on ${type} commands`
        });
      }
      let help1mesg = {embed: {
        "title": "Command Types",
        "color": 88000,
        "fields": help1fields,
        "footer": {
          "text": "Some commands are available as SLASH commands. Type '/' to see them."
        }
      },
      "components": [{
        type: 1,
        components: [components]
      }]};
      let cooldowns = new Map();
      let icooldowns = new Map();
      // this.onReady = async function(){
      //   // const fg = JSON.parse(await this.getCommands("738263333517394030"));
      //   // for(const tang of fg){
      //   //
      //   //   if(["buy", "sell", "shop", "withdraw"].includes(tang.name))
      //   //     this.deleteCommand(tang.id, "738263333517394030");
      //   // }
      //   for(let objg of this.slash){
      //     objg = objg[1];
      //     if(!(["mine", "minelist"].includes(objg.name))){
      //       console.log("mep");
      //       continue;
      //     }
      //     let inter = {"name": undefined, "description": undefined,"options": []};
      //     inter.name = objg.name;
      //     inter.description = objg.desc||"None";
      //     if(objg.args){
      //       for(const arg of objg.args){
      //         const toips = {
      //           "number": 4,
      //           "string": 3,
      //           "user": 6,
      //           "channel": 7,
      //           "role": 8
      //         }
      //         let required;
      //         if(arg.optional == undefined){
      //           required = true;
      //         }else{
      //           required = arg.optional;
      //         }
      //         inter.options.push({
      //           "name": arg.name,
      //           "description": arg.description||"None",
      //           "type": toips[arg.type],
      //           "required": required
      //         })
      //       }
      //     }
      //     console.log(objg.name);
      //     let hg = await this.postCommand(inter, "738263333517394030");
      //     console.log(JSON.parse(hg));
      //     // console.log(inter);
      //   }
      // }
      this.onMesg = async function(message){
        if((!(message.content.trim().startsWith(this.prefix))) || message.author.bot){ return; }
        const word = message.content.toLowerCase().trim().slice(this.prefix.length).trim();
        const words = word.split(/ +/);
        const isowner = this.owner.includes(message.author.id);
        // help messages
        if(words[0] == this.help){
          if(!words[1]){
            return this.postMessage(message.channel_id, help1mesg);
          }else if(!words[2]){
            if(groups.includes(words[1])){
              let grfg = [];
              this.commands.forEach(function(jkj){
                // console.log(jkj);
                let lara = true;
                if(jkj.oo && !isowner){
                  lara = false;
                }
                if(jkj.group == words[1] && lara){
                  grfg.push(jkj.name);
                }
              });
              let embedmes = {
                embed: {
                  "title": `${words[1]}`,
                  "color": 8964363,
                  "description": `**\`${this.groups.find(con=>con.name==words[1]).description
                    }\`**\nType \`${this.prefix
                    }help command COMMAND_NAME\` for info on that command\n\`${
                      grfg.join("`, `")
                    }\``
                }
              };
              return this.postMessage(message.channel_id, embedmes);
            }else{
              return this.postMessage(message.channel_id, "You can use the help command like this:\n"+
              `\`${this.prefix}help\` gives a list of commmand categories\n`+
              `\`${this.prefix}help NAME_OF_GROUP\` gives info on a group and the commands in that group\n`+
              `\`${this.prefix}help command NAME_OF_COMMAND\` gives info on a specific command`)
            }
          }else if(words[1] == "command"){
            if(words[2]==undefined){
              return this.postMessage(message.channel_id, "What command do you want help with?");
            }
            let amsg = this.commands.get(words[2]);
            if(!amsg){
              for(const ietm of this.commands){
                if(ietm[1].aliases && ietm[1].aliases.includes(words[2])){
                  amsg = ietm[1];
                  break;
                }
              }
            }
            if(!amsg){
              return this.postMessage(message.channel_id, "That command doesn't exist!");
            }
            if(amsg.oo && !isowner){
              return this.postMessage(message.channel_id, "You are not authorized to view this command!");
            }
            const embedthing = {
              content: "hi",
              embed: {
                title: `The \`${amsg.name}\` command:`,
                color: "green",
                fields: [
                  {
                    name: "Aliases",
                    value: `${amsg.aliases?"`"+amsg.aliases.join("`, `")+"`":"None"}`,
                    inline: false
                  },
                  {
                    name: "Category",
                    value: amsg.group?`${amsg.group}: ${this.groups.find(b => b.name==amsg.group).description}`:`secret!: This command is a secret command!`,
                    inline: false
                  },
                  {
                    name: "Description",
                    value: `${amsg.desc}`,
                    inline: false
                  },
                  {
                    name: "Arguments",
                    value: `${amsg.usage?this.prefix+amsg.usage:"None"}`,
                    inline: false
                  },
                  {
                    name: "Cooldown",
                    value: `${amsg.cool?this.timeWizard(amsg.cool/1000):"None"}`,
                    inline: false
                  },
                  {
                    name: `${amsg.slash?"A":"Not a"}vailable as a slash command`,
                    value: `Slash commands are still in beta and may break.`,
                    inline: false
                  }
                ]
              }
            };
            return this.postMessage(message.channel_id, embedthing);
          }
        }
        //finding command
        let command = this.commands.get(words[0]);
        if(!command){
          for(const ietm of this.commands){
            if(ietm[1].aliases && ietm[1].aliases.includes(words[0])){
              command = ietm[1];
              break;
            }
          }
        }
        if(!command){
          return; // command does not exist
        }
        //done finding command
        if(command.oo && !isowner){ // check for owner only command
          return this.postMessage(message.channel_id, "You are not authorized to use this command.");
        }
        if(command.go && this.cache.channels.get(message.channel_id).type == this.channel.dm){ // check for guild only commands
          return this.postMessage(message.channel_id, "You cannot use this command in a DM.");
        }
        if(command.perms){ // check if bot has right permissions
          let shoob;
          const trash = this.cache.channels.get(message.channel_id).type == this.channel.dm;
          if(trash){
            shoob = ["ADD_REACTIONS", "STREAM", "VIEW_CHANNEL",
            "SEND_MESSAGES", "SEND_TTS_MESSAGES", "EMBED_LINKS", "ATTACH_FILES",
            "READ_MESSAGE_HISTORY", "USE_EXTERNAL_EMOJIS", "CONNECT", "SPEAK"];
          }else{
            shoob = this.permissionWizard(this.user.id, message.guild_id, message.channel_id);
          }
          if(shoob != "ALL" && !command.perms.every(fgd => shoob.includes(fgd))){
            if(shoob.includes("SEND_MESSAGES")){
              if(trash)
                this.postMessage(message.channel_id, "I cannot execute this command in a DM.");
              else
                this.postMessage(message.channel_id, `I cannot execute this command here. I need to have to permissions\``+
                  ` ${command.perms.join("`, `")}\`.`);
            }
            return;
          }
        }
        if(command.uperms && !isowner){
          let shoob;
          if(this.cache.channels.get(message.channel_id).type == this.channel.dm){
            shoob = ["ADD_REACTIONS", "STREAM", "VIEW_CHANNEL",
            "SEND_MESSAGES", "SEND_TTS_MESSAGES", "EMBED_LINKS", "ATTACH_FILES",
            "READ_MESSAGE_HISTORY", "USE_EXTERNAL_EMOJIS", "CONNECT", "SPEAK"];
          }else{
            shoob = this.permissionWizard(message.author.id, message.guild_id, message.channel_id);
          }
          let unhave = [];
          if(typeof shoob != "string"){
            for(const cmd of command.uperms){
              if(!shoob.includes(cmd)){
                unhave.push(cmd);
              }
            }
          }
          if(shoob != "ALL" && unhave.length){
            return this.postMessage(message.channel_id, "You don't have to required permissions. "+
            "The permissions required to use this command are `"+command.uperms.join("`, `")+"`."+
            "You need the permissions `"+unhave.join("`, `")+"`.");
          }
        }
        // checked both bot and user permissions
        // time to do the cooldown stuff
        if(command.cool && !cooldowns.has(command.name)){
      		cooldowns.set(command.name, new Map());
      	}
      	const timeFC = cooldowns.get(command.name);
        let timeoutvar;
      	if(timeFC && !isowner){
      	  const now = Date.now();
      		if(timeFC.has(message.author.id)){
      			const expTime = timeFC.get(message.author.id);
      			const timeps = (command.cool-(now-expTime))/1000;
      			let fembed = { // make sure to implement the running of
              // the commands cooldown function instead of this
              // if there is a cooldown function for the command
      				"title": "Slow down!",
      				"color": 352417,
      				"description": `You have to wait to use this command again. Try again in \`${this.timeWizard(timeps)}\``+
                `.\n The default cool`+
      					`down is \`${this.timeWizard(command.cool/1000)}\`.`
      			};
      			return this.postMessage(message.channel_id, {content:`<@${message.author.id}>`,embed: fembed});
      		}else{
      			timeFC.set(message.author.id, now);
      			timeoutvar = setTimeout(function(){
              timeFC.delete(message.author.id);
            }, command.cool);
      		}
      	}
        // done with cool down stuff
        // splitting the args
        let fargs = {};
        let mesglizt = [message];
        if(command.args){
          let index;
          let bfr = message.content.slice(this.prefix.length).trim();
          let br = bfr;
          for(const arg in command.args){
            const agu = command.args[arg];
            let blipa = br.indexOf(" ");
            let eoru=0;
            let res;
            let waiwi = false;
            if(blipa!=-1){
              br = br.substring(blipa);
              blipa = 1;
              while(eoru==0){
                br = br.substring(blipa);
                eoru = br.indexOf(" ");
              }
              if(eoru!= -1){
                res = br.substring(0, eoru);
              }else{
                res = br;
              }
            }else{
              waiwi = true;
              let descf;
              if(agu.optional){
                break;
              }
              if(agu.description){
                descf = agu.description+"\nThe command will cancel in 30 seconds or if you type `cancel`.";
              }else{
                descf = `What would you like arguament ${agu.name} of type ${agu.type} to be?`+
                "\nThe command will cancel in 30 seconds or if you type `cancel`."
              }
              mesglizt.push(JSON.parse(await this.postMessage(message.channel_id, descf)));
              res = await new Promise((resolve, reject)=>{
                this.collectMessage(message.channel_id,
                  resolve
                  ,{
                    time: 30000,
                    success: 1,
                    validator: msg=>msg.author.id==message.author.id
                  }
                ).then(val=>{
                  resolve(val);
                });
              });
              if(typeof res == "string"||res.content.toLowerCase()=="cancel"){
                this.postMessage(message.channel_id, `<@!${message.author.id}> command canceled`);
                return;
              }
              mesglizt.push(res);
              res = res.content;
            }
            let fghl;
            if(waiwi){
              fghl = "this";
            }else{
              if(arg == 0){
                fghl = "the 1st";
              }else if(arg == 1){
                fghl = "the 2nd";
              }else if(arg == 2){
                fghl = "the 3rd";
              }else{
                fghl = `the ${arg}th`;
              }
            }
            switch(agu.type){
            case "number":
              res = Number(res);
              if(isNaN(res)){
                if(!agu.optional)
                  return this.postMessage(message.channel_id, `<@!${message.author.id}>`+
                    ` command canceled as ${fghl} argument has to be a number.`);
                else
                  continue;
              }
              break;
            case "string":
              if(waiwi)break;
              if(arg == command.args.length-1){
                res = br;
              }
              break;
            case "user": //make it work in dms
              if(res.startsWith("<@") && res.endsWith(">")){
                if(message.guild_id){
                  if(this.cache.guilds.get(message.guild_id).members.has(res.slice(2, -1))){
                    res = this.cache.guilds.get(message.guild_id).members.get(res.slice(2, -1));
                  }else if(this.cache.guilds.get(message.guild_id).members.has(res.slice(3, -1))&&res[2]=="!"){
                    res = this.cache.guilds.get(message.guild_id).members.get(res.slice(3, -1));
                  }else{
                    return this.postMessage(message.channel_id, `<@!${message.author.id}>`+
                      ` command canceled as ${fghl} argument has to be a user(@mention).`);
                  }
                }else{ // this is in a channel
                  if(message.channel.recipients[res.slice(2, -1)]){
                    res = message.channel.recipients[res.slice(2, -1)];
                  }else if(message.channel.recipients[res.slice(3, -1)]&&res[2]=="!"){
                    res = message.channel.recipients[res.slice(3, -1)];
                  }else{
                    return this.postMessage(message.channel_id, `<@!${message.author.id}>`+
                      ` command canceled as ${fghl} argument has to be a user(@mention).`);
                  }
                }
              }else{
                return this.postMessage(message.channel_id, `<@!${message.author.id}>`+
                  ` command canceled as ${fghl} argument has to be a user(@mention).`);
              }
              break;
            case "role":
              if(!message.guild_id)return;
              if(res.startsWith("<@&") && res.endsWith(">")){
                if(this.cache.guilds.get(message.guild_id).roles.has(res.slice(3, -1))){
                  res = this.cache.guilds.get(message.guild_id).roles.get(res.slice(3, -1));
                }else{
                  return this.postMessage(message.channel_id, `<@!${message.author.id}>`+
                    ` command canceled as ${fghl} argument has to be a role(@mention).`);
                }
              }else{
                return this.postMessage(message.channel_id, `<@!${message.author.id}>`+
                  ` command canceled as ${fghl} argument has to be a role(@mention).`);
              }
              break;
            case "channel":
              if(!message.guild_id)return;
              if(res.startsWith("<#") && res.endsWith(">")){
                if(this.cache.guilds.get(message.guild_id).roles.has(res.slice(2, -1))){
                  res = this.cache.channels.get(res.slice(2, -1));
                }else{
                  return this.postMessage(message.channel_id, `<@!${message.author.id}>`+
                    ` command canceled as ${fghl} argument has to be a channel(#mention).`);
                }
              }else{
                return this.postMessage(message.channel_id, `<@!${message.author.id}>`+
                  ` command canceled as ${fghl} argument has to be a channel(#mention).`);
              }
              break;
            }
            if(agu.validator){
              let kymb = agu.validator(res, fghl);
              if(!(kymb===true)){
                let bazo = `Command canceled as ${fghl} argument is invalid.`;
                if(typeof kymb == "string")bazo = kymb;
                return this.postMessage(message.channel_id, `<@!${message.author.id}> `+
                  bazo);
              }
            }
            fargs[agu.name] = res;
          }
        }
        // done splitting args
        // finally! its time to run the command
        const thisobj = this;
        message.send = function(message){
          thisobj.postMessage(this.channel_id, message);
        }
        try{
          let finres;
          let bktlryt = message;
          if(command.mesglist){
            bktlryt = mesglizt;
          }
          if(command.args){
            finres = command.run(bktlryt, this, fargs);
          }else{
            finres = command.run(bktlryt, this);
          }
          if(!isowner&&timeoutvar&&(finres == false)){
            clearTimeout(timeoutvar);
            timeFC.delete(message.author.id);
          }
        }catch(err){
          console.error(err);
          this.postMessage(message.channel_id, "ERROR: Something went wrong... we'll try to fix it as soon as possible. Sorry for the inconvenience.")
        }
      }

      this.onInteraction = function(inter){
        const message = inter.message;
        const member = inter.member;
        let user;
        if(member){
          user = member.user;
        }else{
          user = inter.user;
        }
        const isowner = this.owner.includes(user.id);
        //finding command
        let command;
        let comtype;
        if(inter.type==3){
          if(inter.data.component_type == 2){
            command = this.buttons.get(inter.data.custom_id);
            comtype = "button";
          }else if(inter.data.component_type == 3){
            command = this.menus.get(inter.data.custom_id);
            comtype = "menu";
          }
        }else{
          const thisobj = this;
          inter.used = false;
          let command = this.slash.get(inter.data.name);
          if(!command){
            return; // command does not exist
          }
          //done finding command
          if(command.oo && !isowner){ // check for owner only command
            return this.postInteraction(inter, "reply", "You are not authorized to use this command.");
          }
          if(command.go && this.cache.channels.get(inter.channel_id).type == this.channel.dm){ // check for guild only commands
            return this.postInteraction(inter, "reply", "You cannot use this command in a DM.");
          }
          if(command.perms){ // check if bot has right permissions
            let shoob;
            const trash = this.cache.channels.get(inter.channel_id).type == this.channel.dm;
            if(trash){
              shoob = ["ADD_REACTIONS", "STREAM", "VIEW_CHANNEL",
              "SEND_MESSAGES", "SEND_TTS_MESSAGES", "EMBED_LINKS", "ATTACH_FILES",
              "READ_MESSAGE_HISTORY", "USE_EXTERNAL_EMOJIS", "CONNECT", "SPEAK"];
            }else{
              shoob = this.permissionWizard(this.user.id, inter.guild_id, inter.channel_id);
            }
            if(shoob != "ALL" && !command.perms.every(fgd => shoob.includes(fgd))){
              // return console.log("unallowed");
              if(shoob.includes("SEND_MESSAGES")){
                if(trash)
                  return this.postInteraction(inter, "reply", "I cannot execute this command in a DM.");
                else
                  return this.postInteraction(inter, "reply", `I cannot execute t`+
                    `his command here. I need to have to permissions\``+
                    ` ${command.perms.join("`, `")}\`.`);
              }
              return;
            }
          }
          if(command.uperms && !isowner){
            let shoob;
            if(this.cache.channels.get(inter.channel_id).type == this.channel.dm){
              shoob = ["ADD_REACTIONS", "STREAM", "VIEW_CHANNEL",
              "SEND_MESSAGES", "SEND_TTS_MESSAGES", "EMBED_LINKS", "ATTACH_FILES",
              "READ_MESSAGE_HISTORY", "USE_EXTERNAL_EMOJIS", "CONNECT", "SPEAK"];
            }else{
              shoob = this.permissionWizard(inter.member.user.id, inter.guild_id, inter.channel_id);
            }
            let unhave = [];
            if(typeof shoob != "string"){
              for(const cmd of command.uperms){
                if(!shoob.includes(cmd)){
                  unhave.push(cmd);
                }
              }
            }
            if(shoob != "ALL" && unhave.length){
              return this.postInteraction(inter, "reply", "You don't have to required permissions. "+
              "The permissions required to use this command are `"+command.uperms.join("`, `")+"`."+
              "You need the permissions `"+unhave.join("`, `")+"`.");
            }
          }
          // checked both bot and user permissions

          // time to do the cooldown stuff
          if(command.cool && !cooldowns.has(command.name)){
        		cooldowns.set(command.name, new Map());
        	}
        	const timeFC = cooldowns.get(command.name);
          let timeoutvar;
        	if(timeFC && !isowner){
        	  const now = Date.now();
        		if(timeFC.has(inter.member.user.id)){
        			const expTime = timeFC.get(inter.member.user.id);
        			const timeps = (command.cool-(now-expTime))/1000;
        			let fembed = { // make sure to implement the running of
                // the commands cooldown function instead of this
                // if there is a cooldown function for the command
        				"title": "Slow down!",
        				"color": 352417,
        				"description": `You have to wait to use this command again. Try again in \`${this.timeWizard(timeps)}\``+
                  `.\n The default cool`+
        					`down is \`${this.timeWizard(command.cool/1000)}\`.`
        			};
        			return this.postInteraction(inter, "reply", {content:`<@${inter.member.user.id}>`,embed: fembed});
        		}else{
        			timeFC.set(inter.member.user.id, now);
        			timeoutvar = setTimeout(function(){
                timeFC.delete(inter.member.user.id);
              }, command.cool);
        		}
        	}
          inter.author = inter.member.user;
          inter.send = function(message){
            if(this.used)
              thisobj.postNewInteraction(this, message);
            else
              thisobj.postInteraction(this, "reply", message);
          }
          try{
            let finres;
            if(command.args){
              let fargs = {};
              let fghl;
              for(const mrfg in inter.data.options){
                let rfg = inter.data.options[mrfg];
                let agu = command.args.filter(fgt=>fgt.name==rfg.name)[0];
                if(rfg.type == 6)
                  rfg.value = this.cache.guilds.get(inter.guild_id).members.get(rfg.value);
                else if(rfg.type == 7)
                  rfg.value = this.cache.channels.get(rfg.value);
                else if(rfg.type == 8)
                  rfg.value = this.cache.guilds.get(inter.guild_id).roles.get(rfg.value);
                fargs[rfg.name] = rfg.value;
                fghl = `\`${rfg.name}\``;
                if(agu.validator){
                  let kymb = agu.validator(rfg.value, fghl);
                  if(!(kymb===true)){
                    let bazo = `Command canceled as ${fghl} argument is invalid.`;
                    if(typeof kymb == "string")bazo = kymb;
                    return this.postMessage(message.channel_id, `<@!${message.author.id}> `+
                      bazo);
                  }
                }
              }
              finres = command.run(inter, this, fargs);
            }else{
              finres = command.run(inter, this);
            }
            if(!isowner&&timeoutvar&&(finres == false)){
              clearTimeout(timeoutvar);
              timeFC.delete(message.author.id);
            }
          }catch(err){
            console.error(err);
            return this.postInteraction(inter, "reply", "ERROR: Something went wrong... we'll try to fix it as soon as possible. Sorry for the inconvenience.")
          }
          return;
        }
        if(!command){
          if(inter.data.custom_id == "helpmenu"){
            if(groups.includes(inter.data.values[0])){
              let grfg = [];
              this.commands.forEach(function(jkj){
                // console.log(jkj);
                let lara = true;
                if(jkj.oo && !isowner){
                  lara = false;
                }
                if(jkj.group == inter.data.values[0] && lara){
                  grfg.push(jkj.name);
                }
              });
              let embedmes = {
                embed: {
                  "title": `${inter.data.values[0]}`,
                  "color": 8964363,
                  "description": `**\`${this.groups.find(con=>con.name==inter.data.values[0]).description
                    }\`**\nType \`${this.prefix
                    }help command COMMAND_NAME\` for info on that command\n\`${
                      grfg.join("`, `")
                    }\``
                },
                flags: 1<<6
              };
              return this.postInteraction(inter, "reply", embedmes);
            }else{
              return this.postInteraction(inter, "reply", {content: "You can use the help command like this:\n"+
              `\`${this.prefix}help\` gives a list of commmand categories\n`+
              `\`${this.prefix}help NAME_OF_GROUP\` gives info on a group and the commands in that group\n`+
              `\`${this.prefix}help command NAME_OF_COMMAND\` gives info on a specific command`,
              flags: 1<<6})
            }
          }
          return; // command does not exist
        }
        //done finding command
        if(command.oo && !isowner){ // check for owner only command
          return this.postInteraction(inter, "reply", `<@!${member.user.id}>, you are not authorized to use this ${comtype}.`);
        }
        if(command.go && this.cache.channels.get(message.channel_id).type == this.channel.dm){ // check for guild only commands
          return this.postInteraction(inter, "reply", `You cannot use this ${comtype} in dms.`);
        }
        if(command.perms){ // check if bot has right permissions
          let shoob;
          if(this.cache.channels.get(message.channel_id).type == this.channel.dm){
            shoob = ["ADD_REACTIONS", "STREAM", "VIEW_CHANNEL",
            "SEND_MESSAGES", "SEND_TTS_MESSAGES", "EMBED_LINKS", "ATTACH_FILES",
            "READ_MESSAGE_HISTORY", "USE_EXTERNAL_EMOJIS", "CONNECT", "SPEAK"];
          }else{
            shoob = this.permissionWizard(this.user.id, inter.guild_id, inter.channel_id);
          }
          if(shoob != "ALL" && !command.perms.every(fgd => shoob.includes(fgd))){
            return this.postInteraction(inter, "reply", `I cannot execute this interaction here. I need to have to permissions\``+
              ` ${command.perms.join("`, `")}\`.`);
            return;
          }
        }
        if(command.uperms && !isowner){
          let shoob;
          if(this.cache.channels.get(message.channel_id).type == this.channel.dm){
            shoob = ["ADD_REACTIONS", "STREAM", "VIEW_CHANNEL",
            "SEND_MESSAGES", "SEND_TTS_MESSAGES", "EMBED_LINKS", "ATTACH_FILES",
            "READ_MESSAGE_HISTORY", "USE_EXTERNAL_EMOJIS", "CONNECT", "SPEAK"];
          }else{
            shoob = this.permissionWizard(message.author.id, inter.guild_id, inter.channel_id);
          }
          let unhave = [];
          if(typeof shoob != "string"){
            for(const cmd of command.uperms){
              if(!shoob.includes(cmd)){
                unhave.push(cmd);
              }
            }
          }
          if(shoob != "ALL" && unhave.length){
            return this.postInteraction(inter, "reply", "You don't have to required permissions. "+
            `The permissions required to use this ${comtype} are \``+command.uperms.join("`, `")+"`."+
            "You need the permissions `"+unhave.join("`, `")+"`.");
          }
        }
        // checked both bot and user permissions

        // time to do the cooldown stuff
        if(command.cool && !cooldowns.has(command.id)){
      		cooldowns.set(command.id, new Map());
      	}
      	const timeFC = cooldowns.get(command.id);
        let timeoutvar;
      	if(timeFC && !isowner){
      	  const now = Date.now();
      		if(timeFC.has(message.author.id)){
      			const expTime = timeFC.get(message.author.id);
      			const timeps = (command.cool-(now-expTime))/1000;
      			let fembed = { // make sure to implement the running of
              // the commands cooldown function instead of this
              // if there is a cooldown function for the command
      				"title": "Slow down!",
      				"color": 352417,
      				"description": `You have to wait to use this ${comtype} again. Try again in \`${this.timeWizard(timeps)}\``+
                `.\n The default cool`+
      					`down is \`${this.timeWizard(command.cool/1000)}\`.`
      			};
            return this.postInteraction(inter, "edit", {embed: fembed});
            // return this.postMessage(message.channel_id, {content:`<@${user.id}>`,embed: fembed});
      		}else{
      			timeFC.set(message.author.id, now);
      			timeoutvar = setTimeout(function(){
              timeFC.delete(message.author.id);
            }, command.cool);
      		}
      	}
        // done with cool down stuff
        // splitting the args
        // done splitting args
        // finally! its time to run the command
        try{
          let finres = command.run(inter, this);
          if(!isowner&&timeoutvar&&(finres == false)){
            clearTimeout(timeoutvar);
            timeFC.delete(message.author.id);
          }
        }catch(err){
          console.error(err);
          this.postInteraction(inter, "reply",
            "ERROR: Something went wrong... we'll try to fix it as soon as possible. Sorry for the inconvenience.");
        }
      }

      this.connect(p_token);
    }
    message(func){
      this.onUserMesg = func;
    }
    ready(func){
      this.onUserReady = func;
    }
    guildJoin(func){
      this.onGuildJoin = func;
    }
    guildLeave(func){
      this.onGuildLeave = func;
    }
    guildMemberJoin(func){
      this.onGuildMemberJoin = func;
    }
    channelCreate(func){
      this.onChannelCreate = func;
    }
    channelDelete(func){
      this.onChannelDelete = func;
    }
    webhookUpdate(func){
      this.onWebhookUpdate = func;
    }
    emoteUpdate(func){
      this.onEmoteUpdate = func;
    }
    reactionAdd(func){
      this.onReactionAdd = func;
    }
    interaction(func){
      this.onUserInteraction = func;
    }
  }
}

/*
What tissue transports cell sap
What are safes generally used for
What helps transport between the leaf and stem
What tissue helps in storage and photosynthesis
Why are xylem and phloem complex tissues
*/

// gyanmudra memory concentration
// pranmudra immunity
// vayumudra aches and pains
// hakimimudra concentration focus
