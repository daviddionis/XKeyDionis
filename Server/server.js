const express=require('express');
  const server=express();
  const bodyParser=require('body-parser');
  var resultado_encontrado=false;
  var palabras_alertantes='';
  var fs = require('fs');
  var obj = fs.readFileSync('palabrasclaves.txt', 'utf8');
  var palabrasArray=[];
  const MongoClient = require('mongodb').MongoClient;
  const url = 'mongodb+srv://[usuari]:[contrasenya]@cluster0-m5ji3.mongodb.net/admin';
  var date=new Date();

  server.use(express.static('public'));

  const credenciales={
    username:'root',
    password: 'ATSAHLAER'
  }

  const collection1='registro_datos';
  
  server.use(bodyParser.urlencoded({extended: false}));
  server.use(bodyParser.json());

  server.listen(80, function(){
    console.log('XKeyDionis is runing');
  });
  
  server.post('/coleccion', function(req,res){
    MongoClient.connect(url, function(err, db) {

      if (err) throw err;
      var dbo = db.db('mydb');
      var query= {Alerta: true};

      dbo.collection(collection1).find(query).toArray(function(err, result) {
        var finalhtml='<h1>XKeyDionis</h1><h2>Resultados: </h2><a onClick="window.history.back();" style="text-decoration: underline blue; color: blue;">Go Back</a><hr>';
          if (err) throw err;
        if(result.length==0){
            finalhtml+='<h3>Ningún resultado encontrado</h3>';
          }
        else if(result.length==1){
            finalhtml+='<h3>Un solo resultado encontrado</h3><br><b>IP:</b> '+result[0].IP+'<br><b>Date:</b> '+result[0].Date+'<br><b>Time:</b> '+result[0].Time+'<br><b>Data:</b> '+result[0].Data;
          }
        else{
          
          for(var i=0; i<result.length; i++){
            finalhtml+='<h3>Resultado número '+(i+1)+':</h3>'+'<b>IP:</b> '+result[i].IP+'<br><b>Date:</b> '+result[i].Date+'<br><b>Time:</b> '+result[i].Time+'<br><b>Data:</b> '+result[i].Data+'<br><br>';
          }
          
        }
        finalhtml+='<h5 style="bottom: 0%; text-bottom: right; right: 15px; position: fixed; ">by <a href="https://gitlab.com/dionislabs">DionisLabs</a></h5>';
        anadirAlLog('El analista con IP '+req.body.ip_user+' ha soliticado ver los datos que contengan alertas por la presencia de palabras peligrosas.');
        res.send(finalhtml);
        db.close();
      });
    });
  });

  server.get('/', function(req,res){
    res.sendFile(__dirname+'/login.html');  
  });

  server.post('/login', function(req, res){
    if(req.body.user.toString()==credenciales.username && req.body.pass.toString()==credenciales.password){
      var txtlogin='Nueva sesión iniciada desde la IP: '+req.body.ip_user+'.';
      console.log(txtlogin);
      anadirAlLog(txtlogin);
      res.sendFile(__dirname + '/index.html');
    }else{
      var txtlogin='Intento de inicar sesión fallido desde la IP: '+req.body.ip_user+'.';
      console.log(txtlogin);
      anadirAlLog(txtlogin);
      res.sendFile(__dirname+'/passerror.html');
    }

  });

  server.post('/ip', function(req,res){
    res.sendFile(__dirname+'/ip.html');
  });

  server.post('/metadata', function(req, res){
    res.sendFile(__dirname+'/metadata.html');
  });

  server.post('/anadir', function(req,res){
    res.sendFile(__dirname+'/anadir.html');
  });

  server.post('/peticion_ip', function(req,res){

    var ip_solicitada=req.body.user_ip;
    var fecha_solicitada=req.body.fecha;

    if(fecha_solicitada==''){
      MongoClient.connect(url, function(err, db) {

        if (err) throw err;
        var dbo = db.db('mydb');
        var query= {IP: ip_solicitada}

        dbo.collection(collection1).find(query).toArray(function(err, result) {
          var finalhtml='<h1>XKeyDionis</h1><h2>Resultados: </h2><a onClick="window.history.back();" style="text-decoration: underline blue; color: blue;">Go Back</a><hr>';
          if (err) throw err;
          if(result.length==0){
              finalhtml+='<h3>Ningún resultado encontrado</h3>';
            }
          else if(result.length==1){
              finalhtml+='<h3>Un solo resultado encontrado</h3><br><b>IP:</b> '+result[0].IP+'<br><b>Date:</b> '+result[0].Date+'<br><b>Time:</b> '+result[0].Time+'<br><b>Data:</b> '+result[0].Data;
            }
          else{
            
            for(var i=0; i<result.length; i++){
              finalhtml+='<h3>Resultado número '+(i+1)+':</h3>'+'<b>IP:</b> '+result[i].IP+'<br><b>Date:</b> '+result[i].Date+'<br><b>Time:</b> '+result[i].Time+'<br><b>Data:</b> '+result[i].Data+'<br><br>';
            }
          }
          anadirAlLog('El analista con IP '+req.body.ip_user+' ha hecho una solicitud de datos sobre la IP '+ip_solicitada+' con la siguiente razon: '+req.body.razon+'.');
          finalhtml+='<h5 style="bottom: 0%; text-bottom: right; right: 15px; position: fixed; ">by <a href="https://gitlab.com/dionislabs">DionisLabs</a></h5>';
          res.send(finalhtml);
          db.close();

        });
      });
    }
    else if(fecha_solicitada!=''){
      MongoClient.connect(url, function(err, db) {

        if (err) throw err;
        var dbo = db.db('mydb');
        var query= {IP: ip_solicitada, Date: fecha_solicitada}

        dbo.collection().find(query).toArray(function(err, result) {

          if (err) throw err;
          console.log(result);
          res.send(result);
          db.close();

        });
      });
    }else{
      res.send('Troubleshoot');
    }
  });

  server.post('/peticion_metadata', function(req,res){


    MongoClient.connect(url, function(err, db) {

      if (err) throw err;
      var dbo = db.db('mydb');
      var query= {Data: {$regex:'.*'+req.body.metadata}}

      dbo.collection(collection1).find(query).toArray(function(err, result) {
        var finalhtml='<h1>XKeyDionis</h1><h2>Resultados: </h2><a onClick="window.history.back();" style="text-decoration: underline blue; color: blue;">Go Back</a><hr>';
          if (err) throw err;
          if(result.length==0){
              finalhtml+='<h3>Ningún resultado encontrado</h3>';
            }
          else if(result.length==1){
              finalhtml+='<h3>Un solo resultado encontrado</h3><br><b>IP:</b> '+result[0].IP+'<br><b>Date:</b> '+result[0].Date+'<br><b>Time:</b> '+result[0].Time+'<br><b>Data:</b> '+result[0].Data;
            }
          else{
            
            for(var i=0; i<result.length; i++){
              finalhtml+='<h3>Resultado número '+(i+1)+':</h3>'+'<b>IP:</b> '+result[i].IP+'<br><b>Date:</b> '+result[i].Date+'<br><b>Time:</b> '+result[i].Time+'<br><b>Data:</b> '+result[i].Data+'<br><br>';
            }
          }
          anadirAlLog('El analista con IP '+req.body.ip_user+' ha hecho una solicitud de datos sobre la palabra '+req.body.metadata+' con la siguiente razon: '+req.body.razon+'.');
          finalhtml+='<h5 style="bottom: 0%; text-bottom: right; right: 15px; position: fixed; ">by <a href="https://gitlab.com/dionislabs">DionisLabs</a></h5>';
          res.send(finalhtml);
          db.close();
      });
    });
  });

  server.post('/peticion_anadir',function(req,res){
    var obj = fs.readFileSync('palabrasclaves.txt', 'utf8');
    fs.writeFileSync('palabrasclaves.txt', (obj.toString()+req.body.metadata.toString()), 'utf-8');
    obj = fs.readFileSync('palabrasclaves.txt', 'utf8');
    var finalhtml='<h1>XKeyDionis</h1><h2>Resultados: </h2><a onClick="window.history.back();" style="text-decoration: underline blue; color: blue;">Go Back</a><hr>';
    finalhtml+='<h3>Palabras en la base de datos: </h3>' +obj.toString();
    finalhtml+='<h5 style="bottom: 0%; text-bottom: right; right: 15px; position: fixed; ">by <a href="https://gitlab.com/dionislabs">DionisLabs</a></h5>';
    anadirAlLog('El analista con IP '+req.body.ip_user+' ha hecho añadido '+req.body.metadata.toString()+' a la lista de palabras peligrosas.');
    res.send(finalhtml);
  });

  server.get('/new_data', function(req, res){
    palabrasArray=obj.toLowerCase().split(';');
    for(var i=0; i<=palabrasArray.length-1; i++){
        var numero=(req.body.data).toLowerCase().search(palabrasArray[i]);
        if(numero==-1){
            resultado_encontrado=false;
        }else if(numero>-1){
            resultado_encontrado=true;
            palabras_alertantes+='| Palabra ('+palabrasArray[i]+') alertante en el caracter numero '+numero+' ';
        }
    }
    palabras_alertantes=palabras_alertantes.replace('| Palabra () alertante en el caracter numero 0 ', ''); 
    if(resultado_encontrado){
        console.log('Palabra/s alertantes encontrada/s:');
        console.log(palabras_alertantes);
    }else if(!resultado_encontrado){
        console.log('Palabras alertantes no encontradas.');
    }
    res.send('Recibido');
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("mydb");

      var myobj = {
          IP: req.body.ip,
          Date: getDateInUTC(),
          Time: getTimeInUTC(),
          Data: req.body.data,
          Alerta: resultado_encontrado,
          PalAle: palabras_alertantes
      };

      console.log('New data received from the IP '+ req.body.ip+':'+req.body.data);
      dbo.collection(collection1).insertOne(myobj, function(err, res) {
        if (err) throw err;
        console.log("Data inserted in the DataBase");
        db.close();
      });
    });

  });
  
  server.post('/camsol', function(req,res){
    res.sendFile(__dirname+'/camsol.html');
  });
  
  server.post('/vispal', function(req, res){
    palabrasArray=obj.toLowerCase().split(';');
    anadirAlLog('El analista con IP '+req.body.ip_user+' ha hecho una consulta a la lsita de palabras peligrosas.');
    var finalhtml='<h1>XKeyDionis</h1><h2>Lista de palabras peligrosas</h2><a onClick="window.history.back();" style="text-decoration: underline blue; color: blue;">Go Back</a><hr>';
    for(var i=0; i<=palabrasArray.length-2; i++){
      finalhtml+='<p>'+(i+1)+'. '+palabrasArray[i]+'</p>';
    }
    finalhtml+='<h5 style="bottom: 0%; text-bottom: right; right: 15px; position: fixed; ">by <a href="https://gitlab.com/dionislabs">DionisLabs</a></h5>';
    res.send(finalhtml);
  });

  server.post('/peticion_camsol', function(req,res){
    var finalhtml='<h1>XKeyDionis</h1><h2>WebCam de la IP ' +req.body.user_ip+'.</h2><a onClick="window.history.back();" style="text-decoration: underline blue; color: blue;">Go Back</a><hr>';
    finalhtml+='<img id="imagen" src="'+req.body.user_ip+'.jpg">';
    finalhtml+='<h5 style="bottom: 0%; text-bottom: right; right: 15px; position: fixed; ">by <a href="https://gitlab.com/dionislabs">DionisLabs</a></h5>';
    res.send(finalhtml);
  });

  server.get('*', function(req,res){
    res.sendFile(__dirname+'/404.html');
  });

  function getTimeInUTC(){
    return String(date.getUTCHours()+':'+date.getUTCMinutes()+':'+date.getUTCSeconds());
  }

  function getDateInUTC(){
    if((parseInt(date.getUTCMonth())+1)>=10){
      return String(date.getUTCDate()+'/'+(parseInt(date.getUTCMonth())+1)+'/'+date.getUTCFullYear());
    }
    else if((parseInt(date.getUTCMonth())+1)<=9){
      return String(date.getUTCDate()+'/0'+(parseInt(date.getUTCMonth())+1)+'/'+date.getUTCFullYear());
    }
  }

function anadirAlLog(texto){
    var finaltxtlog = fs.readFileSync('log.txt', 'utf8');
    finaltxtlog+='\r\n'+getTimeInUTC()+': '+texto;
    fs.writeFileSync('log.txt', finaltxtlog, 'utf-8');
}
