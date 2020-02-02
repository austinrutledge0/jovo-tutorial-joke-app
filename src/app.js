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
    return this.toStateIntent("StartState", "TellMeAJokeIntent");
  },
  StartState: {
    async TellMeAJokeIntent() {
      const joke = await getJoke();
      jokeId = joke.id;
      this.ask(joke.content + " Would you like to rate the joke?");
    },
    YesIntent() {
      return this.toStateIntent("RateJokeState", "AskWhichRatingIntent");
    },
    NoIntent() {
      this.tell("Okay, goodbye");
    }
  },
  RateJokeState: {
    async AskWhichRatingIntent() {
      this.ask("Would you like to rate the joke as thumbs up or thumbs down?");
    },
    async ThumbsUpIntent() {
      const rating = await rateJoke(true, jokeId);
      if (rating) {
        this.tell("The joke was rated thumbs up, thank you for your rating");
      } else {
        this.tell("The joke could not be rated");
      }
    },
    async ThumbsDownIntent() {
      const rating = await rateJoke(false, jokeId);
      if (rating) {
        this.tell("The joke was rated thumbs down, thank you for your rating");
      } else {
        this.tell("The joke could not be rated");
      }
    }
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
async function rateJoke(isThumbsUp, jokeId) {
  let headers = {};
  let rating = "";

  headers = {
    "x-rapidapi-host": process.env.HOST_URL,
    "x-rapidapi-key": process.env.RAPIDAPI_KEY,
    "content-type": "application/x-www-form-urlencoded"
  };
  if (isThumbsUp) {
    rating = await axios.post(
      `${process.env.API_URL}/${jokeId}/upvote`,
      {},
      { headers }
    );
  } else {
    rating = await axios.post(
      `${process.env.API_URL}/${jokeId}/downvote`,
      {},
      { headers }
    );
  }
  if (rating) {
    return true;
  } else {
    return false;
  }
}

module.exports.app = app;
