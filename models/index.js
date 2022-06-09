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


/*
Coleccion.belongsTo(Usuario, {
  as: "coleccionista",
  foreignKey: "coleccionistaId",
  onDelete: "CASCADE"
});
Usuario.hasMany(Coleccion, {
  as: "monedasCol",
  foreignKey: "coleccionistaId",
});

Coleccion.belongsTo(Paises, {
  as: "pais",
  foreignKey: "paisId",
  onDelete: "CASCADE"
});

Paises.hasMany(Coleccion, {
    as: "paisCol",
    foreignKey: "paisId",
  });
*/
module.exports = sequelize;
