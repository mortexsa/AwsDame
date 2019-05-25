class Dames
{
  // Varialbe
  // Constructeur
  constructor(element_id, joueur1, joueur2, ligne=10, colonne=10)
  {
    this.joueur1 = joueur1;
    this.joueur2 = joueur2;
     // Nombre de lignes et de colonnes
    this.ligne = ligne;
    this.colonne = colonne;
    this.nbPion = 20;
    this.obliger = false;
    //le pion choisi par le joueur
    this.pionCliquer = {"column":null,"row":null,"status": 0,"obligatoire":false};
    // cet tableau à deux dimensions contient l'état du jeu:
    //   0: case vide
    //   1: pion du joueur 1
    //   2: pion du joueur 2
    this.initialisation();
    // un entier: 1 ou 2 (le numéro du prochain joueur)
    this.tour = 1;
    // Nombre de coups joués
    this.coupsJouer = 0;
    /* un entier indiquant le gagnant:
        null: la partie continue
           0: la partie est nulle
           1: joueur 1 a gagné
           2: joueur 2 a gagné
    */
    this.gagnant = null;
    // L'élément du DOM où se fait l'affichage
//    this.element = document.querySelector(element_id);
    // On ajoute le gestionnaire d'événements pour gérer le click
    //
    // Pour des raisons techniques, il est nécessaire de passer comme gestionnaire
    // une fonction anonyme faisant appel à `this.gerer_click`. Passer directement
    // `this.gerer_click` comme gestionnaire, sans wrapping, rendrait le mot clef
    // `this` inutilisable dans le gestionnaire. Voir le "binding de this".
//    this.element.addEventListener('click', (event) => this.handle_click(event));
    // On fait l'affichage
//    this.render();
  }
  // Initialisation du jeu
  initialisation()
  {
    this.echiquier = [];
    for(let i=0; i<this.ligne; i++)
    {
      this.echiquier[i] = [];
      
      for(let j=0; j<this.colonne; j++)
      {
        this.echiquier[i][j] = {"type":0 , "dame":false, "possible":0, "obligatoire":0 };
      }
    }
    this.initiJour1();
    this.initiJour2();
    this.coupsJouer = 0;
    this.gagnant = null;
    console.log(this.echiquier);
  }
  
  initiJour2()
  {
    for(let i=0; i<(this.nbPion * 2)/this.ligne; i++)
    {
      for(let j=0; j<this.colonne; j++)
      {
        if(i%2 === 0 && j%2 === 1)
        {
          this.echiquier[i][j].type = 2;
        }
        else if(i%2 === 1 && j%2 === 0)
        {
          this.echiquier[i][j].type = 2;
        }
      }
    }
  }
  initiJour1()
  {
    for(let i=this.ligne-1; i>=this.ligne - (this.nbPion * 2)/this.ligne; i--)
    {
      for(let j=0; j<this.colonne; j++)
      {
        if(i%2 === 0 && j%2 === 1)
        {
          this.echiquier[i][j].type = 1;
        }
        else if(i%2 === 1 && j%2 === 0)
        {
          this.echiquier[i][j].type = 1;
        }
      }
    }
  }
  
  initPossibilite()
  {
    for (let i = 0; i<this.ligne; i++) {
      for (let j = 0; j < this.colonne; j++) {
        this.echiquier[i][j].possible = 0;
      }
    }    
  }
  initObligatoire()
  {
    for (let i = 0; i<this.ligne; i++) {
      for (let j = 0; j < this.colonne; j++) {
        this.echiquier[i][j].obligatoire = 0;
      }
    }    
  }
  
  /* Affiche le plateau de jeu dans le DOM */
/*  render()
  {
    let table = document.createElement('table');
    for (let i = 0; i<this.ligne; i++)
    {
      let tr = table.appendChild(document.createElement('tr'));
      //console.log('ligne');
      for (let j = 0; j < this.colonne; j++)
      {
        //console.log('colonne');
        let td = tr.appendChild(document.createElement('td'));
        let div = td.appendChild(document.createElement('div'));
        let colour = this.echiquier[i][j].type;
        if (colour)
        {
          if(this.echiquier[i][j].dame){
            div.className = 'dames' + colour;    
          } else { 
            div.className = 'player' + colour;
          }
        }
        
        
        if((i%2 === 0 && j%2 === 0) || (i%2 === 1 && j%2 === 1))
        {
          td.className = 'blanc';
        }
        else 
        {
          td.className = 'noir';
        }
        if(this.echiquier[i][j].possible === 1) {
          td.style["background-color"] = "red";
        }
        if(this.pionCliquer.status === 1 && this.pionCliquer.row === i && this.pionCliquer.column === j) {
          td.style["background-color"] = "#919190";
        }
        div.dataset.column = j;
        div.dataset.row = i;
      }
    }
    this.element.innerHTML = '';
    this.element.appendChild(table);
  }
*/  
  play(column,row){
    //if(this.tour)
    if(this.pionCliquer.status === 1 && this.echiquier[row][column].type === 0) {
      if(!this.echiquier[this.pionCliquer.row][this.pionCliquer.column].dame){ 
        if(!this.pionCliquer.obligatoire) {
          this.deplacementSimplePion(column,row);
        } else {
          this.priseParPion(column,row);
        }  
      } else {
        if(!this.pionCliquer.obligatoire) {
          this.deplacementSimpleDame(column,row);
        } else {
          this.priseParDame(column,row);
        } 
      }
      this.obligatoire = false;
      this.initObligatoire();
    } else if(this.tour === this.echiquier[row][column].type && !this.pionCliquer.obligatoire && !this.obliger) {
      this.pionCliquer.status = 1;
      this.pionCliquer.row = row;
      this.pionCliquer.column = column;
      if(!this.echiquier[this.pionCliquer.row][this.pionCliquer.column].dame) {
        this.pionCliquer.obligatoire = this.estPriseObligatoirePion();
      } else {
        //dame
        this.pionCliquer.obligatoire = this.estPriseObligatoireDame();
      }
      //this.initObligatoire();
    }else if (this.tour === this.echiquier[row][column].type && this.obliger){
      if(this.echiquier[row][column].obligatoire == 1){
        this.initPossibilite();
        this.pionCliquer.status = 1;
        this.pionCliquer.row = row;
        this.pionCliquer.column = column;
        if(!this.echiquier[this.pionCliquer.row][this.pionCliquer.column].dame) {
          this.pionCliquer.obligatoire = this.estPriseObligatoirePion();
        } else {
          //dame
          this.pionCliquer.obligatoire = this.estPriseObligatoireDame();
        }
        
      }
    }
    this.obliger = this.deplacementObligatoire();
    this.estDame();
  }
  
  deplacementObligatoire() {
    let compt = false;
     for(let i=0; i<this.ligne; i++)
    {
      for(let j=0; j<this.colonne; j++)
      {
        if(this.echiquier[i][j].type === this.tour){
          if(i+2 < this.ligne && j+2 < this.colonne)
          {
            if(this.echiquier[i+1][j+1].type === (3-this.tour) &&
            this.echiquier[i+2][j+2].type === 0) {
              this.echiquier[i][j].obligatoire = 1;
              compt = true;
            }
          }
          if(i-2 >= 0 && j-2 >= 0)
          {
            if(this.echiquier[i-1][j-1].type === (3-this.tour) &&
            this.echiquier[i-2][j-2].type === 0) {
              this.echiquier[i][j].obligatoire = 1;
              compt = true;
            }
          }
          if(i+2 < this.ligne && j-2 >= 0)
          {
            if(this.echiquier[i+1][j-1].type === (3-this.tour) &&
            this.echiquier[i+2][j-2].type === 0) {
              this.echiquier[i][j].obligatoire = 1;
              compt = true;
            }
          }
          if(i-2 >= 0 && j+2 < this.colonne) {
            if(this.echiquier[i-1][j+1].type === (3-this.tour) &&
            this.echiquier[i-2][j+2].type === 0) {
              this.echiquier[i][j].obligatoire = 1;
              compt = true;
            }
          }
          if(this.echiquier[i][j].dame){
            let r,c;
            for(let a=0; a<4; a++){
              switch(a){
                case 0: r=1;c=1; break;
                case 1: r=-1;c=-1; break;
                case 2: r=1;c=-1; break;
                default: r=-1;c=1; break;
              }
              let y = i+r;
              let z = j+c;
              while(y < this.ligne && y >= 0 && z < this.colonne && z >= 0) {
                if(this.echiquier[y][z].type === this.tour){
                  break;
                }else if(this.echiquier[y][z].type === (3-this.tour)) {
                  y += r;
                  z += c;
                  if(y < this.ligne && y >= 0 && z < this.colonne && z >= 0 && this.echiquier[y][z].type === 0) {
                    this.echiquier[i][j].obligatoire = 1;
                    compt = true;
                  }
                }
                y += r;
                z += c;
              }
            }
          }
        }
      }
    }
    return compt;
  }
  
  estDame() {
    for (let j = 0; j < this.colonne; j++) {
      if(this.echiquier[0][j].type === 1) {
        this.echiquier[0][j].dame = true;
      }
      if(this.echiquier[this.ligne-1][j].type === 2) {
        this.echiquier[this.ligne-1][j].dame = true;
      }
    }
  }
  
  deplacementSimpleDame(column,row) {
    let PasY = (row - this.pionCliquer.row) / Math.abs(row - this.pionCliquer.row);
    let PasX = (column - this.pionCliquer.column) / Math.abs(column - this.pionCliquer.column);
    let i = this.pionCliquer.row + PasY;
    let j = this.pionCliquer.column + PasX;
    if(Math.abs(row - this.pionCliquer.row) === Math.abs(column - this.pionCliquer.column)) {
      while(i !== row+PasY && j !== column+PasX) {   
        if(this.echiquier[i][j].type === 1 || this.echiquier[i][j].type === 2) {
          return false;
          break;
        }
        i += PasY;
        j += PasX;
      }

      this.echiquier[row][column].type = this.echiquier[this.pionCliquer.row][this.pionCliquer.column].type;
      this.echiquier[row][column].dame = true;
      this.echiquier[this.pionCliquer.row][this.pionCliquer.column].type = 0;
      this.echiquier[this.pionCliquer.row][this.pionCliquer.column].dame = false;
      this.pionCliquer.status = 0;
      this.pionCliquer.row = null;
      this.pionCliquer.column = null;
      this.tour = 3-this.tour;
      return true;
    }
  }
  
  winner(){
    let compteurJoueur1 = 0;
    let compteurJoueur2 = 0;
    for (let i = 0; i<this.ligne; i++) {
      for (let j = 0; j < this.colonne; j++) {
        if(this.echiquier[i][j].type === 1) {compteurJoueur1++;} 
        else if(this.echiquier[i][j].type === 2) {compteurJoueur2++;}
      }
    }
    if(compteurJoueur1 === 0){this.gagnant = 2; return 1;}
    else if(compteurJoueur2 === 0){this.gagnant = 1; return 1;}
    return 0;
  }
  
  priseParPion(column,row) {
    if(this.echiquier[row][column].possible === 1){
      let diffCordonneeY = (row - this.pionCliquer.row)/2;
      let diffCordonneeX = (column - this.pionCliquer.column)/2;
      this.echiquier[this.pionCliquer.row+diffCordonneeY][this.pionCliquer.column+diffCordonneeX].type = 0;
      this.echiquier[row][column].type = this.echiquier[this.pionCliquer.row][this.pionCliquer.column].type;
      this.echiquier[this.pionCliquer.row][this.pionCliquer.column].type = 0;
      this.pionCliquer.row = row;
      this.pionCliquer.column = column;
      this.initPossibilite();
      this.estDame();
      if(this.echiquier[row][column].dame){
        this.pionCliquer.obligatoire = this.estPriseObligatoireDame();
      }else {
        this.pionCliquer.obligatoire = this.estPriseObligatoirePion();
      }
      if(!this.pionCliquer.obligatoire) {   
        this.pionCliquer.status = 0;
        this.pionCliquer.row = 0;
        this.pionCliquer.column = 0;
        this.tour = 3-this.tour;
      }
    }
  }
  
  priseParDame(column,row) {
    if(this.echiquier[row][column].possible === 1){
      this.echiquier[row][column].type = this.echiquier[this.pionCliquer.row][this.pionCliquer.column].type;
      this.echiquier[row][column].dame = true;
      let PasY = (row - this.pionCliquer.row) / Math.abs(row - this.pionCliquer.row);
      let PasX = (column - this.pionCliquer.column) / Math.abs(column - this.pionCliquer.column);
      let i = this.pionCliquer.row + PasY;
      let j = this.pionCliquer.column + PasX;
      if(Math.abs(row - this.pionCliquer.row) === Math.abs(column - this.pionCliquer.column)) {
        while(i !== row+PasY && j !== column+PasX) {   
          if(this.echiquier[i][j].type !== 0) {
            this.echiquier[i][j].type = 0;
            this.echiquier[i][j].dame = false;
            break;
          }
          i += PasY;
          j += PasX;
        }
      }
      this.echiquier[this.pionCliquer.row][this.pionCliquer.column].type = 0;
      this.echiquier[this.pionCliquer.row][this.pionCliquer.column].dame = false;
      this.pionCliquer.row = row;
      this.pionCliquer.column = column;
      this.initPossibilite();
      this.pionCliquer.obligatoire = this.estPriseObligatoireDame();
      if(!this.pionCliquer.obligatoire) {   
        this.pionCliquer.status = 0;
        this.pionCliquer.row = 0;
        this.pionCliquer.column = 0;
        this.tour = 3-this.tour;
      }
    }
  }
  
  estPriseObligatoireDame() {
    let compt = false;
    let r,c;
    for(let a=0; a<4; a++){
      switch(a){
        case 0: r=1;c=1; break;
        case 1: r=-1;c=-1; break;
        case 2: r=1;c=-1; break;
        default: r=-1;c=1; break;
      }
      let i = this.pionCliquer.row+r;
      let j = this.pionCliquer.column+c;
      while(i < this.ligne && i >= 0 && j < this.colonne && j >= 0) {
        if(this.echiquier[i][j].type === this.tour){
          break;
        }else if(this.echiquier[i][j].type === (3-this.tour)) {
          i += r;
          j += c;
          while(i < this.ligne && i >= 0 && j < this.colonne && j >= 0 && this.echiquier[i][j].type === 0) {
            this.echiquier[i][j].possible = 1;
            compt = true;
            i += r;
            j += c;
          }
        }
        i += r;
        j += c;
      }
    }
    return compt;
  }
  
  estPriseObligatoirePion() {
    let compt = false;
    if(this.pionCliquer.row+2 < this.ligne && this.pionCliquer.column+2 < this.colonne)
    {
      if(this.echiquier[this.pionCliquer.row+1][this.pionCliquer.column+1].type === (3-this.tour) &&
      this.echiquier[this.pionCliquer.row+2][this.pionCliquer.column+2].type === 0) {
        this.echiquier[this.pionCliquer.row+2][this.pionCliquer.column+2].possible = 1;
        compt = true;
      }
    }
    if(this.pionCliquer.row-2 >= 0 && this.pionCliquer.column-2 >= 0)
    {
      if(this.echiquier[this.pionCliquer.row-1][this.pionCliquer.column-1].type === (3-this.tour) &&
      this.echiquier[this.pionCliquer.row-2][this.pionCliquer.column-2].type === 0) {
        this.echiquier[this.pionCliquer.row-2][this.pionCliquer.column-2].possible = 1;
        compt = true;
      }
    }
    if(this.pionCliquer.row+2 < this.ligne && this.pionCliquer.column-2 >= 0)
    {
      if(this.echiquier[this.pionCliquer.row+1][this.pionCliquer.column-1].type === (3-this.tour) &&
      this.echiquier[this.pionCliquer.row+2][this.pionCliquer.column-2].type === 0) {
        this.echiquier[this.pionCliquer.row+2][this.pionCliquer.column-2].possible = 1;
        compt = true;
      }
    }
    if(this.pionCliquer.row-2 >= 0 && this.pionCliquer.column+2 < this.colonne) {
      if(this.echiquier[this.pionCliquer.row-1][this.pionCliquer.column+1].type === (3-this.tour) &&
      this.echiquier[this.pionCliquer.row-2][this.pionCliquer.column+2].type === 0) {
        this.echiquier[this.pionCliquer.row-2][this.pionCliquer.column+2].possible = 1;
        compt = true;
      }
    }
    return compt;
  }
  
  deplacementSimplePion(column,row) {
    let diffCordonneeY = row - this.pionCliquer.row;
    let diffCordonneeX = column - this.pionCliquer.column;
    if(Math.abs(diffCordonneeX) === 1 &&  
       ((diffCordonneeY === 1 && this.echiquier[this.pionCliquer.row][this.pionCliquer.column].type === 2) || 
        (diffCordonneeY === -1 && this.echiquier[this.pionCliquer.row][this.pionCliquer.column].type === 1))) {
      this.echiquier[row][column].type = this.echiquier[this.pionCliquer.row][this.pionCliquer.column].type;
      this.echiquier[this.pionCliquer.row][this.pionCliquer.column].type = 0;
      this.pionCliquer.status = 0;
      this.pionCliquer.row = null;
      this.pionCliquer.column = null;
      this.tour = 3-this.tour; 
    }
  }
  
  /* la gection du clic */
/*  handle_click(event)
  {
*/    
/****** j'ai pas encore regarder ********/
/*	  let column = event.target.dataset.column;
    let row = event.target.dataset.row;
  	if (column !== undefined && row !== undefined) {
      column = parseInt(column);
      row = parseInt(row);
      this.play(column,row);
      this.render();
      this.winner();
      
      //console.log(this.pionCliquer.row);
      
    }
    // Vérifier si la partie est encore en cours
    if (this.gagnant !== null) {
      if(this.gagnant === 1) {
         window.alert("Player 1 wins"); 
      } else if(this.gagnant === 2) {
         window.alert("Player 2 wins"); 
      } 
  		if (window.confirm("Game over!\n\nDo you want to restart?")) {
  			this.initialisation();
        this.render();
			}
			return;
    }
  }
*/  
  // on quite je jeu
  quiter()
  {
    this.joueur1.state = 'AVAILABLE';
    this.joueur2.state = 'AVAILABLE';
    delete this.joueur1;
    delete this.joueur2;
  }
}

// On initialise le plateau et on visualise dans le DOM
// (dans la balise d'identifiant `game`).
//let dame = new Dames('#dame');

module.exports = Dames;  