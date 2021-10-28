902525759095185479

{
  "name": "setup",
  "type": 1,
  "description": "Setup yourself or another user",
  "options": [{
      "name": "name",
      "description": "This person's name",
      "type": 3,
      "required": true
    },{
      "name": "runs",
      "description": "Current amount of runs scored",
      "type": 4,
      "required": true
    },{
      "name": "wickets",
      "description": "Current amount of wickets taken",
      "type": 4,
      "required": true
    },{
      "name": "highscore",
      "description": "High score of all time",
      "type": 4,
      "required": true
    },{
      "name": "user",
      "description": "Which user do you want to setup (default you)?",
      "type": 6,
      "required": false
    }
  ]
  // "description": "Testing command" /guilds/738263333517394030
}

902521867397660684

{
  "name": "edit",
  "type": 1,
  "description": "Edit yourself or another user",
  "options": [{
      "name": "option",
      "description": "The option you want to edit",
      "type": 3,
      "required": true,
      "choices": [{
        "name": "name",
        "value": "name"
      },{
        "name": "runs",
        "value": "runs"
      },{
        "name": "wickets",
        "value": "wicks"
      },{
        "name": "highscore",
        "value": "high"
      }]
    },{
      "name": "value",
      "description": "The value you want to change it to",
      "type": 3,
      "required": true
    },{
      "name": "user",
      "description": "Which user do you want to setup (default you)?",
      "type": 6,
      "required": false
    }
  ]
  // "description": "Testing command" /guilds/738263333517394030
}

902526700141834270

{
  "name": "update",
  "type": 1,
  "description": "Update your new score from today's match",
  "options": [{
      "name": "runs",
      "description": "The runs you scored in this match",
      "type": 4,
      "required": true
    },{
      "name": "wickets",
      "description": "The wickets you scored in this match",
      "type": 4,
      "required": true
    },{
      "name": "user",
      "description": "Who do you want to update?",
      "type": 6,
      "required": false
    }
  ]
  // "description": "Testing command" /guilds/738263333517394030
}

902527014169346078

{
  "name": "profile",
  "type": 1,
  "description": "See anyone's profile",
  "options": [{
      "name": "user",
      "description": "Whose profile do you want to see?",
      "type": 6,
      "required": false
  }]
  // "description": "Testing command" /guilds/738263333517394030
}

902528329545052181

{
  "name": "runs",
  "type": 1,
  "description": "See the run rankings"
  // "description": "Testing command" /guilds/738263333517394030
}

902528582289608794

{
  "name": "wickets",
  "type": 1,
  "description": "See the wicket rankings"
  // "description": "Testing command" /guilds/738263333517394030
}

902890929629855744

{
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
}

902827422565675048

{
  "name": "reset",
  "type": 1,
  "description": "Remove/reset a users profile from this bot.",
  "options": [{
      "name": "user",
      "description": "Which user do you want to remove/reset?",
      "type": 6,
      "required": true
  }]
  // "description": "Testing command" /guilds/738263333517394030
}

902830832811667466

{
  "name": "highscores",
  "type": 1,
  "description": "Get the highscore leaderboard."
  // "description": "Testing command" /guilds/738263333517394030
}

903147048377933874

{
  "name": "jsonlog",
  "type": 1,
  "description": "Log the json storage"
  // "description": "Testing command" /guilds/738263333517394030
}
