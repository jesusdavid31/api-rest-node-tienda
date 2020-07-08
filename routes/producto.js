'use strict'

var express = require('express');
var ProductoController = require('../controllers/producto');

var router = express.Router();
var md_auth = require('../middlewares/authenticated');

//EL require('connect-multiparty'); sirve para montar no solo texto o números sino tambien imagenes
//= multipart({uploadDir: './uploads/users'}); es la ruta donde se van a guardar los ficheros o imagenes
var multipart = require('connect-multiparty');
var md_upload = multipart({uploadDir: './uploads/productos'});

//Rutas de productos
router.post('/guardarproducto', md_auth.authenticated, ProductoController.save);
router.get('/productos/:page?',  ProductoController.getProductos);
router.get('/producto/:id?', ProductoController.getProduct);
router.put('/producto/:id', md_auth.authenticated,ProductoController.update);
router.delete('/producto/:id', md_auth.authenticated,ProductoController.delete);
router.post('/subir-imagen-producto', [md_auth.authenticated, md_upload] , ProductoController.subirImagenProducto);

module.exports = router;