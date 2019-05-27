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
var sess_storage = session({ 
    secret: "12345",
    resave: false,
    saveUninitialized: false,
});
app.use(sess_storage);
// Websocket
// We attach express and ws to the same HTTP server
var server = http.createServer(app);
var wsserver = new ws.Server({ 
    server: server,
    verifyClient: function(info, next) {
        sess_storage(info.req, {}, function(err) {
            if (err) {
                next(false, 500, "Error: " + err);
            } else {
                // Pass false if you want to refuse the connection
                next(true);
            }
        });
    },
});


// We define the WebSocket logic
wsserver.on('connection', function(wsconn, req) {
    console.log('Received new WS connection ');
    //console.log('session ' , req.session);
    //req.session.adversaire = 'un test';
    //console.log('session ' , req.session);
    var myuser = null;
    if(req.session.pseudo)
    {
      myuser = new User(req.session);
      wsconn.send(JSON.stringify({ type: 'nomUser', message: myuser.pseudo }));
      //myuser = new User(req.session);
      /*listeDesUserConnecter[myuser.pseudo] = myuser;*/
      if(!listeDesUserConnecter[myuser.pseudo])
      {
        listeDesUserConnecter[myuser.pseudo] = myuser;
      }
      else
      {
        myuser = listeDesUserConnecter[myuser.pseudo];
      }
      
      //console.log('myuser '+myuser);
      userConnecter();
    }
    wsconn.on('message', function(data)
    {
      let recu = JSON.parse(data);
      if(recu['type'] == 'init')
      {
        if(myuser && myuser.pseudo)
        {
          console.log('dans init ');
          listeDesUserConnecter[myuser.pseudo].wsconns[recu['message']] = wsconn;
          myuser = listeDesUserConnecter[myuser.pseudo];
          userConnecter();
        }
      }
      else if(recu['type'] == 'defi')
      {
        console.log('défi réçu pour '+ recu['message']);
        if(listeDesUserConnecter[myuser.pseudo].invite(listeDesUserConnecter[recu['message']]))
        {
          console.log('envoi du défi au concerner');
          send(listeDesUserConnecter[recu['message']].wsconns, 'client',{ type: 'defi',
                                                                              message: myuser.pseudo
                                                                        });
        }
        else
        {
            send(listeDesUserConnecter[myuser.pseudo].wsconns, 'client',{ type: 'dejaEnDefi',
                                                                              message: recu['message']
                                                                        });
        }
        userConnecter();
      }
      else if(recu['type'] == 'defiAccepter')
      {
        console.log('défi accepter reçu pour '+ recu['message']);
        //console.log('myuser '+myuser.pseudo);
        listeDesUserConnecter[myuser.pseudo].jeux[recu['message']] = myuser.lancerDefi(listeDesUserConnecter[recu['message']]);
        if(listeDesUserConnecter[myuser.pseudo].jeux[recu['message']])
        {
          send(listeDesUserConnecter[recu['message']].wsconns, 'client',{ type: 'defiAccepter',
                                                                            message: myuser.pseudo
                                                                        });
          send(listeDesUserConnecter[myuser.pseudo].wsconns, 'client',{ type: 'defiAccepter',
                                          message: recu['message']
                                        });
          enDefi(myuser, listeDesUserConnecter[recu['message']]);
        }
        else
        {
          send(myuser.wsconns, 'client',{ type: 'erreuServeur',
                                        });
        }
        // mise a jour de la liste des user
        userConnecter();
      }else if (recu['type'] == 'defiRefuser')
      {
        console.log('defi Refuser reçu pour '+recu['message']);
        send(listeDesUserConnecter[recu['message']].wsconns, 'client',{ type: 'defiRefuser',
                                                                        message: myuser.pseudo
                                                                      });
        userConnecter();
      }
      else if(recu['type'] == 'quiter')
      {
        if(listeDesUserConnecter[myuser.pseudo].quiter(listeDesUserConnecter[recu['message']]))
        {
          send(listeDesUserConnecter[myuser.pseudo].wsconns, recu['message'],{ type: 'quiter', message: recu['message']});
          //send(listeDesUserConnecter[recu['message']].wsconns, myuser.pseudo,{ type: 'aquiter', message: myuser.pseudo});
          
          //defiTermier(myuser.pseudo, recu['message']);
          //console.log('envoi du mesg quiter');
        }
        else
        {
          send(listeDesUserConnecter[myuser.pseudo].wsconns, 'client',{ type: 'pasEnDefi', message: recu['message']});
        }
        userConnecter();
      }
      else if(recu['type'] == 'confQuiter')
      {
        send(listeDesUserConnecter[recu['message']].wsconns, myuser.pseudo,{ type: 'aquiter', message: myuser.pseudo});
        send(listeDesUserConnecter[recu['message']].wsconns, 'client',{ type: 'quiter', message: myuser.pseudo});
        send(listeDesUserConnecter[myuser.pseudo].wsconns, 'client',{ type: 'quiter', message: recu['message']});
        miseAjourUserPerdant(myuser.pseudo);
        miseAjourUserGagnat(recu['message']);
        miseAjourBD(client, listeDesUserConnecter[myuser.pseudo]);
        miseAjourBD(client, listeDesUserConnecter[recu['message']]);
        defiTermier(myuser.pseudo, recu['message']);
        userConnecter();
      }
      else if(recu['type'] === 'deplacement')
      {
          console.log('joueur1 '+listeDesUserConnecter[myuser.pseudo].jeux[recu['contre']]);
        if(listeDesUserConnecter[myuser.pseudo].jeux[recu['contre']])
        {
          if((listeDesUserConnecter[myuser.pseudo].jeux[recu['contre']].joueur1.pseudo == myuser.pseudo && listeDesUserConnecter[myuser.pseudo].jeux[recu['contre']].tour == 1) ||
            (listeDesUserConnecter[myuser.pseudo].jeux[recu['contre']].joueur2.pseudo == myuser.pseudo && listeDesUserConnecter[myuser.pseudo].jeux[recu['contre']].tour == 2)){
            listeDesUserConnecter[myuser.pseudo].jeux[recu['contre']].play(recu['x'], recu['y']);
            if(listeDesUserConnecter[myuser.pseudo].jeux[recu['contre']].winner()){
              //on doit sauvegarder dans la bdd, c'est ok :)
              console.log("ayajahnid: "+listeDesUserConnecter[myuser.pseudo].jeux[recu['contre']].gagnant);
              
              send(listeDesUserConnecter[myuser.pseudo].wsconns, recu['contre'],{ type: 'gagnant', message: myuser.pseudo, win: 1,
                                              echiquier: listeDesUserConnecter[myuser.pseudo].jeux[recu['contre']].echiquier,
                                              pionCliquer: listeDesUserConnecter[myuser.pseudo].jeux[recu['contre']].pionCliquer
                                            });
              send(listeDesUserConnecter[recu['contre']]
                    .wsconns, listeDesUserConnecter[myuser.pseudo].pseudo,{ type: 'perdant', message: myuser.pseudo, win: 0,
                                              echiquier: listeDesUserConnecter[myuser.pseudo].jeux[recu['contre']].echiquier,
                                              pionCliquer: listeDesUserConnecter[myuser.pseudo].jeux[recu['contre']].pionCliquer
                                            });
              miseAjourUserGagnat(myuser.pseudo);
              miseAjourUserPerdant(recu['contre']);
              miseAjourBD(client, listeDesUserConnecter[myuser.pseudo]);
              miseAjourBD(client, listeDesUserConnecter[recu['contre']]);
              defiTermier(myuser.pseudo, recu['contre']);
              
            }
            else 
            {
              send(listeDesUserConnecter[recu['contre']]
                      .wsconns, listeDesUserConnecter[myuser.pseudo].pseudo,{ type: 'deplacement',
                                                message: myuser.pseudo,
                                                echiquier: listeDesUserConnecter[myuser.pseudo].jeux[recu['contre']].echiquier,
                                                pionCliquer: listeDesUserConnecter[myuser.pseudo].jeux[recu['contre']].pionCliquer
                                            });
              console.log('contre '+ listeDesUserConnecter[recu['contre']].pseudo);
              
              send(listeDesUserConnecter[myuser.pseudo].wsconns, recu['contre'],{ type: 'deplacement',
                                                    message: recu['contre'],
                                                    echiquier: listeDesUserConnecter[myuser.pseudo].jeux[recu['contre']].echiquier,
                                                    pionCliquer: listeDesUserConnecter[myuser.pseudo].jeux[recu['contre']].pionCliquer
                                            });
              console.log('moi '+ myuser.pseudo);
            }
         }
        }
        else
        {

        }
        userConnecter();
      }
      else if(recu['type'] === 'deconnexion')
      {
        if(myuser != null)
        {
          delete listeDesUserConnecter[myuser.pseudo];
        }
        userConnecter();
      }
      else
      {
        userConnecter();
      }
    });
    //
    wsconn.on('close', function()
    {
      if(myuser != null)
      {
        //delete listeDesUserConnecter[myuser.pseudo];
      }
      userConnecter();
    });

});

