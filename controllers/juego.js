const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const {models} = require("../models");
const paginate = require('../helpers/paginate').paginate;
const fs = require("fs");

//const attHelper = require("../helpers/attachments");
const req = require("express/lib/request");
const res = require("express/lib/response");
const { where } = require("sequelize");
const { count } = require("console");

let CAMPOS = ["GOLF PARK", "COLMENAR", "EL OLIVAR", "NEGRALEJO"];
let hoyos = ["G1", "G2", "G3", "G4", "G5", "G6", "G7", "G8", "G9"];
let HCP_GP = [9,7,4,2,1,3,6,5,8]; // HCP de los hoyos de Golf Park
let HCP_COLMENAR = [8,2,4,6,7,3,5,9,1]; // HCP de los hoyos de Colmenar
let HCP_OLIVAR = [8,2,4,6,7,3,5,9,1]; // HCP de los hoyos del Olivar
let HCP_NEGRALEJO = [8,3,4,7,6,9,1,5,2]; // HCP de los hoyos de Negralejo corto
let PENALIZACION_GANAR = 1;
let AYUDA_PERDER = 1;
let PENALIZACION_NO_JUGAR = 1;
let MIN_PARTIDOS = 9; //Mínimo numero de partidos para sacar la clasificaciòn quitando los tres peores resultados.
let PARTIDOS_BORRADOS = 3; //Número de los peores resultados que se  eliminan para la clasificacion final

function convertDateFormat(string) {
    var info = string.split('-').reverse().join('/');
    return info;
}

function calcular_golpes_HCP (partido, jugadores) {
    // Por ahora no calculamos golpe por HCP del jugador y del campo,por lo tanto copio los golpes al GOLPES_HCP
    for (var i in jugadores) {
        for (var j in hoyos){
            partido[`${jugadores[i].jugador}GOLPES_HCP`][j] = partido[`${jugadores[i].jugador}GOLPES`][j];
        }
    }
}

function calcular_mejores_golpes_pareja (partido, parejas){
    for (var i in parejas) {
        if (parejas[i].nombre === "Isi-JJ") {
            for (var z in hoyos){
                partido[`${parejas[i].nombre}GOLPES`][z] = Math.min (partido[`IsiGOLPES`][z], partido[`JJGOLPES`][z]); 
            }
 
        } else if (parejas[i].nombre === "MA-Celes") {
            for (var z in hoyos){
                partido[`${parejas[i].nombre}GOLPES`][z] = Math.min (partido[`MAGOLPES`][z], partido[`CelesGOLPES`][z]); 
            }
 
        } else {
            for (var z in hoyos){
                partido[`${parejas[i].nombre}GOLPES`][z] = Math.min (partido[`AgusGOLPES`][z], partido[`HonoGOLPES`][z]); 
            }
 
        }
    }
}

function calcular_resultado_hoyos (partido, parejas){
    // Creo en partido la variable para anotar los hoyos ganados
    for (var i in parejas) {
        partido[`${parejas[i].nombre}HOYOS_GAN`] = 0;
    }
    //Crear objeto resultado con nombre de pareja y GOLPES y ordenarlo de menor a mayor
    let resultado = [];
    // Vamos cargando cada hoyo y analizando quien lo gana
    for (var j in hoyos){
        for (var i in parejas) {
            resultado[i] = {nombre: parejas[i].nombre, GOLPES_H: partido[`${parejas[i].nombre}GOLPES`][j]};
        }
        //Ordenamos de menor a mayor
        resultado.sort((a, b) => {
            return a.GOLPES_H - b.GOLPES_H;
        });
        // Analizar si el menor es único. Si hay empate la puntuación es cero para todos.
        if (resultado[0].GOLPES_H  < resultado[1].GOLPES_H) {
            // Gana el hoyo la pareja de resultado[0]
            partido[`${resultado[0].nombre}HOYOS_GAN`]+=1;
        }
        resultado = [];
    }
}

