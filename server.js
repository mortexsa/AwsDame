// server.js
// where your node app starts
const User = require('./User.js');
// Configuration de la base de donnée
//console.log('mongodb');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const htmlspecialchars = require('htmlspecialchars');
const passwordHash = require('password-hash');
const sanitize = require('mongo-sanitize');

// URL de connexion
// Standard URI format: mongodb://[dbuser:dbpassword@]host:port/dbname, details set in .env
var url = 'mongodb+srv://'+process.env.USER+':'+process.env.PASS+'@'+process.env.HOST+'/'+process.env.DB;
// Nom de la Base de Donnée
const dbName = 'AwsDame';
// Creer un new MongoClient
const client = new MongoClient(url, {useNewUrlParser: true});
// Utilisation de la methode connect pour se connecter a la base de donnée
client.connect(function(err) {
  assert.equal(null, err);
  console.log("Connected successfully to server");

  //const db = client.db(dbName);
});


// init project
const express = require('express');
const bodyP = require('body-parser');
require('express-async-errors');
var http = require('http');
var ws = require('ws');
const app = express();
app.use(bodyP.json());
app.use(bodyP.urlencoded({ extended: false }));

const consolidate = require('consolidate');
app.engine('html', consolidate.nunjucks);
app.set('view engine', 'nunjucks');
//app.set('views', 'views');
// session
var session = require('express-session');
// on active les cookies
const cookieP = require('cookie-parser');
app.use(cookieP());
app.use(session({
    secret: '12345',
    resave: false,
    saveUninitialized: false,
}));

// Websocket
// We attach express and ws to the same HTTP server
var server = http.createServer(app);
var wsserver = new ws.Server({ 
    server: server,
});


// We define the WebSocket logic
wsserver.on('connection', function(wsconn) {
    console.log('Received new WS connection');
    var myuser = null;
    var initialisation = false;
    /*if(myuser !== null )//&& !initialisation)
    {
      initialisation =true;
      //myuser.setWSocket(wsconn);
      
       //console.log('soket '+wsconn);
    }*/
    /*f(myuser !== null)
    {
      userConnecter();
    }*/
    wsconn.on('message', function(data)
    {
      
      
      //userConnecter();
      let recu = JSON.parse(data);//ibra t la ?
      //console.log(initialisation);
      if(recu['type'] == 'userName')
      {
        myuser = new User(recu['message'].pseudo,
                          recu['message'].email,
                          recu['message'].partieGagner,
                          recu['message'].partiePerdu,
                          recu['message'].partieJouer,
                          wsconn);
        listeDesUserConnecter[recu['message'].pseudo] = myuser;
        //console.log(myuser);
        userConnecter();
      }
      else if(recu['type'] == 'defi')
      {
        console.log('défi réçu pour '+recu['message']);
        //console.log('de '+listeDesUserConnecter[recu['message']]);
        //console.log('invite '+listeDesUserConnecter[recu['this']].invite(listeDesUserConnecter[recu['message']]));
        //console.log('lui qui invite '+listeDesUserConnecter[recu['this']].getPseudo());
        //console.log('linviter '+listeDesUserConnecter[recu['message']].getPseudo());
        if(myuser.invite(listeDesUserConnecter[recu['message']]))
        {
          console.log('envoi du défi au concerner');
          //console.log('get soket '+listeDesUserConnecter[recu['message']].getWSocket());
          listeDesUserConnecter[recu['message']].wsconn.send(JSON.stringify({ type: 'defi',
                                                                                   message: myuser.getPseudo()
                                                                                  }));
        }
      }
      else if(recu['type'] == 'defiAccepter')
      {
        console.log('défi accepter reçu pour '+ recu['message']);
        //console.log(listeDesUserConnecter[recu['message']]);
        myuser.wsconn.send(JSON.stringify({ type: 'defiAccepter', message: recu['this']}));
        // mise a jour de la liste des user
        //userConnecter();
      }else if (recu['type'] == 'defiRefuser')
      {
        console.log('defi Refuser accepter reçu pour '+recu['message']);
        listeDesUserConnecter[recu['message']].wsconn.send(JSON.stringify({ type: 'defiRefuser', message: recu['this']}));
      }
      else
      {
        userConnecter();
      }
    });
    // etc...
    wsconn.on('close', function()
    {
      
    });
  
  
    function update(){
        // Broadcast to everyone else.
    wsserver.clients.forEach(function (client) {
      /*(client !== wsconn && client.readyState === ws.OPEN)*/
      if (client.readyState === ws.OPEN) {
        client.send(JSON.stringify({ type: 'defiAccepter', message: listeDesUserConnecter['testtest'].getPseudo()}));
      }
    });
  }

  
  // Broadcast to all.
  wsconn.broadcast = function broadcast(data) {
    wsconn.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });  
  };


});
//ibra t la ????? je qoi ?  mais gros je vien de "appeler repond put !!!!!:
function userConnecter(){
    // Broadcast to everyone else.
    wsserver.clients.forEach(function (client) {
      /*(client !== wsconn && client.readyState === ws.OPEN)*/
      if (client.readyState === ws.OPEN) {
        client.send(JSON.stringify({type: 'userConnecter', message: listeUser(listeDesUserConnecter)}));
      }
    }); 
  }
