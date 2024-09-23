"use strict";

module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert("Pareja", [
      {
        nombre: "Isi-JJ",
        puntuacion: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nombre: "MA-Celes",
        puntuacion: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nombre: "Agus-Hono",
        puntuacion: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("Pareja", null, {});
  },
};