const send = (wsconns, id, data) => wsconns[id].send(JSON.stringify(data));

function miseAjourUserPerdant(myuser)
{
  listeDesUserConnecter[myuser].partiePerdu++;
  listeDesUserConnecter[myuser].partieJouer++;
  /*console.log('perdu '+listeDesUserConnecter[myuser].partiePerdu);
  console.log('jouer '+listeDesUserConnecter[myuser].partieJouer);*/
}
function miseAjourUserGagnat(myuser)
{
  listeDesUserConnecter[myuser].partieGagner++;
  listeDesUserConnecter[myuser].partieJouer++;
  /*console.log('gagner '+listeDesUserConnecter[myuser].partieGagner);
  console.log('jouer '+listeDesUserConnecter[myuser].partieJouer);*/
}

function miseAjourBD(client, myuser)
{
  const db = client.db(dbName);
  let user = db.collection('User');
  user.updateOne({pseudo: myuser.pseudo},{$set:{partieGagner: myuser.partieGagner, 
                                              partiePerdu: myuser.partiePerdu, 
                                              partieJouer: myuser.partieJouer
                                             }
                                       });
  console.log('mise a jour');
}
function userConnecter()
{
    // Broadcast to everyone else.
    wsserver.clients.forEach(function (client) {
      /*(client !== wsconn && client.readyState === ws.OPEN)*/
      if (client.readyState === ws.OPEN) {
        client.send(JSON.stringify({type: 'userConnecter', message: listeUser(listeDesUserConnecter)}));
      }
    }); 
}

