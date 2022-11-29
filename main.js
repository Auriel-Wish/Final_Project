var http = require('http');
var url = require('url');
var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;
var uri = 'mongodb+srv://aurielwish:awish01@cluster0.f00pkos.mongodb.net/?retryWrites=true&w=majority';

client = new MongoClient(uri, {useUnifiedTopology: true});
http.createServer(async function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    path_name = url.parse(req.url, true).pathname;
    index_string = '<!DOCTYPE html><html lang="en">';
    if (path_name == '/') {
        const c1 = fs.readFileSync('./header.html');
        res.write(c1);
        res.write('<body>')
        const c2 = fs.readFileSync('./body1.html');
        res.write(c2);
        res.write('<label for="sport" style="margin-left: 20px"><strong>Sport: </strong></label><select name="sport" style="width: 120px"></select>')
        const c3 = fs.readFileSync('./body2.html');
        res.write(c3);
        res.write('</body></html>')
        res.end();
    }
    
    // await client.connect();
    // var dbo = client.db("pickup_sports");
    // var sports_collection = dbo.collection("sports_list");

    // var sports_select_tag = document.getElementsByName('sport')[0];
    // var sports_list = await sports_collection.find({}).toArray();
    // sports_select_tag.innerHTML += '<option value="All Sports">All Sports</option>';
    // for (var i = 0; i < sports_list.length; i++) {
    //     sports_select_tag.innerHTML += '<option value="' + sports_list[i].name + '">' + sports_list[i].name + '</option>';
    // }
    
    // res.end();
    // res.write('<script>alert("5")</script>');
}).listen(8080);

// async function load1() {
//     fs.readFile('./header.html', null, function(error, data) {
//         if (error) {
//             console.log('Error: ' + error);
//             return '';
//         }
//         else {
//             console.log(data.toString());
//             return data;
//         }
//     });
// }

// async function load2() {
//     return '<body>';
// }

// async function load3() {
//     fs.readFile('./body1.html', null, function(error, data) {
//         if (error) {
//             console.log('Error: ' + error);
//             return '';
//         }
//         else {
//             return data;
//         }
//     });
// }

// async function load4() {
//     fs.readFile('./body2.html', null, function(error, data) {
//         if (error) {
//             console.log('Error: ' + error);
//             return '';
//         }
//         else {
//             return data;
//         }
//     });
// }

// async function load5() {
//     return '</body></html>';
// }