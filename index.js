'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = process.env.PORT || 3999;

/* Este mongoose.set se pone para que el useFindAndModify que era de versiones antiguas de 
mongoose ya no se utilize ya que despues al actualizar un usuario funcionara pero dara un error
en la consola, para desactivarlo se pone en false  */
mongoose.set('useFindAndModify', false);
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/api_rest_node_tienda', {useNewUrlParser: true, useUnifiedTopology: true})
                .then(() =>{
                    console.log('Conexión exitosa!!!');

                    //Crear el servidor
                    app.listen(port, () => {
                        console.log('El servidor que cree funciona correctamente');
                    });
                })
                .catch(error => console.log(error));