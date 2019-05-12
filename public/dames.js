class Dames
{
  // Varialbe
  // Constructeur
  constructor(element_id, ligne=10, colonne=10)
  {
     // Nombre de lignes et de colonnes
    this.ligne = ligne;
    this.colonne = colonne;
    this.nbPion = 20;
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
    this.element = document.querySelector(element_id);
    // On ajoute le gestionnaire d'événements pour gérer le click
    //
    // Pour des raisons techniques, il est nécessaire de passer comme gestionnaire
    // une fonction anonyme faisant appel à `this.gerer_click`. Passer directement
    // `this.gerer_click` comme gestionnaire, sans wrapping, rendrait le mot clef
    // `this` inutilisable dans le gestionnaire. Voir le "binding de this".
    this.element.addEventListener('click', (event) => this.handle_click(event));
    // On fait l'affichage
    this.render();
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
        this.echiquier[i][j] = {"type":0 , "dame":false, "possible":0};
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
  
  /* Affiche le plateau de jeu dans le DOM */
  render()
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
  
  play(column,row){
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
    } else if(this.tour === this.echiquier[row][column].type && !this.pionCliquer.obligatoire) {
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
    this.estDame();
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
    if(compteurJoueur1 === 0){this.gagnant = 2;}
    else if(compteurJoueur2 === 0){this.gagnant = 1;}
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
      this.pionCliquer.obligatoire = this.estPriseObligatoirePion();
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
    let i = this.pionCliquer.row + 1;
    let j = this.pionCliquer.column + 1;
    while(i < this.ligne && i >= 0 && j < this.colonne && j >= 0) {   
      if(this.echiquier[i][j].type === 1 || this.echiquier[i][j].type === 2) {
        i += 1;
        j += 1;
        while(i < this.ligne && i >= 0 && j < this.colonne && j >= 0 && this.echiquier[i][j].type === 0) {
          this.echiquier[i][j].possible = 1;
          compt = true;
          i += 1;
          j += 1;
        }
      }
      i += 1;
      j += 1;
    }
    i = this.pionCliquer.row - 1;
    j = this.pionCliquer.column - 1;
    while(i < this.ligne && i >= 0 && j < this.colonne && j >= 0) {   
      if(this.echiquier[i][j].type === 1 || this.echiquier[i][j].type === 2) {
        i -= 1;
        j -= 1;
        while(i < this.ligne && i >= 0 && j < this.colonne && j >= 0 && this.echiquier[i][j].type === 0) {
          this.echiquier[i][j].possible = 1;
          compt = true;
          i -= 1;
          j -= 1;
        }
      }
      i -= 1;
      j -= 1;
    }
    i = this.pionCliquer.row + 1;
    j = this.pionCliquer.column - 1;
    while(i < this.ligne && i >= 0 && j < this.colonne && j >= 0) {   
      if(this.echiquier[i][j].type === 1 || this.echiquier[i][j].type === 2) {
        i += 1;
        j -= 1;
        while(i < this.ligne && i >= 0 && j < this.colonne && j >= 0 && this.echiquier[i][j].type === 0) {
          this.echiquier[i][j].possible = 1;
          compt = true;
          i += 1;
          j -= 1;
        }
      }
      i += 1;
      j -= 1;
    }
    i = this.pionCliquer.row - 1;
    j = this.pionCliquer.column + 1;
    while(i < this.ligne && i >= 0 && j < this.colonne && j >= 0) {   
      if(this.echiquier[i][j].type === 1 || this.echiquier[i][j].type === 2) {
        i -= 1;
        j += 1;
        while(i < this.ligne && i >= 0 && j < this.colonne && j >= 0 && this.echiquier[i][j].type === 0) {
          this.echiquier[i][j].possible = 1;
          compt = true;
          i -= 1;
          j += 1;
        }
      }
      i -= 1;
      j += 1;
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
  handle_click(event)
  {
    
/****** j'ai pas encore regarder ********/
	  let column = event.target.dataset.column;
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
}

// On initialise le plateau et on visualise dans le DOM
// (dans la balise d'identifiant `game`).
let dame = new Dames('#dame');

