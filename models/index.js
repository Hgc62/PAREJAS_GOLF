const path = require('path');

// Load ORM
const Sequelize = require('sequelize');


// Environment variable to define the URL of the data base to use.
// To use SQLite data base:
//    DATABASE_URL = sqlite:colec_euros.sqlite
// To use  Heroku Postgres data base:
//    DATABASE_URL = postgres://user:passwd@host:port/database

const url = process.env.DATABASE_URL || "sqlite:torneo_golf.sqlite";

const sequelize = new Sequelize(url);

// Import la definición de la tabla Parejas  de pareja.js
const Pareja = require(path.join(__dirname, 'pareja'))(sequelize, Sequelize);

// Import la definición de la tabla Resutado_pareja  de resultado_pareja.js
const Resultado_pareja = require(path.join(__dirname, 'resultado_pareja'))(sequelize, Sequelize);

// Import la definición de la tabla Jugadores  de jugador.js
const Jugador = require(path.join(__dirname, 'jugador'))(sequelize, Sequelize);

// Import la definición de la tabla Resutado  de resultado.js
const Resultado = require(path.join(__dirname, 'resultado'))(sequelize, Sequelize);

//Relaciones con la tabla Resultado

Resultado.belongsTo(Jugador, {
  as: "golfista",
  foreignKey: "golfistaId",
  onDelete: "CASCADE"
});
Jugador.hasMany(Resultado, {
  as: "partidas",
  foreignKey: "golfistaId",
});

//Relaciones con la tabla Resultado_pareja

Resultado_pareja.belongsTo(Pareja, {
  as: "pareja_golfista",
  foreignKey: "pareja_golfistaId",
  onDelete: "CASCADE"
});
Pareja.hasMany(Resultado_pareja, {
  as: "pareja_partidas",
  foreignKey: "pareja_golfistaId",
});

module.exports = sequelize;