/*
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
                 //PAR_HOYO = 4;
                 PAR_HOYO = 3 + Math.floor(HCPP/9);
                 if (HCP_GP[j] <= HCPP % 9) {
                    PAR_HOYO += 1;
                 }

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
            // partido[`${resultado[index].nombre}HCPN`] = partido[`${resultado[index].nombre}HCP`] < 9 ? partido[`${resultado[index].nombre}HCP`] + AYUDA_PERDER : 9;
            partido[`${resultado[index].nombre}HCPN`] = partido[`${resultado[index].nombre}HCP`] + AYUDA_PERDER;   
        }   
    }
}
*/

// GET clasificacion
/*
exports.clasificacionShow =async (req, res, next) => {
    try {
        const jugadores = await models.Jugador.findAll({ order: [["puntuacion", "DESC"]]});
        // Sacar de la BBDD el partido de mayor número
        var NUM_PARTIDO = await models.Resultado.max('partido');

        let resultado_final = [];
        if (NUM_PARTIDO >= MIN_PARTIDOS) {
        //Si el número de partidos es mayor que 9 (variable) sacar de la BBDD Arrays con los STB de cada jugador
        // por partido y llamar a una función que quite los tres peores y dé la suma del resto
            
            let options = {
                attributes: ['golfistaId','stableford'],
                where: {},
                order: [
                    ['stableford', 'DESC']
                ],
                include: []
            };

            options.include.push({
                model: models.Jugador,
                as: "golfista"
            }); 

            const resultados_total = await models.Resultado.findAll(options);
            //Creo un objeto con el nombre del jugador y un array con los resultados STB en orden decreciente
            let lista_STB ={};
            for (var i in resultados_total) {
                if (!lista_STB[`${resultados_total[i].golfista.jugador}`]) {
                    lista_STB[`${resultados_total[i].golfista.jugador}`]= [];   
                } 
                const LONG_STB = lista_STB[`${resultados_total[i].golfista.jugador}`].push(resultados_total[i].stableford);
            } 
            // Elimino los resultados peores. El número de eliminados viene indicado en la variable PARTIDOS_BORRADOS
            for (var j in lista_STB) {
                const BORRADOS = lista_STB[j].splice((lista_STB[j].length) - PARTIDOS_BORRADOS);
                //Añado la suma total de los puntos STB traas quitar los peores resultados
                let suma_stb = 0;
                for (var stb in lista_STB[j]) {
                    suma_stb += lista_STB[j][stb]; 
                    lista_STB[j].TOTAL = suma_stb;
                }
            }
            //Creo una tabla con nombre y resutado ordenado de mayor a menor.
            let ind = 0;
            for (var nom in lista_STB) {

                resultado_final[ind] = {nombre: nom, STB_TOTAL: lista_STB[nom].TOTAL};
                ind++;
            }
            resultado_final.sort((a, b) => {
                return b.STB_TOTAL - a.STB_TOTAL;
            });

        } 
          
        res.render('juego/clasificacionShow', {jugadores, resultado_final});
       

    } catch (error) {
        next(error);
    }    
};
*/
exports.clasificacionShow =async (req, res, next) => {
    try {
        const parejas = await models.Pareja.findAll({ order: [["puntuacion", "DESC"]]});
        //const num_partidos = count(parejas);
        // Sacar de la BBDD el partido de mayor número
          
        res.render('juego/clasificacionShow', {parejas});
       

    } catch (error) {
        next(error);
    }    
};


