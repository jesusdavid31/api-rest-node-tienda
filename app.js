'use strict'

//Requires
var express = require('express');
var bodyParser = require('body-parser');

//Ejecutar express
var app = express();

//Cargar archivos de rutas
var user_routes = require('./routes/user');
var producto_routes = require('./routes/producto');

//middlewares
app.use(bodyParser.urlencoded({extended: false}));/* Esto simplemente es una configuración para que
bodyparser funcione correctamente */
app.use(bodyParser.json());//Convierte la petición  a un objeto json el body

/*Este cors sirve para que el backend y el frontend se comuniquen entre si y se puedan realizar peticiones
ajax, basicamente para esto */
/* Cuando hacemos peticiones AJAX con jQuery o Angular a un backend o un API REST es normal que tengamos 
problemas con el acceso CORS en NodeJS y nos fallen las peticiones.
Para eso podemos crear un middleware como este: */
// Configurar cabeceras y cors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

//Reescribir rutas
app.use('/api', user_routes);
app.use('/api', producto_routes);


/*
app.get('/prueba', (req, res) =>{
    return res.status(200).send("<h1>Hola desde barranquilla</h1>");
    return res.status(200).send({
        nombre: "Jesús Gonza",
        message: 'Armando'
    });
});

app.post('/prueba', (req, res) =>{
    return res.status(200).send({
        nombre: "Jesús Gonza",
        message: 'Armando'
    });
});
*/

//Exportar modulo
module.exports = app;//Para poder utilizarlo en otro lugar de la aplicación
