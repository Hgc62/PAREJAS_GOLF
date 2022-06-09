var express = require('express');
var router = express.Router();

const juegoController = require('../controllers/juego');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

/* Ruta que muestra la clasificación */
router.get('/clasificacion',         juegoController.clasificacionShow);

/* Ruta que muestra el formulario para cargar un partido */
router.get('/nuevo_partido',         juegoController.formulario);

/* Ruta que con los datos del partido hace los calculos y muestra los resultados*/
router.post('/crear_partido',         juegoController.crear_partido);

/* Ruta que muestra la la información de todos los partidos jugados */
router.get('/consulta_partidos',      juegoController.consulta_partidos);

module.exports = router;
