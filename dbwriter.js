const PORT = process.env.PORT || 56712;
const express = require('express');
const app = express();
var s_port = 56712; //9008
var dgram = require("dgram");
var serverUDP = dgram.createSocket("udp4");
const HOST = `http://keebus.co:${PORT}`;
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert'); 
const chalk = require('chalk');
const smtpConfig = { auth: {user:'info@keebus.com'}};
const Pushover = require('node-pushover');
const ObjectId = require('mongodb').ObjectID;
const compression = require('compression');
const bodyParser = require('body-parser');

const conn = {};
conn.version = '4.00';
conn.database = 'keebus'; 
const session_protected = false;
const pushobj = new Pushover({ token: "agx4pzg6p6o9ft9zsws3in8er5w5w6",user: "umLRXk5PVBa7dWuxK4n2ye6dyDUyZF" });


const io = require('socket.io').listen(app.listen(PORT));

app.use(compression())
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
   extended: true
}));

//temp 
// serverUDP.on("listening", function() {
//     var address = serverUDP.address();
//     console.log("UDP server listening " + address.address + ":" + address.port);
// });
// serverUDP.on("message", function(msg, rinfo) {
//     msg = msg.toString();
//     console.log(`UDP ASCII: ${msg}`);
//     msg = msg.split(':');
//     io.emit(msg[0],{'idUnit':msg[0],'AI0':msg[1]});  
// });
   
// serverUDP.on("error", function(err) {
//     console.log("UDP server error: \n" + err.stack);   
//     serverUDP.close();
// });

// // Socket
// serverUDP.on("close", function() {
//     console.log("UDP server closed.");
// });

const DBserver = 'mongodb1.webrahost.eu:27017';
const url = 'mongodb://MTR_amd298374:uUeuEPjdh8398@'+ DBserver +'/'+ conn.database+'?&authSource=keebus';

const clickatellHttpStr = 'http://api.clickatell.com/http/sendmsg?user=keebus&password=testpassword001&api_id=3617778';
const clockworkAPIKey = '1c4c5947f7dde43a218236985c34f609012bd2a6';
const clockwork = require('clockwork')({key: clockworkAPIKey});
const clockworkSMS = true;

let connMongoDB = false;
let db = null;

const tools = {
    getUnixTimeObjectId: function (_id) {
      tm = _id.toString().substring(0,8);
      return parseInt(tm,16);
    },
    objectIdFromDate: function (date) {
      if (typeof(date) == 'string') date = new Date(date);
      return Math.floor(date.getTime() / 1000).toString(16) + "0000000000000000";
  //    return strTime; //{ _id: { $gt: objectIdFromDate('2013-11-01') } }
    },
    objectIdFromEpoch: function (timestamp) {
        return parseInt(timestamp).toString(16) + "0000000000000000";
    },
    timeConverter: function(tm){
      var a = new Date(tm);
      var m = a.getMinutes(); var s = a.getSeconds();
      var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      if (m<10) m = '0'+m;
      if (s<10) s = '0'+s;
      var time = a.getHours() + ':' + m + ':' + s;
      return time;
    }
}


function connectionPool() {  
    MongoClient.connect(url, {poolSize: 32}, function(err, client) {
        assert.equal(null, err);
        if (err===null)  { 
            //db = database; 
            db = client.db(conn.database);
            console.log(chalk.keyword('lime')(`Database pool ${conn.database} connected at ${DBserver}!`));
            connMongoDB = true;
         //   keebus.removeRecords('kvalues_010','110100001',{"k": "IL0","v":{$gte: 2000}});
            let smsg = 'Server connection re-started!';

            //smtpMail({to:'vicent@ibanyez.com',subject:'Alert message',text: smsg });
           // keebus.pushMsg('Keebus alert',smsg);
          //  smtpMail({to:'vicent@ibanyez.com',subject:'Alert message',text: '<p style=color:#FF2222;font-family:Arial>'+smsg+'<br/>\:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::<br/><a style=\'font-size:.8em;color:red\' href=\'keebus.co\'>keebus.co</a></p>'});
            // db.close();
            //keebus.removeRecords('kvalues_009','110090001',{"k": "AI1","v":{$gte: 2220}});
    } else {
             //fs.appendFile('server.js','//MongoDB crashed on:'+ new Date() + '\n', function (err) {});
             console.log(chalk.red(`Database pool ${conn.database} connection at ${DBserver} FAILED!`));
    }
  })
  return db; 
}
connectionPool();
 
