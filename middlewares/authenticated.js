'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = "clave-secreta-token-9999";

//En este caso se hace un export enseguida porque es un solo metodo
//Los middlewares tienen tres metodos,por eso el next
//next lo que hace es que el flujo del programa salga del middleware y ejecute lo siguiente
exports.authenticated = function(req, res, next){

    //Comprobar si llega autorización
    if(!req.headers.authorization){
        return res.status(403).send({
            message: 'La petición no tiene la cabecera de authorization'
        });
    }

    //Limpiar el token y quitar las comillas
    var token = req.headers.authorization.replace(/['"]+/g, '');


    try{
        //Decodificar token
        //El token es el token original y el secret es la contraseña secreta
        var payload = jwt.decode(token, secret);

        //Comprobar si el token ha expirado
        if(payload.exp <= moment().unix()){
            return res.status(404).send({
                message: 'El token ha expirado'
            });
        }
        //ex es excepción
    }catch(ex){
        return res.status(404).send({
            message: 'El token no es valido'
        });
    }

    //Adjuntar usuario identificado a request
    req.user = payload;


    //Pasar a la acción
    next();
}