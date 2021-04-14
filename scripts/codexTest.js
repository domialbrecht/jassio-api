"use strict";

require("dotenv").config();
const config = require("../config");
const { Item } = require("../custom_modules/calpheonjs/dist");
const MARKET = require("../custom_modules/marketplace");
const market = new MARKET.Market();
const testID = 7303;

async function testMarket() {
  const mp = await market.fetchItemById(testID, "NA").then((x) => x[0]);
  console.log(mp);
}

async function testCodex() {
  const codexItem = await Item(testID);
  console.log(codexItem);
}

//testMarket();
testCodex();