/*async function userConnecter()
{
  wsserver.clients.forEach(async function (client) {
    /*(client !== wsconn && client.readyState === ws.OPEN)*/
    /*if (client.readyState === ws.OPEN)
    {
      const db = client.db(dbName);
      //let liste = await db.collection('UserConnecter');
      let user = await db.collection('User');
        user.find({$or: [{pseudo: 'bobo'}, {email: 'kiki@gmail.com'}]}).toArray(function(err, resultat)
        {
          if(err)
          {
              assert.send(err);
          }
          else if(resultat.length)
          {
            //console.log("dans serveur");
            let liste = [];
            liste [0]= resultat[0].pseudo;
            liste[1] = resultat[1].pseudo;
            client.send(JSON.stringify({type: 'userConnecter', listUser: liste}));
          }
        });  
    }
  }); 
}*/

function listeUser(dic)
{
  let maListe = [];
  let i = 0;
  for(let x in dic)
  {

      maListe[i++] = dic[x].pseudo;
    
  }
  return maListe;
}

var listeDesUserConnecter = {};
// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use('/',express.static('public'));


// on ajoute des routes vers l'url /
app.get('/', function(req, res)
{
  res.render('connexion.html');
  //res.render('liste.html');
  //res.sendFile(__dirname + '/public/liste.html');
});
app.post('/', async function(req, res)
{
  var email = sanitize(req.body.email);
  var password = sanitize(req.body.password);
  const db = client.db(dbName);
  let user = await db.collection('User');
  //user.findOne({'email':{"$gt":""},'password':{"$gt":""}},function(err,data){ // injection mongodb
  // Evite une injection mongodb
  user.findOne({'email': { $in: [email] }/*,'password': { $in: [password] }*/},async function(err,resultat)
  {
    
    if(err){res.send(err);}
    else if(resultat && passwordHash.verify(password,resultat.password))
    {
      
      // socket
      //let myuser = new User(resultat.pseudo,resultat.email);
      /*let userConnecter = await db.collection('UserConnecter');
      userConnecter.insertOne({user: myuser
                              }, function(err)
                              {
                                assert.equal(null, err);
                              });*/
        //console.log('myuser '+myuser);
        //listeDesUserConnecter[myuser.pseudo] = myuser;

        wsserver.on('connection', function(wsconn)
        {
          let myuser = new User(resultat.pseudo,
                                resultat.email,
                                resultat.partieGagner,
                                resultat.partiePerdu,
                                resultat.partieJouer,);
          wsconn.personName = resultat.pseudo;
          //listeDesUserConnecter[myuser.pseudo] = myuser;
          wsconn.send(JSON.stringify({ type: 'connect', message: myuser }));
        });

        res.redirect('/userConnecter');
    }
    else
    {
          //res.send('Wrong Username Password Combination');
      res.render('connexion.html', {message1: 'Impossible de ce connecter', message2: 'Email ou mot de passe incorrect'});
    }
  });
 
});

//liste des user connecter
app.get('/userConnecter',async function(req, res) {
  const db = client.db(dbName);
  let userConnecter = await db.collection('UserConnecter');
  let liste = await userConnecter.find({}).toArray( function(err, resultat2)
      {
        if(err){res.send(err);}
        //console.log('resultat '+resultat2[0].user.pseudo);
        //listeDesUserConnecter = resultat2;
      });
  res.render('liste.html');
});
app.get('/userDeconnecter',async function(req, res) {
  const db = client.db(dbName);
  let userDeconnecter = await db.collection('UserConnecter');
  let liste = await userDeconnecter.deleteOne({user: 'myuser'});
  //let i = listeDesUserConnecter.indexOf(myuser.getPseudo());
  //listeDesUserConnecter.splice(i,1);
  if(listeDesUserConnecter['myuser.pseudo'].getWSocket())
  {
    listeDesUserConnecter['myuser.pseudo'].supprimeWSocket();
  }
  
  listeDesUserConnecter['myuser.pseudo'].initState();
  delete listeDesUserConnecter['myuser.pseudo'];
  res.redirect('/');
});

