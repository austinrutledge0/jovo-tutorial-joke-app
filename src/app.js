"use strict";

// ------------------------------------------------------------------
// APP INITIALIZATION
// ------------------------------------------------------------------
require("dotenv").config();
const { App } = require("jovo-framework");
const { Alexa } = require("jovo-platform-alexa");
const { GoogleAssistant } = require("jovo-platform-googleassistant");
const { JovoDebugger } = require("jovo-plugin-debugger");
const { FileDb } = require("jovo-db-filedb");
const axios = require("axios");

const app = new App();

app.use(new Alexa(), new GoogleAssistant(), new JovoDebugger(), new FileDb());

// ------------------------------------------------------------------
// APP LOGIC
// ------------------------------------------------------------------

app.setHandler({
  LAUNCH() {
    return this.toIntent("WouldYouLikeToHearAJokeIntent");
  },
    WouldYouLikeToHearAJokeIntent(){
      this.ask("Would you like to hear a joke?");
    },
    YesIntent() {
      return this.toIntent("TellMeAJokeIntent");
    },
    NoIntent() {
      this.tell("Okay, goodbye!");
    },
    async TellMeAJokeIntent() {
      const promptForAnotherJoke = ' Would you like to hear another joke?';
      const joke = await getJoke();
      if(joke.type === 'single')
      {
        this.ask(`${joke.joke} ${promptForAnotherJoke}`)
      }
      else if(joke.type === 'twopart')
      {  
        this.ask(`${joke.setup} ${joke.delivery} ${promptForAnotherJoke}`)
      }
      else
      {
        this.tell('ERROR: The joke API returned malformed data')
      }
    }
});

async function getJoke() {
  const headers = {
    "x-rapidapi-host": process.env.HOST_URL,
    "x-rapidapi-key": process.env.RAPIDAPI_KEY
  };
  const joke = await axios.get(process.env.API_URL, { headers }).catch(() => {
    this.tell('ERROR: The joke API returned an error')
  });
  return joke.data;
}


module.exports.app = app;
