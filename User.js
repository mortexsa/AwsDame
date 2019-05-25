const Dames = require('./dames.js');
class User
{
  // Varialbe
  // Constructeur
  constructor(dictionnaire)
  {
    this.pseudo = dictionnaire.pseudo;
    this.email = dictionnaire.email;
    this.wsconns = {};
    this.jeux = {};
    this.state = 'AVAILABLE';   // An internal state
    this.partieGagner = dictionnaire.partieGagner;
    this.partiePerdu = dictionnaire.partiePerdu;
    this.partieJouer = dictionnaire.partieJouer;
  }
  getJeu(){
    return this.jeu;
  }
  // set le websocket The WS connection to the user browser
  setWSocket(wsconn)
  {
    this.wsconn = wsconn;       // The WS connection to the user browser
    this.state = 'AVAILABLE';   // An internal state
  }
  setState(state)
  {
    this.state = state;
  }
  
  
  // methode
  
  partieGagner()
  {
    this.partieGagner++;
  }
  
  PartiePerdu()
  {
    this.partiePerdu++;
  }
  
  partieJouer()
  {
    this.partieJouer = this.partieGagner + this.partiePerdu;
  }
  
  // inviter un adversaire a un défi
  invite(adversaire)
  { console.log('dans invite');
  console.log(adversaire);
    if(adversaire !== this && !this.jeux[adversaire.pseudo])
    {
      return true;
    }
    return false;
  }

  lancerDefi(adversaire)
  {
    if(!this.jeux[adversaire.pseudo]);//adversaire.state === this.state && this.state === 'AVAILABLE')
    {
      this.state = 'PLAYING';
      adversaire.state = 'PLAYING';
      let dame = new Dames('#dame', adversaire, this);
      this.jeux[adversaire.pseudo] = dame;
      adversaire.jeux[this.pseudo] = dame;
      return dame;
    }
    return null;
  }
  
  // on quite le jeu
  quiter(adversaire)
  {
    if(this.state === 'PLAYING')
    {
      //console.log('jeu '+this.jeux[adversaire.pseudo])
      this.jeux[adversaire.pseudo].quiter();
      return true;
    }
    return false;
  }

  // description
  toJSON()
  {
    return {
              pseudo: this.pseudo,
              email: this.email,
              partieGagner: this.partieGagner,
              partiePerdu: this.partiePerdu,
              partieJouer: this.partieJouer,
              state: this.state,
          }
  }
}


module.exports = User;