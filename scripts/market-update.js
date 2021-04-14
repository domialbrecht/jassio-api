"use strict";

require("dotenv").config();
const sequelize = require("../db");
const config = require("../config");
const logger = require("../log");
const { Material, MaterialLog } = sequelize.models;
const MARKET = require("../custom_modules/marketplace");
const market = new MARKET.Market();
//Items to get scrape and market data for
const whitelist = require("./data/itemFetchWhitelist.json");

async function updateMaterials() {
  var t0 = new Date().getTime();
  //await Material.sync({ force: true });
  await MaterialLog.sync();
  for (const id of whitelist) {
    await createOrUpdateMaterial(id);
  }
  const used = process.memoryUsage().heapUsed / 1024 / 1024;
  logger.log(
    "info",
    `${new Date()} - The script uses approximately ${
      Math.round(used * 100) / 100
    } MB`
  );
  var t1 = new Date().getTime();
  logger.log(
    "info",
    `${new Date()} - Refresh item data done! It took ${
      (t1 - t0) / 1000 / 60
    } minutes at $`,
    new Date()
  );
}

async function createOrUpdateMaterial(id) {
  try {
    const material = await Material.findOne({ where: { id: id } });
    if (!material) {
      logger.log("error", `Material not found: ${id}`);
      return;
    }
    let market;
    let marketNA;
    if (id !== 752023) {
      market = await fetchMarketInfo(id, "EU");
      marketNA = await fetchMarketInfo(id, "NA");
    } else {
      //Special case for mass of pure magic
      let remnantsRiftMat = await await Material.findOne({
        where: { id: 43786 },
      });
      let blackSpiritClaws = await await Material.findOne({
        where: { id: 40258 },
      });
      const priceEU =
        (remnantsRiftMat.priceEU + 3 * blackSpiritClaws.priceEU) / 5;
      const priceNA =
        (remnantsRiftMat.priceNA + 3 * blackSpiritClaws.priceNA) / 5;
      market = {
        count: null,
        pricePerOne: priceEU,
        flooded: false,
        maxed: false,
      };
      marketNA = {
        count: null,
        pricePerOne: priceNA,
        flooded: false,
        maxed: false,
      };
    }
    await MaterialLog.create({
      countEntryNA: marketNA ? marketNA.count : null,
      countEntryEU: market ? market.count : null,
      MaterialId: id,
    });
    await material.update({
      priceNA: marketNA ? marketNA.pricePerOne : null,
      priceEU: market ? market.pricePerOne : null,
      countNA: marketNA ? marketNA.count : null,
      countEU: market ? market.count : null,
      floodedNA: marketNA ? marketNA.flooded : null,
      floodedEU: market ? market.flooded : null,
      maxedNA: marketNA ? marketNA.maxed : null,
      maxedEU: market ? market.maxed : null,
      updatedAt: new Date(),
    });
  } catch (error) {
    logger.log("error", error);
  }
}

async function fetchMarketInfo(id, region) {
  try {
    const marketPrice = await market.fetchItemStats(id, region).then((x) => x);
    return marketPrice;
  } catch (error) {
    logger.log("error", error);
  }
}

//updateMaterials();
setInterval(updateMaterials, 1000 * 60 * config.CACHE_LIFETIME_MIN);
