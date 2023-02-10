const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const {models} = require("../models");
const paginate = require('../helpers/paginate').paginate;
const fs = require("fs");

//const attHelper = require("../helpers/attachments");
const req = require("express/lib/request");
const res = require("express/lib/response");
const { where } = require("sequelize");


let hoyos = ["G1", "G2", "G3", "G4", "G5", "G6", "G7", "G8", "G9"];
let HCP_GP = [9,7,4,2,1,3,6,5,8];
let PENALIZACION_GANAR = 1;
let AYUDA_PERDER = 1;
let PENALIZACION_NO_JUGAR = 1;

function convertDateFormat(string) {
    var info = string.split('-').reverse().join('/');
    return info;
}

function calcular_STB (partido, jugadores) {
    for (var i in jugadores) {
        //HCP personal
        const HCPP = jugadores[i].handicap;
        var STBTOTAL =0;
        var PAR_HOYO =0;
        for (var j in hoyos){
            if (HCP_GP[j] > HCPP) {
                 PAR_HOYO = 3;
            } else {
                 PAR_HOYO = 4;
            }
             var golpes_hoyo = partido[`${jugadores[i].jugador}GOLPES`][j];
             var STB =0;
             if (golpes_hoyo !== '0') {
             
                switch (golpes_hoyo - PAR_HOYO) {
                    case -3:
                        STB=5;
                        break;
                    case -2:
                        STB=4;
                        break;
                    case -1:
                        STB=3;
                        break;
                    case 0:
                        STB=2;
                        break;    
                    case 1:
                        STB=1;
                        break;
                    default:
                        STB=0;
                }
            }
            partido[`${jugadores[i].jugador}STB`][j] = STB;
            STBTOTAL += STB;
        }
        partido[`${jugadores[i].jugador}STBTOTAL`] = STBTOTAL;
    }
}

function calcular_nuevos_valores (partido, jugadores) {
    const num_jugadores = jugadores.length;
    //Crear objeto resultado con nombre y STB y ordenarlo de mayor a menor
    let resultado = [];
    for (var i in jugadores) {
        resultado[i] = {nombre: jugadores[i].jugador, STB: partido[`${jugadores[i].jugador}STBTOTAL`]};
    }
    resultado.sort((a, b) => {
        return b.STB - a.STB;
    });

    // Calculo el STB máximo
    const MAX_STB = resultado[0].STB;

    // Calculo el STB mínimo
    var n = num_jugadores -1;
    var MIN_STB = 0;
    while (MIN_STB === 0 && n >= 0) {
        MIN_STB = resultado[n].STB;
        n--;
    }

    //Actualizo nuevos HCP y golpes para los que no han jugado
    //El de máximo STB le resto 1 al HCP
   
    partido[`${resultado[0].nombre}HCPN`] = partido[`${resultado[0].nombre}HCP`] > 0 ? partido[`${resultado[0].nombre}HCP`] - PENALIZACION_GANAR : 0;

    //Analizo los siguientes resultados para ver si ha habido empate en cabeza y restar tb 1 al HCP
    for (let index = 1; index < num_jugadores; index++) {
        if (resultado[index].STB === MAX_STB) {
            partido[`${resultado[index].nombre}HCPN`] = partido[`${resultado[index].nombre}HCP`] > 0 ? partido[`${resultado[index].nombre}HCP`] - PENALIZACION_GANAR  : 0;
        } else {
            partido[`${resultado[index].nombre}HCPN`] = partido[`${resultado[index].nombre}HCP`];
        }
    }

    //Analizo por abajo para ver los que tienen STB 0 que es que no han jugado y asignarles STB como el menor menos 1
    //y los que tengan el STB mínimo sumarles 1 al HCP
    for (let index = num_jugadores-1; index >= 0; index--) {
        if (resultado[index].STB === 0 && resultado[index].STB !== MAX_STB) {
            partido[`${resultado[index].nombre}STBTOTAL`] = MIN_STB - PENALIZACION_NO_JUGAR;
            partido[`${resultado[index].nombre}HCPN`] = partido[`${resultado[index].nombre}HCP`];

        } else if (resultado[index].STB === MIN_STB) {
            partido[`${resultado[index].nombre}HCPN`] = partido[`${resultado[index].nombre}HCP`] < 9 ? partido[`${resultado[index].nombre}HCP`] + AYUDA_PERDER : 9;   
        }   
    }
}


