class User
{
  // Varialbe
  // Constructeur
  constructor(pseudo, email,partieGagner, partiePerdu, partieJouer,wsconn)
  {
    this.pseudo = pseudo;
    this.email = email;
    this.wsconn = wsconn;       // The WS connection to the user browser
    this.state = 'AVAILABLE';   // An internal state
    this.partieGagner = 0;
    this.partiePerdu = 0;
    this.partieJouer = 0;
  }
  
  // Getter
  // get le pseudo
  getPseudo()
  {
    return this.pseudo;
  }
  // get l'email
  getEmail() {
    return this.email;
  }
  // get le nombre de partie Gagner
  getPartieGagner() {
    return this.partieGagner;
  }
  // get le nombre de partie Perdu
  getPartiePerdu() {
    return this.partiePerdu;
  }
  // get le nombre de partie Jouer
  getPartieJouer() {
    return this.partieJouer;
  }
  getState()
  {
    return this.state;
  }
  getWSocket()
  {
    return this.wsconn;
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
    if(adversaire !== this /*&& adversaire.getState === this.getState && this.getState === 'AVAILABLE'*/)
    {
      this.setState('PLAYING');
      adversaire.setState('PLAYING');
      return true;
    }
    return false;
  }
  supprimeWSocket()
  {
    this.wsconn = '';       // The WS connection to the user browser
  }
  initState()
  {
    this.state = 'AVAILABLE';   // An internal state
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