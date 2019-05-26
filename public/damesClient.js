class Dames
{
  // Varialbe
  // Constructeur
  constructor(element_id, ws, ligne=10, colonne=10)
  {
    this.ws = ws;
    this.ligne = ligne;
    this.colonne = colonne;
    this.nbPion = 20;
    this.pionCliquer = {"column":null,"row":null,"status": 0,"obligatoire":false};
    this.initialisation();
    this.gagnant = null;
    this.element = document.querySelector(element_id);
    this.element.addEventListener('click', (event) => this.handle_click(event));
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
        if(this.echiquier[i][j].obligatoire === 1){
          td.style["background-color"] = "red";
        }
        if(this.echiquier[i][j].possible === 1) {
          td.style["background-color"] = "green";
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
/*
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
  */
  
  /* la gection du clic */
  handle_click(event)
  {
    
/****** j'ai pas encore regarder ********/
	  let column = event.target.dataset.column;
    let row = event.target.dataset.row;
  	if (column !== undefined && row !== undefined) {
      column = parseInt(column);
      row = parseInt(row);
      this.ws.send(JSON.stringify({ type: 'deplacement', y: row, x: column, contre: window.name}));
      console.log('nom windows '+window.name);
      
    }
    // Vérifier si la partie est encore en cours
    /*if (this.gagnant !== null) {
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
    }*/
  }
}

// On initialise le plateau et on visualise dans le DOM
// (dans la balise d'identifiant `game`).


//module.exports = Dames;
var ws = new WebSocket('wss://' + window.location.host);
ws.addEventListener('open', function(e, req)
{
  console.log('dans jeu du nom de '+window.name);
  let dame = null;
  if(!dame)
  {
    dame = new Dames('#dame', ws);
    defi();
  }
  ws.send(JSON.stringify({ type: 'init', message: window.name }));
  ws.addEventListener('message', function(e)
  {
    console.log('message')
    var msg = JSON.parse(e.data);
    if(msg['type'] === 'deplacement')
    {
      dame.echiquier = msg['echiquier'];
      dame.pionCliquer = msg['pionCliquer'];
      dame.render();
    }
    if(msg['type'] === 'gagnant'){
      dame.gagnant = msg['win'];
      dame.echiquier = msg['echiquier'];
      dame.pionCliquer = msg['pionCliquer'];
      dame.render();
      console.log("voila zebi"+dame.gagnant);
      window.alert("Vous avez gagner !!!!");
      window.close();
      /*if(dame.gagnant === 1) {
         window.alert("Vous avez gagner !!!!"); 
      } else if(dame.gagnant === 0) {
         window.alert("Vous avez perdu :'("); 
      }*/
    }
    if(msg['type'] === 'perdant'){
      dame.gagnant = msg['win'];
      dame.echiquier = msg['echiquier'];
      dame.pionCliquer = msg['pionCliquer'];
      dame.render();
      window.alert("Vous avez perdu :'(");
      window.close();
      //console.log("voila zebi"+dame.gagnant); 
    }
    if(msg['type'] === 'quiter')
    {
      console.log('vous avez quiter le defi avec ' + msg['message']);
      //window.alert('Vous êtes déclaré perdent \n \t \t(｡-_-｡) ');
      quiterPerdant();
    }
    if(msg['type'] === 'aquiter')
    {
      console.log(msg['message'] + ' a quiter le défi');
      /*window.alert(msg['message'] + ' a quiter le défi \n Vous êtes déclaré gagnat \n \t \t(•‾⌣‾•) ');
      window.close();*/
      quiterGagnant(msg['message']);
    }
    if(msg['type'] === 'TEST')
    {
      console.log('*******************************TEST*******************************')
    }
    
  });
  
  function quiterPerdant()
  {
    if (confirm('Vous serez déclaré perdant \n \t \t(｡-_-｡) '))
    {
      ws.send(JSON.stringify({ type: 'confQuiter', message: window.name }));
      //ws.send(JSON.stringify({ type: 'initSession'}));
      window.close();
    }
  }
  function quiterGagnant(user)
  {
    window.alert(user + ' a quiter le défi \n Vous êtes déclaré gagnat \n \t \t(•‾⌣‾•) ');
    //ws.send(JSON.stringify({ type: 'initSession'}));
    window.close();
  }
  function defi()
  {
    let quiter = document.querySelector('#quiter');
    let vs = document.createElement('li');
    let a1 = vs.appendChild(document.createElement('a'));
    let liUser = document.createElement('li');
    let a2 = liUser.appendChild(document.createElement('a'));
    let li = document.createElement('li');
    let bouton = li.appendChild(document.createElement('button'));
    a1.textContent = 'vs';
    a2.textContent = window.name;
    bouton.textContent = 'Quiter';
    bouton.addEventListener('click', function(event)
                                      {
                                        ws.send(JSON.stringify({ type: 'quiter', message: window.name}));
                                      });
    quiter.appendChild(vs);
    quiter.appendChild(liUser);
    quiter.appendChild(li);
    
  }
});
