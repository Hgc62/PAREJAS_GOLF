
const {Model} = require('sequelize');

// Definición del modelo de resultados:

module.exports = (sequelize, DataTypes) => {

    class Resultado extends Model {}

    Resultado.init(
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
          handicap: {
            type: DataTypes.INTEGER, 
            allowNull: false,
            validate: {
              isInt: true,
            }
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
          stableford: {
            type: DataTypes.INTEGER, 
            allowNull: false,
            validate: {
              isInt: true,
            }
          },
          handicap_nuevo: {
            type: DataTypes.INTEGER, 
            allowNull: false,
            validate: {
              isInt: true,
            }
          }
        },
        {sequelize, tableName:"Resultado"}
    );

    return Resultado;
};
