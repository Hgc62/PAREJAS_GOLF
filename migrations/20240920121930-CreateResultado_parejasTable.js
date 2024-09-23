'use strict';

module.exports = {
  up (queryInterface, Sequelize) {
    return queryInterface.createTable('Resultado_pareja',
    {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        partido:{
          type: Sequelize.INTEGER, 
          allowNull: false,
          validate: {
            isInt: true,
          }
        },
        fecha: {
          type: Sequelize.DATEONLY, 
          allowNull: false,
          validate: {
            isDate: true,
          }
        },
        campo:{
          type: Sequelize.STRING,
          allowNull: false,
        },
        pareja_golfistaId: {
          type: Sequelize.INTEGER,
          references: {
            model: "Pareja",
            key: "id"
          },
          OnUpdate: 'CASCADE',
          OnDelete: 'CASCADE'
        },
        g1: {
          type: Sequelize.INTEGER, 
          allowNull: false,
          validate: {
            isInt: true,
          }
        },
        g2: {
          type: Sequelize.INTEGER, 
          allowNull: false,
          validate: {
            isInt: true,
          }
        },
        g3: {
          type: Sequelize.INTEGER, 
          allowNull: false,
          validate: {
            isInt: true,
          }
        },
        g4: {
          type: Sequelize.INTEGER, 
          allowNull: false,
          validate: {
            isInt: true,
          }
        },
        g5: {
          type: Sequelize.INTEGER, 
          allowNull: false,
          validate: {
            isInt: true,
          }
        },
        g6: {
          type: Sequelize.INTEGER, 
          allowNull: false,
          validate: {
            isInt: true,
          }
        },
        g7: {
          type: Sequelize.INTEGER, 
          allowNull: false,
          validate: {
            isInt: true,
          }
        },
        g8: {
          type: Sequelize.INTEGER, 
          allowNull: false,
          validate: {
            isInt: true,
          }
        },
        g9: {
          type: Sequelize.INTEGER, 
          allowNull: false,
          validate: {
            isInt: true,
          }
        },
        puntuacion: {
          type: Sequelize.INTEGER, 
          allowNull: false,
          validate: {
            isInt: true,
          }
        },
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false
        },
        updatedAt: {
            type: Sequelize.DATE,
            allowNull: false
        }
    },
    {
        sync: {force: true}
    } 
);
  },

  down (queryInterface, Sequelize) {
    return queryInterface.dropTable('Resultado_pareja');
  }
};