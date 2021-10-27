const { Client, Intents } = require('discord.js');

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
});

client.on('message', (mesg) => {
  if(mesg.author.bot||mesg.channel.type!="dm")return;
  // mesg.channel.send(mesg.content);
  let bruh = "";
  let yas = true;
  for(let i = 0; i < mesg.content.length; i++){
    let broko = mesg.content[i]
    if(broko.toUpperCase() != broko.toLowerCase()){
      if(yas)
        broko = broko.toLowerCase()
      else
        broko = broko.toUpperCase()
      yas = !yas;
    }
    bruh += broko;
  }
  mesg.channel.send(`"${bruh}":clown:\nwhat a frickin clown`);
})

// Login to Discord with your client's token
client.login("OTAyNDcwNTQ5NzczNjMxNDg4.YXe5Mg.f7xYyT0LEpaMWFlOul2PKliZwbo");
