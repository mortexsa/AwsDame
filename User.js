class User
{
  // Varialbe
  // Constructeur
  constructor(pseudo, email)
  {
    this.pseudo = pseudo;
    this.email = email;
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
}


module.exports = User;