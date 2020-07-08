'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');

//En este caso se hace un export enseguida porque solo es un solo metodo 
exports.createToken = function(user){

    //El payload son todos los datos del usuario que queremos identificar y generar su token
    //sub es el id del usuario, pero en jwt se acostumbra a ponerle sub
    //No se mete en el jwt la contraseña porque es inseguro tenerla alli
    //iat es el tiempo o fecha exacta en el que se creo el token
    //exp es la fecha de expiración del token
    //unix es la fecha actual en formato unix que no se que es jaja pero se pone
      var payload = {
          sub: user._id,
          name: user.name,
          surname: user.surname,
          email: user.email,
          role: user.role,
          image: user.image,
          iat: moment().unix(),
          exp: moment().add(1, 'days').unix
      };

      return jwt.encode(payload, 'clave-secreta-token-9999');

}