// GET clasificacion
exports.clasificacionShow =async (req, res, next) => {
    try {
        const jugadores = await models.Jugador.findAll({ order: [["puntuacion", "DESC"]]});
        res.render('juego/clasificacionShow', {jugadores});
    } catch (error) {
        next(error);
    }    
};

// GET nuevo_partido
exports.formulario = async (req, res, next) => {
    try {  
        const jugadores = await models.Jugador.findAll({attributes:['jugador']});
        req.flash('info', 'Introduzca los datos para la creación del partido. El campo fecha es obligatorio, si no lo pone perderá el resto de datos');
        res.render('juego/formulario', {jugadores});
    } catch (error) {
        next(error);
    }
};

//POST crear_partido
exports.crear_partido = async (req, res, next) => {
    //Saco el número de jugadores de un parámetro oculto del formulario
    const num_jugadores = req.body.num_jugadores;

    //Creo el objeto donde guardaré todos los datos del partido.
    let partido ={};
    partido.fecha = req.body.fecha;
    // Si no hay fecha para el partido se da error.
    if (partido.fecha) {
        //Cargo en partido para cada jugador los golpes por hoyo puestos en el formulario
        for (let i = 0; i < num_jugadores; i++) {
            partido[`${req.body["jugador"+i]+"GOLPES"}`] = [0,0,0,0,0,0,0,0,0];
            // Creo en partido el array donde pondré los puntos stableford obtenidos en cada hoyo
            partido[`${req.body["jugador"+i]+"STB"}`] = [0,0,0,0,0,0,0,0,0];
            for (var z in hoyos) {
                partido[`${req.body["jugador"+i]+"GOLPES"}`][z] = req.body["jugador"+i+`${hoyos[z]}`];
            } 
        }

        try {
            //Obtengo el HCP actual de la BBDD y lo pongo en partido.
            const jugadores = await models.Jugador.findAll();
            for (var i in jugadores) {
                partido[`${jugadores[i].jugador}HCP`] = jugadores[i].handicap;
            } 
            //Calculo es STB parcial y total
            calcular_STB (partido, jugadores);
            //Ordeno por STB, calculo nuevos HCP y STB de los no presentados
            calcular_nuevos_valores (partido, jugadores);

            //Actualizo la tabla de jugadores con puntuación total y nuevo HCP
            for (var i in jugadores) {
                const jugador = await models.Jugador.findOne({ where: { jugador: `${jugadores[i].jugador}` }});
                jugador.handicap = partido[`${jugadores[i].jugador}HCPN`];
                jugador.puntuacion += partido[`${jugadores[i].jugador}STBTOTAL`];
                await jugador.save({fields: ["handicap", "puntuacion"]});
            } 

            //Añado a la tabla de resultados el partido actual
            var NUM_PARTIDO = await models.Resultado.max('partido');
            NUM_PARTIDO = NUM_PARTIDO ? NUM_PARTIDO+1 : 1;
            const FECHA = partido.fecha;
            //Convertir a formato dd/mm/aaaa
            var fecha_esp = convertDateFormat(FECHA);
            for (var i in jugadores) {
                const JUGADOR = jugadores[i].jugador;
                const ID_JUGADOR = jugadores[i].id;
                const HANDICAP = partido[`${JUGADOR}HCP`];
                const HANDICAP_N = partido[`${JUGADOR}HCPN`];
                const TOTAL_STB = partido[`${JUGADOR}STBTOTAL`];
                for (var g in hoyos) {
                    switch (hoyos[g]) {
                        case "G1":
                            var GOLPES1 = partido[`${JUGADOR}GOLPES`][g];
                            break;
                        case "G2":
                            var GOLPES2 = partido[`${JUGADOR}GOLPES`][g];
                            break;
                        case "G3":
                            var GOLPES3 = partido[`${JUGADOR}GOLPES`][g];
                            break;
                        case "G4":
                            var GOLPES4 = partido[`${JUGADOR}GOLPES`][g];
                            break;    
                        case "G5":
                            var GOLPES5 = partido[`${JUGADOR}GOLPES`][g];
                            break;
                        case "G6":
                            var GOLPES6 = partido[`${JUGADOR}GOLPES`][g];
                            break;
                        case "G7":
                            var GOLPES7 = partido[`${JUGADOR}GOLPES`][g];
                            break;
                        case "G8":
                            var GOLPES8 = partido[`${JUGADOR}GOLPES`][g];
                            break;    
                        case "G9":
                            var GOLPES9 = partido[`${JUGADOR}GOLPES`][g];
                            break;
                    }
                }
                await models.Resultado.create({
                    partido: NUM_PARTIDO,
                    fecha: FECHA,
                    golfistaId: ID_JUGADOR,
                    handicap: HANDICAP,
                    stableford: TOTAL_STB,
                    handicap_nuevo: HANDICAP_N,
                    g1: GOLPES1,
                    g2: GOLPES2,
                    g3: GOLPES3,
                    g4: GOLPES4,
                    g5: GOLPES5,
                    g6: GOLPES6,
                    g7: GOLPES7,
                    g8: GOLPES8,
                    g9: GOLPES9
                });
            } 
            req.flash('success', 'Partido creado correctamente.');

            //Leo la BBDD para mostrar el resultado con el ejs, de esta forma puedo pasar el nombre del jugador
            let options = {
                where: {},
                order: [
                    ['stableford', 'DESC']
                  ],
                include: []
            };

            options.where.partido = NUM_PARTIDO;
            
            options.include.push({
                model: models.Jugador,
                as: "golfista"
            }); 

            const ult_partido = await models.Resultado.findAll(options);

            res.render('juego/resultados_partido', {ult_partido, fecha_esp});
        } catch (error) {
            if (error instanceof Sequelize.ValidationError) {
                req.flash('error', 'Hay errores de validación enla base de datos.');
                error.errors.forEach(({message}) => req.flash('error', message));
                    res.redirect('/nuevo_partido');
            } else {
                req.flash('error', 'Error al crear un nuevo partido.');
                next(error)
            }       
        }
    } else {
        // Mensaje flash de que no pueden estar vacío el campo fecha
        req.flash('error', 'La fecha del partido no puede estar vacía');  
        res.redirect('/nuevo_partido');
    }
};

// GET consulta los partidos de la base de datos
exports.consulta_partidos  = async (req, res, next) => {
    try {
        //const jugadores = await models.Jugador.findAll({ order: ["id"]});

        //Leo la BBDD para mostrar el resultado con el ejs, de esta forma puedo pasar el nombre del jugador
        let options = {
            where: {},
            order: [
                ['partido', 'DESC'],
                ['stableford', 'DESC']
              ],
            include: []
        };

        options.include.push({
            model: models.Jugador,
            as: "golfista"
        }); 

        //Paginación
        const count =await models.Resultado.count(options);
        
        if (count === 0) {
            req.flash("info", "No hay ningún resultado para la consulta.");
        }
        
        const items_per_page = 6;
        const pageno = parseInt(req.query.pageno) || 1;
        res.locals.paginate_control = paginate(count, items_per_page, pageno, req.url);

        options.offset = items_per_page * (pageno - 1);
        options.limit = items_per_page;

        const partidos = await models.Resultado.findAll(options);

        res.render('juego/partidosShow', {partidos});
    } catch (error) {
        next(error);
    }    
}
