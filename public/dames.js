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
    this.pionCliquer = {"column":null,"row":null,"status": 0};
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
        this.echiquier[i][j] = 0;
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
          this.echiquier[i][j] = 2;
        }
        else if(i%2 === 1 && j%2 === 0)
        {
          this.echiquier[i][j] = 2;
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
          this.echiquier[i][j] = 1;
        }
        else if(i%2 === 1 && j%2 === 0)
        {
          this.echiquier[i][j] = 1;
        }
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
        let colour = this.echiquier[i][j];
        if (colour)
        {
          div.className = 'player' + colour;
        }
        
        
        if((i%2 === 0 && j%2 === 0) || (i%2 === 1 && j%2 === 1))
        {
          td.className = 'blanc';
        }
        else 
        {
          td.className = 'noir';
        }
        if(this.pionCliquer.status === 1 && this.pionCliquer.row === i && this.pionCliquer.column == j) {
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
    
    if(this.echiquier[row][column] === 0 && this.pionCliquer.status === 1) {
      let diffCordonneeY = row - this.pionCliquer.row;
      let diffCordonneeX = column - this.pionCliquer.column;
      if(Math.abs(diffCordonneeX) === 1 &&  ((diffCordonneeY === 1 && this.echiquier[this.pionCliquer.row][this.pionCliquer.column] === 2) || (diffCordonneeY === -1 && this.echiquier[this.pionCliquer.row][this.pionCliquer.column] === 1))) {
        this.echiquier[row][column] = this.echiquier[this.pionCliquer.row][this.pionCliquer.column];
        this.echiquier[this.pionCliquer.row][this.pionCliquer.column] = 0;
        this.pionCliquer.status = 0;
        this.pionCliquer.row = null;
        this.pionCliquer.column = null;
        this.tour = (this.tour % 2) + 1;
      }
    }
    else if(this.tour == this.echiquier[row][column]) {
      this.pionCliquer.status = 1;
      this.pionCliquer.row = row;
      this.pionCliquer.column = column;
    }
  }
  
  /* la gection du clic */
  handle_click(event)
  {
    // Vérifier si la partie est encore en cours
    if (this.gagnant !== null) {
  		if (window.confirm("Game over!\n\nDo you want to restart?")) {
  			this.initialisation();
        this.render();
			}
			return;
    }
  
/****** j'ai pas encore regarder ********/
	  let column = event.target.dataset.column;
    let row = event.target.dataset.row;
  	if (column !== undefined && row !== undefined) {
      column = parseInt(column);
      row = parseInt(row);
      this.play(column,row);
      
      this.render();
      //console.log(this.pionCliquer.row);
      
    }
  }
}

// On initialise le plateau et on visualise dans le DOM
// (dans la balise d'identifiant `game`).
let dame = new Dames('#dame');

