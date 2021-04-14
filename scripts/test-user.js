"use strict";

require("dotenv").config();
const sequelize = require("../db");
const { User, UserNode } = sequelize.models;

async function createUser() {
  try {
    await User.sync({ force: true });
    await User.create({
      sub: "google-oauth2|117323980375187460896",
      username: "iluwathar@gmail.com",
      name: "Test User",
    });
  } catch (error) {
    console.log(error);
  }
}

async function createUserNode() {
  try {
    const user = await User.findOne({
      where: { sub: "google-oauth2|117323980375187460896" },
    });
    await UserNode.sync({ force: true });
    const usernode = await UserNode.create({
      contribution: 2,
      movespeed: 9,
      workspeed: 140,
      lodging: "Heidel",
      nodeId: 14,
    });
    await user.addUserNode(usernode);
  } catch (error) {
    console.log(error);
  }
}

async function main() {
  var t0 = new Date().getTime();
  await User.sync({ force: true });
  await UserNode.sync({ force: true });
  //await createUser();
  //await createUserNode();
  await sequelize.close();
  var t1 = new Date().getTime();
  console.log(`Testusers done! It took ${(t1 - t0) / 1000} seconds`);
}

//This script should be used local, then copy database
main();
