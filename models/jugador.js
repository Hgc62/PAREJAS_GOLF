
const {Model} = require('sequelize');

// Definición del modelo de jugadores:

module.exports = (sequelize, DataTypes) => {

    class Jugador extends Model {}

    Jugador.init(
        { 
          jugador: {
            type: DataTypes.STRING,
                unique: { msg: "Nombre ya existe"},
                allowNull: false,
                validate: {
                    isAlphanumeric: { args: true, msg: "nombre: caracteres no válidos"},
                    notEmpty: {msg: "nombre no puede estar vacío."}
                }
          },
          puntuacion: {
            type: DataTypes.INTEGER, 
            allowNull: false,
            validate: {
              isInt: true,
            }
          },
          handicap: {
            type: DataTypes.INTEGER, 
            allowNull: false,
            validate: {
              isInt: true,
            }
          }
        },
        {sequelize, tableName:"Jugador"}
    );

    return Jugador;
};
