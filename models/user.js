'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Un Schema simplemente es el esquema del modelo
var UserSchema = Schema({
    name: String,
    surname: String,
    email: String,
    password: String,
    image: String,
    role: String
});

UserSchema.methods.toJSON = function(){
    var obj = this.toObject();
    delete obj.password;

    return obj;
}

module.exports = mongoose.model('User', UserSchema);
                               // lowercase y pluralizar el nombre
                               // users -> documentos(Schema)