function defiTermier(user1, user2)
{
  wsserver.clients.forEach(function (client) {
      /*(client !== wsconn && client.readyState === ws.OPEN)*/
    delete listeDesUserConnecter[user1].wsconns[user2]
    delete listeDesUserConnecter[user1].jeux[user2]
    delete listeDesUserConnecter[user2].wsconns[user1]
    delete listeDesUserConnecter[user2].jeux[user1]
      if (client.readyState === ws.OPEN) {
        client.send(JSON.stringify({ type: 'defiTerminer',
                                              message2: user2,
                                              message1: user1
                                            }));
      }
    });
}

function enDefi(user1, user2)
{
  wsserver.clients.forEach(function (client) {
      /*(client !== wsconn && client.readyState === ws.OPEN)*/
      if (client !== user1.wsconns.client && client !== user2.wsconns.client  && client.readyState === ws.OPEN) {
        client.send(JSON.stringify({ type: 'enDefi',
                                              message2: user2.pseudo,
                                              message1: user1.pseudo
                                            }));
      }
    });
}

function tout(wsconns)
{
  for(let i in wsconns)
  {
    wsconns[i].send(JSON.stringify({ type: 'TEST'}));
  }
}

function listeUser(dic)
{
  let maListe = [];
  let i = 0;
  for(let x in dic)
  {

      //maListe[i++] = dic[x].pseudo;
      maListe[i++] = dic[x];
    
  }
  return maListe;
}

var listeDesUserConnecter = {};
// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.


//******************************************************** routes *****************************************************************
// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));


