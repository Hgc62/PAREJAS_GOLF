"use strict";

module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert("Jugador", [
      {
        jugador: "Isi",
        puntuacion: 0,
        handicap: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        jugador: "MA",
        puntuacion: 0,
        handicap: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        jugador: "Agus",
        puntuacion: 0,
        handicap: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        jugador: "Celes",
        puntuacion: 0,
        handicap: 7,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        jugador: "JJ",
        puntuacion: 0,
        handicap: 7,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        jugador: "Hono",
        puntuacion: 0,
        handicap: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]);
  },

  down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("Jugador", null, {});
  },
};
