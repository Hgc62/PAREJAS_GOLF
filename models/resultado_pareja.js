
const {Model} = require('sequelize');

// Definición del modelo de resultados:

module.exports = (sequelize, DataTypes) => {

    class Resultado_pareja extends Model {}

    Resultado_pareja.init(
        { 
          partido:{
            type: DataTypes.INTEGER, 
            allowNull: false,
            validate: {
              isInt: true,
            }
          },
          fecha: {
            type: DataTypes.DATEONLY, 
            allowNull: false,
            validate: {
              isDate: true,
            }
          },
          campo:{
            type: DataTypes.STRING,
            allowNull: false,
          },
          g1: {
            type: DataTypes.INTEGER, 
            allowNull: false,
            validate: {
              isInt: true,
            }
          },
          g2: {
            type: DataTypes.INTEGER, 
            allowNull: false,
            validate: {
              isInt: true,
            }
          },
          g3: {
            type: DataTypes.INTEGER, 
            allowNull: false,
            validate: {
              isInt: true,
            }
          },
          g4: {
            type: DataTypes.INTEGER, 
            allowNull: false,
            validate: {
              isInt: true,
            }
          },
          g5: {
            type: DataTypes.INTEGER, 
            allowNull: false,
            validate: {
              isInt: true,
            }
          },
          g6: {
            type: DataTypes.INTEGER, 
            allowNull: false,
            validate: {
              isInt: true,
            }
          },
          g7: {
            type: DataTypes.INTEGER, 
            allowNull: false,
            validate: {
              isInt: true,
            }
          },
          g8: {
            type: DataTypes.INTEGER, 
            allowNull: false,
            validate: {
              isInt: true,
            }
          },
          g9: {
            type: DataTypes.INTEGER, 
            allowNull: false,
            validate: {
              isInt: true,
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
        {sequelize, tableName:"Resultado_pareja"}
    );

    return Resultado_pareja;
};
