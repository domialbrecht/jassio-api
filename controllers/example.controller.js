//const { <MODEL> } = sequelize.models;

async function getAll(req, res) {
  //Enable for cache testing
  /*const res = await <MODEL>.findAll({});*/
  res.status(200);
}

module.exports = {
  getAll,
};
