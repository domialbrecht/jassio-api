"use strict";

const sequelize = require("../db");
const { Gear } = sequelize.models;

async function createGear() {
  try {
    await Gear.sync({ force: true });
    await Gear.bulkCreate([
      { name: "Weapon", stacks: "192", attempts: "23" },
      { name: "Offhand", stacks: "210", attempts: "15" },
      { name: "Awaken", stacks: "192", attempts: "23" },
      { name: "Helmet", stacks: "210", attempts: "15" },
      { name: "Armor", stacks: "192", attempts: "23" },
      { name: "Gloves", stacks: "210", attempts: "15" },
      { name: "Boots", stacks: "192", attempts: "23" },
      { name: "Pen Weapon Attempts", value: "1/23" },
      { name: "Pen Armor Attempts", value: "4/46" },
      { name: "TET Accessory Attempts", value: "1/23" },
      { name: "Combat Gear Value", value: "150 Billion" },
      { name: "Lifeskill Gear Value", value: "30 Billion" },
      { name: "Storage Value", value: "15 Billion" },
      { name: "Horse Value", value: "12 Billion" },
      { name: "Net Worth", value: "207 Billion" },
    ]);
  } catch (error) {
    console.log(error);
  }
}

async function main() {
  var t0 = new Date().getTime();
  await createGear();
  await sequelize.close();
  var t1 = new Date().getTime();
  console.log(`Gear done! It took ${(t1 - t0) / 1000} seconds`);
}

//This script should be used local, then copy database
if (process.env.NODE_ENV != "production") {
  main();
}
