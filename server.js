// server.js
// where your node app starts

// Configuration de la base de donnée
//console.log('mongodb');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// URL de connexion
// Standard URI format: mongodb://[dbuser:dbpassword@]host:port/dbname, details set in .env
//var url = 'mongodb+srv://babatche:V6DE6QPjLxUDvSo6@awsdame-a82nk.mongodb.net/test?retryWrites=true';
var url = 'mongodb+srv://'+process.env.USER+':'+process.env.PASS+'@'+process.env.HOST+'/'+process.env.DB;

// Nom de la Base de Donnée
const dbName = 'AwsDame';

// Creer un new MongoClient
const client = new MongoClient(url);

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
const app = express();
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



// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));


// on ajoute des routes vers l'url /
app.get('/', function(req, res)
{
  res.render('connexion.html')
});
app.post('/', function(req, res)
{
  if(req.session.login)
  {
    res.redirect('/');
  }
  else
  {
    res.render('connexion.html');
  }
});

// on ajoute des routes vers l'url /inscription
app.get('/inscription', function(req, res) {
  res.render('inscription.html')
});
app.post('/inscription', async function(req, res) {
  //let expReg = (/^([a-zA-Z0-9]+)$/);
  if(req.body.password === req.body.password2)
  {
    const db = await client.db(dbName);
    let user = await db.collection('User');
    user.find({pseudo: req.body.pseudo}).toArray(async function(err, resultat1)
      {
        if(err){res.send(err);}
        else if(!resultat1.length)
        {
          user.find({email: req.body.email}).toArray(async function(err, resultat2)
          {
            if(err){res.send(err);}
            else if(!resultat2.length)
            {
              let insert = await db.collection('User');
              insert.insertOne({pseudo: req.body.pseudo,
                                email: req.body.email,
                                password: req.body.password,
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
          
        }
        else
        {
          res.render('inscription.html', {messagePseudo: 'Ce login existe déjà',
                                          pseudo: req.body.pseudo,
                                          email: req.body.email,
                                          password: req.body.password,
                                          password2: req.body.password2
                                         });
        }
      });
                          
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
  else
  {
    res.render('inscription.html')
  }
});

// on ajoute des routes vers l'url /jeu
app.get('/jeu', function(req, res){
  res.render('jeu.html');
});

// on ajoute des routes vers l'url /index
app.get('/index', async function(req, res){
  const db = await client.db(dbName);
  let user = await db.collection('User');
  user.find({$or: [{pseudo: 'bobo'}, {email: 'kiki@gmail.com'}]}).toArray(function(err, resultat){
    if(err){
      res.send(err);
    }else if(resultat.length)
    {
     res.render('index.html', {'test': resultat});
    }
  });
});

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
