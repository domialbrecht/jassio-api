"use strict";

require("dotenv").config();
const sequelize = require("../db");
const {
  Node,
  NodeMaterial,
  Group,
  Recipe,
  Material,
  RecipeIngredient,
  RecipeProduct,
} = sequelize.models;
const nodeList = require("./data/nodeList.json");
const nodeGroups = require("./data/defaultGroups.json");
const groupList = require("./data/itemGroups.json");
const recipeList = require("./data/recipesList.json");
const groupMap = new Map(nodeGroups);

async function setNodes() {
  //Use this script only in dev!
  await Node.sync({ force: true });
  await NodeMaterial.sync({ force: true });
  await Promise.all(
    nodeList.map(async (node, index) => {
      //Index + 1, database cant have 0 as PK
      await createNode(node, index + 1);
    })
  );
}

async function createNode(node, index) {
  try {
    await Node.create({
      id: index,
      name: node.name,
      image: node.image,
      contribution: node.cp,
      cpAdd: node.cpAdd,
      workload: node.workload,
      workspeed: 0,
      movespeed: 0,
      luck: 0,
      distances: JSON.stringify(node.distance),
      lodging: node.lodging,
      region: node.region,
      group:
        groupMap.has(index) && groupMap.get(index)
          ? groupMap
              .get(index)
              .replace(
                /(\s*?{\s*?|\s*?,\s*?)(['"])?([a-zA-Z0-9]+)(['"])?:/g,
                '$1"$3":'
              )
          : null,
    });
    for (const material of node.material) {
      try {
        await NodeMaterial.create({
          NodeId: index,
          MaterialId: material.id,
          yield: material.yield,
          luck: material.luck,
        });
      } catch (e) {
        console.log(e);
        console.log(node);
        console.log(`Missing material ${material.id}`);
      }
    }
  } catch (error) {
    console.log(node);
    console.log(error);
  }
}

async function setGroups() {
  //Use this script only in dev!
  await Group.sync({ force: true });
  await Promise.all(
    groupList.map(async (group) => {
      await createGroup(group);
    })
  );
}

async function createGroup(group) {
  try {
    await Group.create({
      id: parseInt(group.id),
      name: group.name,
    });
    for (const i of group.items) {
      const material = await Material.findOne({ where: { id: i.id } });
      if (material) {
        material.GroupId = parseInt(group.id);
        await material.save();
      }
    }
  } catch (error) {
    console.log(error);
  }
}

async function setRecipes() {
  //Use this script only in dev!
  await Recipe.sync({ force: true });
  await RecipeIngredient.sync({ force: true });
  await RecipeProduct.sync({ force: true });
  await Promise.all(
    recipeList.map(async (recipe) => {
      //Index + 1, database cant have 0 as PK
      await createRecipe(recipe);
    })
  );
}

async function createRecipe(recipe) {
  try {
    await Recipe.create({
      id: parseInt(recipe.id),
      name: recipe.name,
      image: recipe.image,
      level: recipe.level,
      exp: recipe.exp,
    });
    for (const material of recipe.materials) {
      await RecipeIngredient.create({
        RecipeId: parseInt(recipe.id),
        MaterialId: material.group ? null : parseInt(material.id),
        GroupId: material.group ? parseInt(material.id) : null,
        quantity: material.quantity,
      });
    }
    for (const product of recipe.products) {
      await RecipeProduct.create({
        RecipeId: parseInt(recipe.id),
        MaterialId: parseInt(product.id),
      });
    }
  } catch (error) {
    console.log(error);
  }
}

async function main() {
  var t0 = new Date().getTime();
  await setNodes();
  await setGroups();
  await setRecipes();
  await sequelize.close();
  var t1 = new Date().getTime();
  console.log(`Initial import done! It took ${(t1 - t0) / 1000} seconds`);
}

//This script should be used local, then copy database
if (process.env.NODE_ENV != "production") {
  main();
}
