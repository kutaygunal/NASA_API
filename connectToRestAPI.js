const superagent = require('superagent');
const EventEmitter = require('events');
var express = require('express');
var app = express();

var emitter = new EventEmitter();

var options = { api_key: 'TqiOczV1VAYvH4ckxHK2mwBC2EIIhXuADQ1rgOTf', 
start_date: '2017-08-02',
end_date : '2017-08-02',
url : 'https://api.nasa.gov/neo/rest/v1/feed'
};

var res =  {'asteroids' : [] };

function getAstroidsWithinTheRange(arg, threshold){
    for(var key in arg) {
        for(var k in arg[key]) {
            var distance = parseFloat(arg[key][k]['close_approach_data'][0]['miss_distance']['miles']);
            if(distance < threshold)
                res['asteroids'].push(arg[key][k]['name']);
        }
    }
    emitter.emit("Finished",res);
}

emitter.on("GotResultFromNASA",(arg)=>{
    getAstroidsWithinTheRange(arg,20000000);
});

emitter.on("Finished",(arg)=>{
    app.get('/', function (req, res) {
        res.send(arg);
      });
      app.listen(3000, function () {
        console.log('Example app listening on port 3000!');
      }); 
});


function connectToNASA(){
    superagent.get(options["url"])
    .query(options)
    .end((err, res) => {
      if (err) { return console.log(err);}
       var objects = res.body["near_earth_objects"];
       emitter.emit("GotResultFromNASA",objects);
    });
}

connectToNASA();