// on ajoute des routes vers l'url /
app.get('/', function(req, res)
{
  //console.log('session ' + req.session.pseudo);
  if(req.session.pseudo)
  {
    res.redirect('/userConnecter');
  }
  else
  {
    res.render('connexion.html');
  }
  
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
      req.session.pseudo = resultat.pseudo;
      req.session.email = resultat.email;
      req.session.partieGagner = resultat.partieGagner;
      req.session.partiePerdu = resultat.partiePerdu;
      req.session.partieJouer = resultat.partieJouer;
      
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
app.get('/userConnecter', function(req, res) {
  /*const db = client.db(dbName);
  let userConnecter = await db.collection('UserConnecter');
  let liste = await userConnecter.find({}).toArray( function(err, resultat2)
      {
        if(err){res.send(err);}
        //console.log('resultat '+resultat2[0].user.pseudo);
        //listeDesUserConnecter = resultat2;
      });*/
  if(req.session.pseudo)
  {
    res.render('liste.html', {pseudo: req.session.pseudo, profil: req.session});
  }
  else
  {
    res.redirect('/');
  }
  
});
app.get('/userDeconnecter', function(req, res) {
  /*const db = client.db(dbName);
  let userDeconnecter = await db.collection('UserConnecter');
  let liste = await userDeconnecter.deleteOne({user: 'myuser'});
  */
  if(req.session.pseudo)
  {
    delete listeDesUserConnecter[req.session.pseudo];
    req.session.destroy();
  }
  res.redirect('/');
});

app.get('/profil', function(req, res) {
  if(req.session.pseudo)
  {
    let user = listeDesUserConnecter[req.session.pseudo];
    req.session.pseudo = user.pseudo;
    req.session.email = user.email;
    req.session.partieGagner = user.partieGagner;
    req.session.partiePerdu = user.partiePerdu;
    req.session.partieJouer = user.partieJouer;
    res.render('profil.html', {pseudo: req.session.pseudo, profil: req.session});
  }
  else{
    res.render('connexion.html');
    //res.redirect('/');
  }
});

app.get('/changePassword', function(req, res) {
  if(req.session.pseudo)
  {
    res.render('changePassword.html', {pseudo: req.session.pseudo, profil: req.session});
  }
  else{
    res.render('connexion.html');
  }
});
app.get('/apropos', function(req, res) {
  if(req.session.pseudo)
  {
    res.render('lessons/slideAws/index.html', {pseudo: req.session.pseudo, profil: req.session});
  }
  else{
    res.render('connexion.html');
  }
});


app.post('/changePassword', async function(req, res) {
  if(req.session.pseudo)
  {
    var password1 = sanitize(req.body.password_change);
    var password2 = sanitize(req.body.sec_password_change);
    let pseudo = sanitize(req.session.pseudo);
    if(password1.length > 5 && password1.length < 25){
      if(password1 === password2){
        const db = client.db(dbName);
        let user = await db.collection('User');
        user.findOne({pseudo: { $in: [pseudo] }},async function(err,resultat)
        {

          if(err){res.send(err);}
          else if(resultat && !passwordHash.verify(password1,resultat.password))
          {
            const db = client.db(dbName);
            let user =db.collection('User');
            user.updateOne({pseudo: pseudo},{$set:{password: passwordHash.generate(password1)}});
            res.render('changePassword.html', {message2: "Mot de passe moidifier avec succes"});
          }
          else
          {

            res.render('changePassword.html', {message: "Veuillez inserer un mot de passe différent de l'ancien"});
          }
        });
      }
      else {
          res.render('changePassword.html', {message: 'Veuillez inserer des mots de passe identique'});
      }
    } else {
      res.render('changePassword.html', {message: 'Le mot de passe doit contenir entre 6 et 25 caractères'});
    } 
  }
    
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
  res.render('jeuClient.html', {moi: req.session.pseudo});
});


server.listen(process.env.PORT);
























// on ajoute des routes vers l'url /index
/*app.get('/index', async function(req, res){
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
*/

// listen for requests :)
/*const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});*/ // a toutyuser.pseudo]