'use strict'

var validator = require('validator');
var bcrypt = require('bcrypt');
//fs permite trabajar con el sistema de ficheros, se utiliza para no enviar algo que no sea una imagen
var fs = require('fs');
//El path es la ruta total del archivo
var path = require('path');
var User = require('../models/user');
var jwt = require('../services/jwt');
const saltRounds = 10;



var controller = {

    probando: function (req, res) {
        return res.status(200).send({
            message: "Soy el metodo probando"
        });
    },
    testeando: function (req, res) {
        return res.status(200).send({
            message: "Soy el metodo testeando"
        });
    },

    save: function (req, res) {
        //Recoger los parametros de la petición
        var params = req.body;

        //Validar los datos
        try {
            var validate_name = !validator.isEmpty(params.name);
            var validate_surname = !validator.isEmpty(params.surname);
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
            var validate_password = !validator.isEmpty(params.password);
        } catch (err) {
            return res.status(200).send({
                message: "Faltan datos por enviar" 
            });
        }
        //console.log(validate_name, validate_surname, validate_email, validate_password);

        if (validate_name && validate_surname && validate_email && validate_password) {
            //Crear objeto de usuario
            var user = new User();

            //Asignar valores al usuario
            user.name = params.name;
            user.surname = params.surname;
            user.email = params.email.toLowerCase();
            user.role = 'ROLE_USER';
            user.image = null;

            //Comprobar si el usuario existe
            User.findOne({ email: user.email }, (err, issetUser) => {
                if (err) {
                    return res.status(500).send({
                        message: "Error al comprobar duplicidad del usuario"
                    });
                }

                if (!issetUser) {
                    //Si no existe,

                    //Cifrar contraseña
                    bcrypt.genSalt(saltRounds, function (err, salt) {
                        bcrypt.hash(params.password, salt, function (err, hash) {
                            // Store hash in your password DB.
                            user.password = hash;

                            //Y guardar usuario
                            user.save((err, userStored) => {
                                if (err) {
                                    return res.status(500).send({
                                        message: "Error al guardar el usuario"
                                    });
                                }

                                if (!userStored) {
                                    return res.status(400).send({
                                        message: "El usuario no se ha guardado"
                                    });
                                }

                                //Devolver respuesta
                                return res.status(200).send({
                                    status: 'success',
                                    user: userStored
                                });
                            });//close save
                        });
                    });






                } else {
                    return res.status(200).send({
                        message: "El usuario ya esta registrado"
                    });
                }

            });


        } else {
            return res.status(200).send({
                message: "Validación de los datos del usuario incorrecta, intentalo de nuevo por favor"
            });
        }

    },

    login: function (req, res) {
        //Recoger los datos de la petición
        var params = req.body;

        //Validar los datos
        try {
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
            var validate_password = !validator.isEmpty(params.password);
        } catch (err) {
            return res.status(200).send({
                message: "Faltan datos por enviar"
            });
        }

        if (!validate_email || !validate_password) {
            return res.status(200).send({
                message: "Email o contraseña incorrectos, intente nuevamente."
            });
        }
        //Buscar usuarios que coincidan con el email
        User.findOne({ email: params.email.toLowerCase() }, (err, user) => {

            if (err) {
                return res.status(500).send({
                    message: "Error al identificarse"
                });
            }

            if (!user) {
                return res.status(404).send({
                    message: "El usuario no existe"
                });
            }



            //Si lo encuentra,
            //Comprobar la contraseña(Coincidencia de email y password / bcrypt)
            //Cargue hash de su contraseña DB.
            bcrypt.compare(params.password, user.password, (err, check) => {
                //Si es correcto,
                if (check) {
                    //Generar token de JWT y devolverlo (mas tarde)
                    if (params.gettoken) {
                        //Devolver los datos
                        return res.status(200).send({
                            token: jwt.createToken(user)
                        });
                    } else {
                        //No hace falta el else pero lo ponemos
                        //Limpiar el objeto
                        user.password = undefined;

                        //Devolver los datos
                        return res.status(200).send({
                            status: "success",
                            user
                        });
                    }
                } else {
                    return res.status(200).send({
                        message: "Las credenciales no son correctas"
                    });
                }
            });



        });

    },

    update: function (req, res) {
        //Recoger los datos del usuario
        var params = req.body;

        //Validar los datos
        try {
            var validate_name = !validator.isEmpty(params.name);
            var validate_surname = !validator.isEmpty(params.surname);
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
        } catch (err) {
            return res.status(200).send({
                message: "Faltan datos por enviar"
            });
        }
        //Eliminar propiedades innecesarias
        delete params.password;

        var userId = req.user.sub;

        //Comprobar si el email es unico
        if (req.user.email != params.email) {
            User.findOne({ email: params.email.toLowerCase() }, (err, user) => {

                if (err) {
                    return res.status(500).send({
                        message: "Error al identificarse"
                    });
                }

                if (user && user.email == params.email) {
                    return res.status(200).send({
                        message: "El email no puede ser modificado"
                    });
                } else {
                    // Buscar y actualizar documento
                    //User.findOneAndUpdate(condicion, datos a actualizar, opciones, callback)
                    /* El {new:true} es para que me devuelva el objeto del usuario actualizado y no el
                    anterior, es decir, el que estaba antes de actualizarlo */
                    User.findOneAndUpdate({ _id: userId }, params, { new: true }, (err, userUpdated) => {
                        if (err) {
                            return res.status(500).send({
                                status: 'error',
                                message: 'Error al actualizar usuario'
                            });
                        }

                        if (!userUpdated) {
                            return res.status(200).send({
                                status: 'success',
                                message: 'No se ha actualizado el usuario'
                            });
                        }

                        //Devolver una respuesta
                        return res.status(200).send({
                            status: 'success',
                            user: userUpdated
                        });

                    });
                }

            });
        } else {
            // Buscar y actualizar documento
            //User.findOneAndUpdate(condicion, datos a actualizar, opciones, callback)
            /* El {new:true} es para que me devuelva el objeto del usuario actualizado y no el
            anterior, es decir, el que estaba antes de actualizarlo */
            User.findOneAndUpdate({ _id: userId }, params, { new: true }, (err, userUpdated) => {
                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al actualizar usuario'
                    });
                }

                if (!userUpdated) {
                    return res.status(200).send({
                        status: 'success',
                        message: 'No se ha actualizado el usuario'
                    });
                }

                //Devolver una respuesta
                return res.status(200).send({
                    status: 'success',
                    user: userUpdated
                });

            });
        }

    },

    uploadAvatar: function (req, res) {
        //Configurar el modulo multiparty(middleware) routes/user.js

        //Recoger el fichero de la petición
        var file_name = 'Avatar no subido...';

        if (!req.files) {
            //Devolver una respuesta
            return res.status(404).send({
                status: 'error',
                message: file_name
            });
        }

        //Conseguir el nombre y la extensión del archivo
        //var file_path es para sacar la ruta completa del archivo subido
        var file_path = req.files.file0.path;
        /* El split es una función de javascript que sirve para romper un string, en este cas el
        string de la ruta del archivo, que esta separado por \\ dobles barras en el caso de windows ya
        que en mac o linus es/\, y con todo esto logramos sacar el nombre del fichero */
        var file_split = file_path.split('\\');

        // ** Advertencia ** En linux o mac
        // var file_split = file_path.split('/');
        //Clase número 154 master en web full stack sesión 40

        //Nombre del archivo
        var file_name = file_split[2];

        //Extensión del archivo
        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];


        //Comprobar extensión(solo imagenes), si no es valida borrar fichero subido
        if (file_ext != 'png' && file_ext != 'jpg' && file_ext != 'jpeg' && file_ext != 'gif') {
            //fs.unlink sirve para eliminar ese archivo que no queremos que se envie
            //En este caso algo que no sea una imagen
            fs.unlink(file_path, (err) => {
                return res.status(500).send({
                    status: 'Error',
                    message: "La extensión del archivo no es valida",
                    file: file_ext
                });

            });

        } else {

            //Sacar el id del usuario identificado
            var userId = req.user.sub;

            //Buscar y actualizar documento de la base de datos
            User.findOneAndUpdate({ _id: userId }, {image: file_name}, { new: true }, (err, userUpdated) => {
                if (err || !userUpdated) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al guardar el usuario'
                    });
                }

                //Devolver una respuesta
                return res.status(200).send({
                status: 'success',
                user: userUpdated
            });

            });
        }
    },

    avatar: function(req, res){
        var fileName = req.params.fileName;
        var pathFile = './uploads/users/'+fileName;

        fs.exists(pathFile, (exists) => {
           if(exists){
               return res.sendFile(path.resolve(pathFile));
           }else{
            return res.status(404).send({
                message: 'La imagen no existe'
           });
        }
        });


    },

    getUsers: function(req, res){
        User.find().exec((err, users) => {
         if(err || !users){
            return res.status(200).send({
                status: 'error',
                message: 'No hay usuarios para mostrar'
            });
         }

         return res.status(200).send({
            status: 'success',
            users
        });

        });
    },

    getUser: function(req, res){
         var userId = req.params.userId;

     //El metodo exec es para ejecutar la consulta y sacar los resultados dentro de una funcion de callback
         User.findById(userId).exec((err, user) => {
            if(err || !user){
                return res.status(404).send({
                    status: 'error',
                    message: 'No existe el usuario'
                });
             }

             return res.status(200).send({
                status: 'success',
                user
            });
         });
    }



};

module.exports = controller;