// on ajoute des routes vers l'url /inscription
app.get('/inscription', function(req, res) {
  res.render('inscription.html')
});
app.post('/inscription', async function(req, res) {
  //On retire les caracteres speciaux (les balise em strong etc, pour eviter l'injection)
  req.body.pseudo = htmlspecialchars(req.body.pseudo);
  req.body.email = htmlspecialchars(req.body.email);
  req.body.password = htmlspecialchars(req.body.password);
  req.body.password2 = htmlspecialchars(req.body.password2);
  
  if(req.body.password.length > 0 && req.body.password2.length > 0 && req.body.pseudo.length > 0 && req.body.email.length >0){
    if(req.body.password.length >5 && req.body.password2.length > 5 && req.body.password === req.body.password2) {
      const db = client.db(dbName);
      let user = await db.collection('User');
      if(req.body.pseudo.length > 4 && req.body.pseudo.length < 21){
        var reg = new RegExp("^[a-zA-Z0-9._-]{4,20}$"); 
        if(reg.test(req.body.pseudo)){

        user.find({pseudo: req.body.pseudo}).toArray(async function(err, resultat1)
        {
          if(err){res.send(err);}
          else if(!resultat1.length)
          {
            var reg2 = new RegExp("^[a-zA-Z0-9._-]+@[a-z0-9._-]{2,}\.[a-z]{2,4}$");
            if(reg2.test(req.body.email)){
              user.find({email: req.body.email}).toArray(async function(err, resultat2)
              {
                if(err){res.send(err);}
                else if(!resultat2.length)
                {
                  
                  let insert = await db.collection('User');
                  insert.insertOne({pseudo: req.body.pseudo,
                                    email: req.body.email,
                                    password: passwordHash.generate(req.body.password),
                                    partieGagner: 0,
                                    partiePerdu: 0,
                                    partieJouer: 0
                                    }, function(err)
                                  {
                                    assert.equal(null, err);
                                  });
                  //res.render('index.html', {'test': resultat});
                  res.redirect('/');
              //res.render('index.html', {'test': resultat });
                }
                else
                {
                  res.render('inscription.html', {massageEmail: 'Cet email est déjà utilisé',
                                                  pseudo: req.body.pseudo,
                                                  email: req.body.email,
                                                  password: req.body.password,
                                                  password2: req.body.password2
                                                 });
                }

              });
            } else {
              res.render('inscription.html', {massageEmail: 'Email non valide.',
                                                  pseudo: req.body.pseudo,
                                                  email: req.body.email,
                                                  password: req.body.password,
                                                  password2: req.body.password2
                                                 });
            }
          }
          else
          {
            res.render('inscription.html', {messagePseudo: 'Ce pseudo est déjà réserver',
                                            pseudo: req.body.pseudo,
                                            email: req.body.email,
                                            password: req.body.password,
                                            password2: req.body.password2
                                           });
          }
        });
        }else {
          res.render('inscription.html', {messagePseudo: 'Entrez un pseudo valide (chiffre et letre uniquement)',
                                            pseudo: req.body.pseudo,
                                            email: req.body.email,
                                            password: req.body.password,
                                            password2: req.body.password2
                                           });
        }
      } else {
        res.render('inscription.html', {messagePseudo: 'Le pseudo doit contenir entre 5 et 20 caractères.',
                                            pseudo: req.body.pseudo,
                                            email: req.body.email,
                                            password: req.body.password,
                                            password2: req.body.password2
                                           });
      }
    }
    else if(req.body.password !== req.body.password2)
    {
      res.render('inscription.html', {messagePassword: 'Confirmation du mot de passe incorrecte',
                                      pseudo: req.body.pseudo,
                                      email: req.body.email,
                                      password: req.body.password,
                                      password2: req.body.password2
                                      });
    }
    else if(req.body.password.length < 5 || req.body.password.length > 25){
      res.render('inscription.html', {messagePassword: 'Le mot de passe doit contenir entre 6 et 25 caractères',
                                      pseudo: req.body.pseudo,
                                      email: req.body.email,
                                      password: req.body.password,
                                      password2: req.body.password2
                                      });
    }
  }
  else
  {
    res.render('inscription.html', {messagePassword: 'Tout les champs sont obligatoires.',
                                      pseudo: req.body.pseudo,
                                      email: req.body.email,
                                      password: req.body.password,
                                      password2: req.body.password2
                                      });
  }
});

// on ajoute des routes vers l'url /jeu
app.get('/jeu', function(req, res){
  res.render('jeu.html');
});

// on ajoute des routes vers l'url /index
app.get('/index', async function(req, res){
  const db = client.db(dbName);
  let user = await db.collection('User');
  //user.find({$or: [{pseudo: 'testtest'}, {email: 'kiki@gmail.com'}]}).toArray(function(err, resultat){
  user.find({}).toArray(function(err, resultat){
    if(err){
      res.send(err);
    }else if(resultat.length)
    {
     res.render('index.html', {'test': resultat});
    }
  });
});

  
  
  
//})


server.listen(process.env.PORT);
// listen for requests :)
/*const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});*/
