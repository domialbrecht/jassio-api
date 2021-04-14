"use strict";

require("dotenv").config();
const sequelize = require("../db");
const { Token } = sequelize.models;

async function createToken() {
  try {
    await Token.sync({ force: true });
  } catch (error) {
    console.log(error);
  }
}

async function main() {
  var t0 = new Date().getTime();
  await createToken();
  await sequelize.close();
  var t1 = new Date().getTime();
  console.log(`Token done! It took ${(t1 - t0) / 1000} seconds`);
}

//This script should be used local, then copy database
if (process.env.NODE_ENV != "production") {
  main();
}
