"use strict";

require("dotenv").config();
const { Op } = require("sequelize");
const sequelize = require("../db");
const { RecipeIngredient } = sequelize.models;
const groupList = require("./data/itemGroups.json");

async function getUsedGroups() {
  try {
    const groups = await RecipeIngredient.findAll({
      where: {
        GroupId: { [Op.gt]: 0 },
      },
      attributes: ["GroupId"],
      order: [["GroupId", "DESC"]],
    });
    return groups;
  } catch (error) {
    console.log(error);
  }
}

async function main() {
  var t0 = new Date().getTime();
  const groups = await getUsedGroups();
  const test = groups.map((gr) => {
    return gr.dataValues.GroupId;
  });
  groupList.forEach((grp) => {
    if (test.includes(parseInt(grp.id))) {
      grp.items.forEach((x) => {
        console.log(x.id);
      });
    }
  });
  await sequelize.close();
  var t1 = new Date().getTime();
  console.log(`Gear done! It took ${(t1 - t0) / 1000} seconds`);
}

//This script should be used local, then copy database
if (process.env.NODE_ENV != "production") {
  main();
}
