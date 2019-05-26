//console.log('mongodb');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

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

  const db = client.db(dbName);

  // TOUS LES INSERTION ET AUTRES (creation de table etc...)
  let user = db.collection("User");
  let userConnecter = db.collection("UserConnecter");
  
  
  /*user.insertOne({
      title: 'MongoDB Overview', 
      description: 'MongoDB is no sql database',
      by: 'tutorials point',
      url: 'http://www.tutorialspoint.com',
      tags: ['mongodb', 'database', 'NoSQL'],
      likes: 100
   }, function(err) {
  assert.equal(null, err);
  console.log("Connected successfully to bdd")});
  
  userConnecter.insertOne(
  {
    pseudo: 'cdsvsd',
    email: 'rfsdf',
    partieGagner: 0,
    partiePerdu: 0,
    partieJouer: 0
  }, function(err) {
  assert.equal(null, err);
  console.log("Connected successfully to bdd")});
  
  let list =  user.find({title : "MongoDB Overview"}).toArray();
  console.log(list);*/
  
  
  
  // Ne fermez la connexion que lorsque votre application se termine.
  client.close();
});