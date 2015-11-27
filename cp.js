var Pg = require('pg').Client;
var conString = "postgres://postgres:123456@website/nodejs";

var pg = new Pg(conString);
pg.connect();

app_server.get('/api/users/:id', function(req, res){
    var query = pg.query("select * from node.users where id=$1", [req.params['id']], function(err, result){
        res.send(result.rows[0]);
    })
});
