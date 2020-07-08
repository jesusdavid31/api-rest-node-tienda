'use strict'

var validator = require('validator');
var Producto = require('../models/productos');
//fs permite trabajar con el sistema de ficheros, se utiliza para no enviar algo que no sea una imagen
var fs = require('fs');
//El path es la ruta total del archivo
var path = require('path');

var controller = {

    test: function (req, res) {
        return res.status(200).send({
            message: 'Hola que tal!!'
        });
    },

    save: function (req, res) {
        //Recoger parametros por post
        var params = req.body;


        //Validar datos
        try {
            var validate_nombre = !validator.isEmpty(params.nombre);
            var validate_descripcion = !validator.isEmpty(params.descripcion);
            var validate_stock = !validator.isEmpty(params.stock);
            var validate_precio = !validator.isEmpty(params.precio);
        } catch (err) {
            return res.status(500).send({
                message: "Faltan datos por enviar"
            });
        }

        if (validate_nombre && validate_descripcion &&  validate_stock && validate_precio) {
            //Crear objeto a guardar 
            var producto = new Producto();

            //Asignar valores
            producto.nombre = params.nombre;
            producto.descripcion = params.descripcion;
            producto.stock = params.stock;
            producto.precio = params.precio;
            producto.user = req.user.sub;

            //Guardar el producto
            producto.save((err, productStored) => {
                if (err || !productStored) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'El producto no se ha guardado'
                    });
                }

                //Devolver una respuesta
                return res.status(200).send({
                    status: 'success',
                    producto: productStored
                });
            });
        } else {
            return res.status(200).send({
                message: 'Los datos no son válidos'
            });
        }
    },

    getProductos: function (req, res) {
        //Nota: la libreria de paginación va incrustada en el modelo
        //Cargar la libreria de paginación en la clase (MODELO)

        //Recoger la pagina actual
        if (!req.params.page || req.params.page == null || req.params.page == '0' || req.params.page == 0 || req.params.page == undefined) {
            var page = 1;
        } else {
            //parseInt para combertirlo a un entero
            var page = parseInt(req.params.page);
        }

        //Indicar las opciones de paginación
        /* El sort es para indicar el orden, por ejemplo si pongo 1 ordenara del mas viejo al mas 
        nuevo la paginación y si pongo -1 ordenara del mas nuevo al mas viejo */
        /* El populate sirve para cargar dentro de la propieda user el objeto completo del usuario
        que ha creado el topic */
        var options = {
            sort: { date: -1 },
            limit: 8,
            page: page
        };

        //Find paginado
        Producto.paginate({}, options, (err, productos) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al hacer la consulta'
                });
            }

            if (!productos) {
                return res.status(200).send({
                    status: 'error',
                    message: 'No hay productos'
                });
            }


            //Devolver resultado(productos, total de productos, total de paginas)
            return res.status(200).send({
                status: 'success',
                productos: productos.docs,
                totalDocs: productos.totalDocs,
                totalPages: productos.totalPages
            });
        });
    },

    getProduct: function (req, res) {
        //Sacar el id del producto de la url
        var productoId = req.params.id;

        //Find por el id del topic
        Producto.findById(productoId)
            .populate('user')
            .populate('comments.user')
            .exec((err, producto) => {

                if (err) {
                    //Devolver resultado
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error en la petición'
                    });
                }

                if (!producto) {
                    //Devolver resultado
                    return res.status(404).send({
                        status: 'error',
                        message: 'No existe este producto'
                    });
                }

                //Devolver resultado
                return res.status(200).send({
                    status: 'success',
                    producto
                });
            });
    },

    update: function (req, res) {
        //Recoger el id del topic de la url
        var productoId = req.params.id;

        //Recoger los datos que lleguen desde post
        var params = req.body;

        //Validar datos
        try {
            var validate_nombre = !validator.isEmpty(params.nombre);
            var validate_descripcion = !validator.isEmpty(params.descripcion);
            var validate_stock = !validator.isEmpty(params.stock);
            var validate_precio = !validator.isEmpty(params.precio);
        } catch (err) {
            return res.status(200).send({
                message: "Faltan datos por enviar"
            });
        }

        if (validate_nombre && validate_descripcion && validate_stock && validate_precio) {

            //Montar un json con los datos modificables
            var update = {
                nombre: params.nombre,
                descripcion: params.descripcion,
                stock: params.stock,
                precio: params.precio
            };

            //Find and update del topic por id y por id de usuario
            Producto.findOneAndUpdate({ _id: productoId , user: req.user.sub }, update, { new: true }, (err, productUpdate) => {
                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error en la petición'
                    });
                }

                if (!productUpdate) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'No se ha actualizado el producto'
                    });
                }

                //Devolver una respuesta
                return res.status(200).send({
                    status: 'success',
                    producto: productUpdate
                });

            });
        } else {
            return res.status(200).send({
                message: 'La validación de los datos no es correcta'
            });
        }

    }, 

    delete: function(req, res){
        //Sacar el id del producto de la url
        var productId = req.params.id;

        //Find and delete por productoId y por userId
        Producto.findOneAndDelete({_id: productId , user: req.user.sub}, (err, productRemoved) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la petición'
                });
            }

            if (!productRemoved) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No se ha borrado el producto'
                });
            }

            //Devolver una respuesta
            return res.status(200).send({
                status: 'success',
                producto: productRemoved
            });
        });
    },

    subirImagenProducto: function (req, res) {
        //Configurar el modulo multiparty(middleware) routes/user.js

        //Recoger el fichero de la petición
        var file_name = 'Imagen del producto no subida...';

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

            //Buscar y actualizar documento de la base de datos
            Producto.save((err, imageProduct) => {
                if (err || !imageProduct) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al guardar la imagen del producto'
                    });
                }

                //Devolver una respuesta
                return res.status(200).send({
                status: 'success',
                producto: imageProduct
            });

            });
        }
    }


};

module.exports = controller;