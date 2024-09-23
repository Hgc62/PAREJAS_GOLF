
const {Model} = require('sequelize');

// Definición del modelo de parejas:

module.exports = (sequelize, DataTypes) => {

    class Pareja extends Model {}

    Pareja.init(
        { 
          nombre: {
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
          
        },
        {sequelize, tableName:"Pareja"}
    );

    return Pareja;
};