// GET nuevo_partido
exports.formulario = async (req, res, next) => {
    try {  
        const jugadores = await models.Jugador.findAll({attributes:['jugador']});
        req.flash('info', 'Introduzca los datos para la creación del partido. El campo fecha es obligatorio, si no lo pone perderá el resto de datos');
        res.render('juego/formulario', {jugadores, CAMPOS});
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
    // Anoto la fecha del partido
    partido.fecha = req.body.fecha;
    // Anoto el campo del partido
    partido.campo =req.body.campo;
    // Si no hay fecha y campo para el partido se da error.
    if (partido.fecha && partido.campo) {
        //Cargo en partido para cada jugador los golpes por hoyo puestos en el formulario
        for (let i = 0; i < num_jugadores; i++) {
            partido[`${req.body["jugador"+i]+"GOLPES"}`] = [0,0,0,0,0,0,0,0,0];
            // Creo en partido el array donde pondré los puntos stableford obtenidos en cada hoyo
            //partido[`${req.body["jugador"+i]+"STB"}`] = [0,0,0,0,0,0,0,0,0];
            // Creo en partido el array donde pondré los golpes aplicado el HCP obtenidos en cada hoyo
            partido[`${req.body["jugador"+i]+"GOLPES_HCP"}`] = [0,0,0,0,0,0,0,0,0];
            for (var z in hoyos) {
                partido[`${req.body["jugador"+i]+"GOLPES"}`][z] = req.body["jugador"+i+`${hoyos[z]}`];
            } 
        }

        try {
            const jugadores = await models.Jugador.findAll();
            //Calcular para cada uno los golpes en función del HCP y ponerlo en partido en GOLPES_HCP
            calcular_golpes_HCP (partido, jugadores);

            // Obtenemos de la base de datos las parejas
            const parejas = await models.Pareja.findAll();

            // Creo los arrays para los resultados de las parejas
            for (var i in parejas) {
                partido[`${parejas[i].nombre}GOLPES`] = [0,0,0,0,0,0,0,0,0];
            }

            //Calcular mejores golpes por pareja y ponerlo en partido en el array creado
            calcular_mejores_golpes_pareja (partido, parejas);

            //Calcular que pareja gana cada hoyo y se le da 1 punto por hoyo. Si hay empate en los primeros 0 puntos a todos
            calcular_resultado_hoyos (partido, parejas);

            /*
            for (var i in jugadores) {
                partido[`${jugadores[i].jugador}HCP`] = jugadores[i].handicap;
            } 
            //Calculo es STB parcial y total
            calcular_STB (partido, jugadores);
            //Ordeno por STB, calculo nuevos HCP y STB de los no presentados
            calcular_nuevos_valores (partido, jugadores);

            //Actualizo la tabla de parejas con puntuación total
            */
            for (var i in parejas) {
                const pareja = await models.Pareja.findOne({ where: { nombre: `${parejas[i].nombre}` }});
                //jugador.handicap = partido[`${jugadores[i].jugador}HCPN`];
                pareja.puntuacion += partido[`${parejas[i].nombre}HOYOS_GAN`];
                await pareja.save({fields: ["puntuacion"]});
            } 

            //Añado a la tabla de resultados el partido actual
            var NUM_PARTIDO = await models.Resultado.max('partido');
            NUM_PARTIDO = NUM_PARTIDO ? NUM_PARTIDO+1 : 1;
            const CAMPO = partido.campo;
            const FECHA = partido.fecha;
            //Convertir a formato dd/mm/aaaa
            var fecha_esp = convertDateFormat(FECHA);
            for (var i in jugadores) {
                const JUGADOR = jugadores[i].jugador;
                const ID_JUGADOR = jugadores[i].id;
                //Los tres siguientes campos no pueden estar vacíos en la BBDD. No son necesarios y los pongo a 1.
               // const HANDICAP = partido[`${JUGADOR}HCP`];
               // const HANDICAP_N = partido[`${JUGADOR}HCPN`];
               // const TOTAL_STB = partido[`${JUGADOR}STBTOTAL`];
                const HANDICAP = 1;
                const HANDICAP_N =1;
                const TOTAL_STB = 1;

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
                    campo: CAMPO,
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

            //Añado a la tabla de resultado_pareja el partido actual
            var NUM_PARTIDO_PAR = await models.Resultado_pareja.max('partido');
            NUM_PARTIDO_PAR = NUM_PARTIDO_PAR ? NUM_PARTIDO_PAR+1 : 1;
            const CAMPO_PAR = partido.campo;
            const FECHA_PAR = partido.fecha;
            //Convertir a formato dd/mm/aaaa
            var fecha_esp = convertDateFormat(FECHA_PAR);
            for (var i in parejas) {
                const PAREJA = parejas[i].nombre;
                const ID_PAREJA = parejas[i].id;
                const PUNTUACION = partido[`${PAREJA}HOYOS_GAN`];
                for (var g in hoyos) {
                    switch (hoyos[g]) {
                        case "G1":
                            var GOLPES1 = partido[`${PAREJA}GOLPES`][g];
                            break;
                        case "G2":
                            var GOLPES2 = partido[`${PAREJA}GOLPES`][g];
                            break;
                        case "G3":
                            var GOLPES3 = partido[`${PAREJA}GOLPES`][g];
                            break;
                        case "G4":
                            var GOLPES4 = partido[`${PAREJA}GOLPES`][g];
                            break;    
                        case "G5":
                            var GOLPES5 = partido[`${PAREJA}GOLPES`][g];
                            break;
                        case "G6":
                            var GOLPES6 = partido[`${PAREJA}GOLPES`][g];
                            break;
                        case "G7":
                            var GOLPES7 = partido[`${PAREJA}GOLPES`][g];
                            break;
                        case "G8":
                            var GOLPES8 = partido[`${PAREJA}GOLPES`][g];
                            break;    
                        case "G9":
                            var GOLPES9 = partido[`${PAREJA}GOLPES`][g];
                            break;
                    }
                }
                await models.Resultado_pareja.create({
                    partido: NUM_PARTIDO_PAR,
                    fecha: FECHA_PAR,
                    campo: CAMPO_PAR,
                    pareja_golfistaId: ID_PAREJA,
                    g1: GOLPES1,
                    g2: GOLPES2,
                    g3: GOLPES3,
                    g4: GOLPES4,
                    g5: GOLPES5,
                    g6: GOLPES6,
                    g7: GOLPES7,
                    g8: GOLPES8,
                    g9: GOLPES9,
                    puntuacion: PUNTUACION
                });
            } 

            req.flash('success', 'Partido creado correctamente.');

            //Leo la BBDD para mostrar el resultado con el ejs, de esta forma puedo pasar el nombre del jugador
            let options = {
                where: {},
                //order: [
                //    ['stableford', 'DESC']
                //  ],
                include: []
            };

            options.where.partido = NUM_PARTIDO;
            
            options.include.push({
                model: models.Jugador,
                as: "golfista"
            }); 

            const ult_partido = await models.Resultado.findAll(options);

            let options1 = {
                where: {},
                order: [
                  ['puntuacion', 'DESC']
                ],
                include: []
            };

            options1.where.partido = NUM_PARTIDO;
            
            options1.include.push({
                model: models.Pareja,
                as: "pareja_golfista"
            }); 

            const ult_partido_par = await models.Resultado_pareja.findAll(options1);

            res.render('juego/resultados_partido', {ult_partido, ult_partido_par, fecha_esp});
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
        /*
        let options = {
            where: {},
            order: [
                ['partido', 'DESC'],
               // ['stableford', 'DESC']
              ],
            include: []
        };

        options.include.push({
            model: models.Jugador,
            as: "golfista"
        }); 
        */

        let options1 = {
            where: {},
            order: [
              ['partido', 'DESC'],
              ['puntuacion', 'DESC']
            ],
            include: []
        };
        
        options1.include.push({
            model: models.Pareja,
            as: "pareja_golfista"
        }); 


        //Paginación
        const count =await models.Resultado_pareja.count(options1);
        
        if (count === 0) {
            req.flash("info", "No hay ningún resultado para la consulta.");
        }
        // Para presentar partidas individuales
        //const items_per_page = 6;
        // Para presentar partidas por parejas
        const items_per_page = 3;
        const pageno = parseInt(req.query.pageno) || 1;
        res.locals.paginate_control = paginate(count, items_per_page, pageno, req.url);

        options1.offset = items_per_page * (pageno - 1);
        options1.limit = items_per_page;

        //const partidos = await models.Resultado.findAll(options);
        const partidos_par = await models.Resultado_pareja.findAll(options1);
        
        res.render('juego/partidosShow', {partidos_par});
    } catch (error) {
        next(error);
    }    
}
