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
let jokeId = "";

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
      const joke = await getJoke();
      console.log(joke)
      this.ask(joke.setup + ' ' + joke.delivery + '. Would you like to hear another joke?')
    }
});

async function getJoke() {
  const headers = {
    "x-rapidapi-host": process.env.HOST_URL,
    "x-rapidapi-key": process.env.RAPIDAPI_KEY
  };
  const joke = await axios.get(process.env.API_URL, { headers });
  return joke.data;
}


module.exports.app = app;
