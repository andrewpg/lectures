var log = console.log;
var dir = __dirname;
var fs = require('fs');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var Pg = require('pg').Client;
var conString = "postgres://postgres:123456@website/nodejs";

var main_2 = function(){
    log('new app runned');

    var user={};
    var pg = new Pg(conString);
  //  pg.on('drain', pg.end.bind(pg));
    pg.connect();

     var app_server = express();

    app_server.use('/public', express.static('public'));
    app_server.use(session({secret: 'epam'}));
 //   app_server.use(express.bodyParser());
    app_server.use(bodyParser.json());
    app_server.use(bodyParser.urlencoded({extended: true}));


    app_server.get('/', function(req,res){
        if (user.authorized) {
            res.send(redirectTemplate);  Log('redir to main')
        } else {
            res.redirect('/login.html');  Log('not logged')
        }
    });

    app_server.get('/main.page', function(req,res){
        fs.readFile(dir + '/views/index.html',function(err, file) {
            res.end(file, 'binary');
        });
    });

    app_server.get('/login.html', function(req,res){
        fs.readFile(dir + '/views/login.html',function(err, file) {
            res.end(file, 'binary');
        });
    });

    app_server.get('/api/users', function(req, res){  log('in users')
        var query = pg.query('select id, trim(both \' \' from "firstName") as "firstName" , trim(both \' \' from "lastName") as "lastName" from node.users order by id', function(err, result){
            var json = JSON.stringify(result.rows);
            res.send(json);
        });
    });

    app_server.get('/api/whoami', function(req, res){
        user = req.session;
        log('asked as'+user.name)
        res.end('{hi: ' + user.name + '}');
    });

    app_server.get('/api/login', function(req, res){
        user = req.session;
        user.name = req.query.name;
        user.authorized = true;
        //res.end('hello, ' + user.myname + ' and ');
        res.end('done');
        log('authorized as'+user.name)
    });

    app_server.get('/api/logout', function(req, res){
        user = req.session;
        var uname = user;
        req.session.destroy();
        if (uname.authorized) {
            res.end('session of ' + uname.name + ' is over!');
            user.authorized = false;
       //     res.redirect('/login.html');
        } else {
            res.end('You should login before');
        }
    });

    app_server.post('/api/users', function(req, res){
        req.on('data', function(x) {  Log(x)
            var ndata = JSON.parse(x);
            var queryText = 'insert into node.users("firstName", "lastName", company, position, email, "phoneNumber") values ($1, $2, $3, $4, $5, $6) returning *';  log(queryText)
            pg.query(queryText, Object.keys(ndata).map(function(k) {log(ndata[k]);return ndata[k];}), function(err, result){   Log(err)
                res.json(result.rows);
            });
        });
    });

    app_server.delete('/api/users/:id', function(req, res){
        var query = pg.query("delete from node.users where id = $1", req.params['id']);
        res.end();
    });

    app_server.get('/api/users/:id', function(req, res){
        var query = pg.query("select * from node.users where id=$1", [req.params['id']], function(err, result){
            res.send(result.rows[0]);
        })
    });

    app_server.put('/api/users/:id', function(req, res){
       // log(req.params.length)
      //  var a = req.body.company;
       // log('a= '+a);
        //for(x in req.params) {log(x)}
       // for(x in req) {console.log(x + " + " + req[x])}
        req.on('data', function(x) {
            var ndata = JSON.parse(x);
            var data = Object.keys(ndata).map(function(k) {return ndata[k];});
            var queryText = 'update node.users set ("firstName", "lastName", company, position, email, "phoneNumber") = ($2, $3, $4, $5, $6, $7) where id = $1';
            pg.query(queryText, data);
            var query = pg.query("select * from node.users where id=$1", [req.params['id']], function(err, result){
                res.json(result.rows);
            });
        });
    });
    return app_server;
};

var initialize = function() {
    console.log('app was initialized!');
};

exports.appServer = main_2;
exports.initialize = initialize;

var redirectTemplate = [
    '<!DOCTYPE html>',
    '<html>',
    '  <head>',
    '     <meta http-equiv="refresh" content="0;URL=/main.page">',
    '  <head>',
    '</html>'
].join('\n');