var mailOptions = {from:'"Keebus"<'+smtpConfig.auth.user+'>'};//, to:'vicent@ibanyez.com', subject: 'Hello', text: 'Hello world', html: '<b>Hello world ✅ ⚡</b>'};
var prevnClients = 0;
var numRequest = 0;

var idDevice = 1;
console.log(chalk.yellow(`Keebus Server: ${conn.version}`));


//http://keebus.co/delay/?t=2000
app.get('/delay', function(req,res){
    // io.emit('UDPlive',{'idDevice':10000}); //just socket test here :)
    let ms = req.query.t;
    ms = (ms>5000 || isNaN(ms)) ? 500 : parseInt(ms); //default 500ms
    setTimeout((() => res.status(200).send({delay:ms})), ms);
});



const keebus = {
   IsJsonString: function(str) {
      try {
          JSON.parse(str);
      } catch (e) {
          return false;
      }
      return true;
  },
  getUnixTimeObjectId: function (_id) {
    tm = _id.toString().substring(0,8);
    return parseInt(tm,16);
  },
  getDateObjectId: function(_id) {
    return new Date(this.getUnixTimeObjectId(_id) * 1000);
  },
  objectIdFromDate: function (date) {
    if (typeof(date) == 'string') date = new Date(date);
    var strTime = Math.floor(date.getTime() / 1000).toString(16) + "0000000000000000";
    return ObjectId(strTime);
    //return consObjectId; //{ _id: { $gt: objectIdFromDate('2013-11-01') } }
  },
  dateFromObjectId: function (objectId) {
  	 return new Date(parseInt(objectId.substring(0,8),16)*1000);
  },
  getCollectionSize: (collection,cb) => {
        try {
            const thisStats = function(db) {
                db.collection(collection).stats(function(err, res) {
                    return cb({collection: collection, size: Math.round(res.size / 1048576) +'Mb'});
                });
            };
            // MongoClient.connect(url, function(err, db) {
            //     thisStats(db, function() { db.close(); });
            // })
            thisStats(db, function() { })

         } catch (e){
            connMongoDB = false; 
            connectionPool();
            keebus.pushMsg('Keebus alert','MongoClient reconnection!');
            console.log('error - new connectionPool: ' + e);
         }
    },

      updateOneRecord: function(collection, select, set){
        try{
          var updateDocument = function(db, callback) {
             db.collection(collection).updateOne(select,{$set:set}, function(err, result) {
              assert.equal(err, null);
              console.log(chalk.yellow("Document UPDATED in " + collection + " set: "));
              console.log(set);
              callback();
            });
          };
        updateDocument(db, ()=> {})

        } catch(e){
            console.log('updateOneRecord failed!');
        }
  },
  preCheckEntryKey: function(obj,keys){
      var res = 0;
      //console.log(obj);
      for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            //console.log('key: ' + key);
            if (obj.hasOwnProperty(key)) {
              if (obj[key].length<2) res++; //minimum lenght for keys should be 3!!!
            } else {
              res++;
            }
        }
      if (res>0) return false; else return true;
  },
  pushMsg: function (title, msg){
    //  pushobj = new Pushover({ token: "agx4pzg6p6o9ft9zsws3in8er5w5w6",user: "umLRXk5PVBa7dWuxK4n2ye6dyDUyZF" });
         pushobj.send(title, msg, function (err, res){
         (err) ? console.log(err) : console.log(res.status) 
      })
    }
};



