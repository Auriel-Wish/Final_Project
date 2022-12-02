var http = require('http');
var url = require('url');
var MongoClient = require('mongodb').MongoClient;
var uri = 'mongodb+srv://aurielwish:awish01@cluster0.f00pkos.mongodb.net/?retryWrites=true&w=majority';

client = new MongoClient(uri, {useUnifiedTopology: true});
async function del() {
    await client.connect();

    var dbo = client.db('pickup_sports');
    var users_coll = dbo.collection('users');
    await users_coll.deleteMany({});
    client.close();
}

del();