//. all( for both get temporary
app.route('/request').all((req, res, next)=> {
      console.log(req.method.toUpperCase());
      if (req.method.toUpperCase() != 'POST' && req.method.toUpperCase()!='GET') res.status(200).send({403:'forbidden'});
      let q = req.query; //for get
      if (req.body.idDevice!==undefined) q = req.body;
      console.log('----------------------------------------');
      console.log(tools.timeConverter(new Date()) + ' > ' + q.idDevice);
      //console.log(q);//full request 
      //console.log('******************************************');
      //console.log('req.headers ----------->  ',req.headers);
     if (connMongoDB && q.idDevice!==undefined) {
        //get widget seetings
        var widget = {};
        //console.log('connections',db.serverStatus().connections);
        //http://keebus.co/server/public/func.html //setEvents
        var findWidgets = (db, callback)=> {
             db.collection('widgets').find({'idDevice':q.idDevice}).limit(1).toArray(function(err, res) {
              //assert.equal(err, null);
              widget = res[0];
              callback(widget);
              //inserting collection
          if (widget!==undefined) {
              var obj = {};
              var values = [];
              var eventRec = null;
              var eventThr = null;
              //console.log(q); //important for debugging widgets
              for (var key in q) {
                 if (key.toUpperCase()=="EVENT" && q[key]!=="") {
                    eventRec = q[key];
                    if (!eventRec.toLowerCase().includes('eep')) {
                        var thrEvent = eventRec.split("_"); // getting the event threshold
                        eventRec = thrEvent[0];
                        if (typeof thrEvent[1] != 'undefined') eventThr = thrEvent[1];
                    }
                    if (widget[eventRec]!==undefined) {
                      widget[eventRec].eventValue = q[eventRec];
                      //console.log(widget[eventRec]);
                   //   keebus.callAction({'idDevice':q.idDevice,'key': eventRec }, widget[eventRec], eventThr);
                      console.log(chalk.bgRed("  --->>  " +eventRec + ' ' + widget[eventRec].name  + ': ' + widget[eventRec].eventValue ));
                    }
                 }
                 //console.log(key +" - "+q.hasOwnProperty(key));
                 if (q.hasOwnProperty(key) && key!='idDevice' && key.toUpperCase()!='EVENT' && key.toUpperCase()!='TS' && key.toUpperCase()!='BFR') {
                    // console.log(key + ' - ' +typeof(widget[key]));
                    //console.log(widget[key]);
                    if (typeof(widget[key])!='undefined') {
                        // if (widget[key].hasOwnProperty('disabled')!==true) values.push({v: parseInt(q[key]), k: key});
                        if (widget[key].hasOwnProperty('disabled')!==true) values.push({v: q[key], k: key});
                    } else {
                        var osbj = {};
                        osbj[key] = {"idKey" : key.substring(0,2), "name" : key, "units" : "", "type" : "knob", "scale" : 100,"color" : "#f92a4d","min" : 0, "max" : 5000};
                        keebus.updateOneRecord('widgets',{'idDevice':q.idDevice},osbj);
                    }
                 } else {
                    //console.log(key + ' - ' +q[key]);
                    if (key.toUpperCase()=='BFR') { //buffering
                        var uri_dec = decodeURIComponent(q[key]);
                        uri_dec = uri_dec.replace(/'/g, '"');
                        var aobj = JSON.parse(uri_dec);
                        console.log(aobj);
                      }
                 }
               }
               obj.idDevice = q.idDevice;
               obj.reads = values;
               obj.idTime = new Date();
               // console insertOne
               //console.log(obj);
               var collection = 'kvalues_' + (q.idDevice).substring(2,5);

                db.collection(collection).insertOne(obj, (err)=>{
                    if(err) {
                       console.log('err',err);
                    }else{
                       numRequest++; 
                       if (eventRec!==null && eventRec!==undefined) io.emit('events',{'idDevice':q.idDevice,'event':eventRec, 'eventThr':eventThr});
                       console.log(chalk.cyan('#'+numRequest + ': Stored with _id: ' + obj._id));
                    }
                 })

             } else {
                 console.log(chalk.red('id UNDEFINED  ->  ' + req.url +' q.idDevice '+ q.idDevice));
                 if (keebus.preCheckEntryKey(q,['idDevice'])){
                    var ob = {};
                    ob.deviceID = 0;
                    for(var index in q) {
                        if (q.hasOwnProperty(index)) {
                            var attr = q[index];
                            if (index!='idDevice') {
                              //console.log(index + ' '+attr);
                              if (index.toLowerCase()!='event' && index.toLowerCase()!='ts') ob[index] = {"idKey" : index.substring(0,2), "name" : index,  "units" : "",  "type" : "knob", "scale" : 1000,"color" : "#36414f","min" : 0, "max" : 50000};
                            } else {
                              ob.idDevice = q[index];
                            }
                        }
                     }
                     console.log(ob);
                     keebus.insertRecord('widgets',ob);
                 }
             }
               // -- inserting collection
           });
        }
        findWidgets(db, function() { });
        
      } else {
        res.status(200).send([]);
      }   
  });

