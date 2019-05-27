 //const Dames = require('./dames.js');
// client-side js
// run by the browser each time your view template is loaded
var user = null;
var listeDesJeu = {};
var ws = new WebSocket('wss://' + window.location.host);

ws.addEventListener('open', function(e)
{
  console.log('suis la');
  ws.send(JSON.stringify({ type: 'init', message: 'client' }));
  
  let deconnexion = document.querySelector('#deconne');
  deconnexion.addEventListener('click', function(event)
                                        {
                                          ws.send(JSON.stringify({ type: 'deconnexion'}));
                                        });
  ws.addEventListener('message', function(e)
  {
    var msg = JSON.parse(e.data);
    if(msg['type'] === 'TEST')
    {
      console.log('*******************************TEST*******************************')
    }
    if(msg['type'] === 'nomUser' && !user)
    {
      user = msg['message']
    }
    else if(msg['type'] === 'userConnecter')
    {
      if(msg['message'].length > 1)
      {
        let table = document.createElement('table');
        for(let i in msg['message'])
        {
          if(msg['message'][i].pseudo !== user)
          {
            /*let li = document.createElement('li');
            let texte = document.createTextNode(msg['listUser'][i]);
            li.appendChild(texte);
            ul.appendChild(li);*/

            let tr = table.appendChild(document.createElement('tr'));
            tr.className = "userConnecter";
            let tdUser = tr.appendChild(document.createElement('td'));
            let pJouer = tr.appendChild(document.createElement('td'));
            let pGagner = tr.appendChild(document.createElement('td'));
            let pPerdu = tr.appendChild(document.createElement('td'));
            let tdBouton = tr.appendChild(document.createElement('td'));
            let bouton = tdBouton.appendChild(document.createElement('button'));
            tdUser.textContent = msg['message'][i].pseudo;
            pJouer.textContent = 'Parties jouées: '+ msg['message'][i].partieJouer;
            pGagner.textContent = 'Parties gagnées: '+ msg['message'][i].partieGagner;
            pPerdu.textContent = 'Parties perdus: ' + msg['message'][i].partiePerdu;
            bouton.id = msg['message'][i].pseudo;
            let span = bouton.appendChild(document.createElement('span'));
            span.textContent = 'Défier ';
            span.dataset.user = msg['message'][i].pseudo;
            span.id = msg['message'][i].pseudo;
            //bouton.textContent = 'Défier ';
            bouton.dataset.user = msg['message'][i].pseudo;
            if(msg['message'][i] === user)
            {
              bouton.disabled = true;
            }
          }
        }
        table.addEventListener('click', function(event)
                                        {
                                          console.log('pour '+event.target.dataset.user);
                                          ws.send(JSON.stringify({ type: 'defi', message: event.target.dataset.user }));
                                        });
        let listUser = document.querySelector('#listUser');
        listUser.innerHTML = '';
        listUser.appendChild(table);
      }
      else
      {
        let listUser = document.querySelector('#listUser');
        listUser.innerHTML = 'Aucune personne connecter';
      }
      //console.log('liste= '+e.data);
    }
    else if(msg['type'] === 'defi')
    {
      console.log('invitation réçu de '+msg['message']);
      
      let listUser = document.querySelector('#defi');
      let testTable = null;
      let defi = null;
      testTable = document.querySelector('#listDefi');
      defi = document.querySelector('#defi_'+msg['message']);
      if(testTable && !defi)
      {
        testTable.appendChild(listeDefi(msg['message']));
      }
      else
      {
        listUser.innerHTML = '';
        let table = document.createElement('table');
        table.id = 'listDefi';
        table.appendChild(listeDefi(msg['message']));
        table.addEventListener('click', function(event)
                                    {
                                      console.log('defi= ' + event.target.dataset.defi);
                                      if(event.target.dataset.defi === 'defiRefuser')
                                      {
                                        let defi = null;
                                        testTable = document.querySelector('#listDefi');
                                        defi = document.querySelector('#defi_'+msg['message']);
                                        if(defi)
                                        {
                                          //defi.innerHTML = '';
                                          testTable.removeChild(defi);
                                        }
                                      }
                                      ws.send(JSON.stringify({ type: event.target.dataset.defi, message: event.target.dataset.nomUser}));//nom user
                                    });
        listUser.appendChild(table);
      }
      
      //console.log(e.data);
    }
    else if(msg['type'] === 'defiAccepter')
    {
      console.log('défi accepter par '+ msg['message']);
      console.log('vous jouer avec ' + msg['message']);
      let testTable = document.querySelector('#listDefi');
      let endefi = document.querySelector('#listEnDefi');
      let defi = document.querySelector('#defi_'+msg['message']);
      if(testTable && defi)
      {
        //defi.innerHTML = '';
        testTable.removeChild(defi);
      }
      if(endefi)
      {
        let tru = document.createElement('tr');
        let tdUser = tru.appendChild(document.createElement('td'));
        let tdBouton = tru.appendChild(document.createElement('td'));
        let bouton = tdBouton.appendChild(document.createElement('button'));
        tdUser.textContent = msg['message'];
        tru.id = 'quiter_'+msg['message'];
        bouton.textContent = 'Quitez';
        endefi.appendChild(tru);
      }
      else
      {
        let table = document.createElement('table');
        let trh = table.appendChild(document.createElement('tr'));
        let th = trh.appendChild(document.createElement('th'));
        let tru = table.appendChild(document.createElement('tr'));
        let tdUser = tru.appendChild(document.createElement('td'));
        let tdBouton = tru.appendChild(document.createElement('td'));
        let bouton = tdBouton.appendChild(document.createElement('button'));
        th.textContent = 'Vou jouer avec:';
        tru.id = 'quiter_'+msg['message'];
        tdUser.textContent = msg['message'];
        bouton.textContent = 'Quitez';
        bouton.dataset.nomUser = msg['message'];
        table.id = 'listEnDefi';
        table.addEventListener('click', function(event)
                                      {
                                        ws.send(JSON.stringify({ type: 'quiter', message: event.target.dataset.nomUser}));//nom user
                                      });

        let listUser = document.querySelector('#jouerAvec');
        listUser.innerHTML = '';
        listUser.appendChild(table);
      }
      
      lancerJeu(msg['message']);
    }
    else if(msg['type'] === 'defiRefuser')
    {
      console.log('défi refuser par' + msg['message']) ;
      window.alert(msg['message'] + " a refusé votre défi \n \t \t(｡-_-｡)");
    }
    else if(msg['type'] === 'enDefi')
    {
      console.log(msg['message1'] + ' et ' + msg['message2'] + ' sont actuellement en défi') ;
      let endefi = null
      endefi = document.querySelector('#enDefi');
      let defi = null;
      defi = document.querySelector('#defi_'+msg['message1']+'_'+msg['message2']);
      if(endefi && !defi)
      {
        endefi.appendChild(sonEnDefi(msg['message1'], msg['message2']));
      }
      else
      {
        let table = document.createElement('table');
        let trh = table.appendChild(document.createElement('tr'));
        let th = trh.appendChild(document.createElement('th'));
        //let tru = table.appendChild(document.createElement('tr'));
        th.textContent = 'Son en défi:';
        table.id = 'enDefi';
        table.appendChild(sonEnDefi(msg['message1'], msg['message2']));
        let listUser = document.querySelector('#endefi');
        listUser.innerHTML = '';
        listUser.appendChild(table);
      }
      
      
    }
    else if(msg['type'] === 'quiter')
    {
      let endefi = document.querySelector('#listEnDefi');
      let defi = document.querySelector('#quiter_'+msg['message']);
      if(endefi && defi)
      {
        endefi.removeChild(defi);
      }
    }
    else if(msg['type'] === 'aquiter')
    {
      console.log(msg['message'] + ' a quiter le défi');
      window.alert(msg['message'] + ' a quiter le défi \n Vous êtes déclaré gagnat \n \t \t(｡-_-｡) ');
    }
    else if(msg['type'] === 'pasEnDefi')
    {
      console.log('vous n etês pas en defi avec ' + msg['message']);
      window.alert('vous n etês pas en defi avec ' + msg['message']);
    }
    else if(msg['type'] === 'dejaEnDefi')
    {
      console.log('vous n etês pas en defi avec ' + msg['message']);
      window.alert('vous etês déjà en defi avec ' + msg['message']);
    }
    else if(msg['type'] === 'defiTerminer')
    {
      console.log(msg['message1'] + ' et ' + msg['message2'] + ' ont terminer le défi');
      let endefi = document.querySelector('#enDefi');
      let defi = document.querySelector('#defi_' + msg['message1']+'_'+msg['message2']);
      if(endefi && defi)
      {
        //console.log('#defi_' + msg['message1']+'_'+msg['message2']);
        endefi.removeChild(defi);
      }
      let testTable = document.querySelector('#listDefi');
      let defii = document.querySelector('#defi_'+msg['message']);
      if(testTable && defii)
      {
        //defi.innerHTML = '';
        testTable.removeChild(defii);
      }
    }
  });
});


function tableListeUser(event, ws)
{
  console.log(event.target.dataset.user);
  ws.send(JSON.stringify({ type: 'defi', message: event.target.dataset.user }));
}

function listeDefi(nomUser)
{
  let tr = document.createElement('tr');
  let tdUser = tr.appendChild(document.createElement('td'));
  let tdBoutonOk = tr.appendChild(document.createElement('td'));
  let tdBoutonRefu = tr.appendChild(document.createElement('td'));
  let boutonOk = tdBoutonOk.appendChild(document.createElement('button'));
  let boutonRefu = tdBoutonRefu.appendChild(document.createElement('button'));
  tr.id = 'defi_'+nomUser;
  tdUser.textContent = nomUser;
  boutonOk.textContent = 'Accepter';
  boutonOk.dataset.defi = 'defiAccepter';
  boutonOk.dataset.nomUser = nomUser;
  boutonRefu.textContent = 'Refuser';
  boutonRefu.dataset.defi = 'defiRefuser';
  boutonRefu.dataset.nomUser = nomUser;
  return tr;
}

function sonEnDefi(user1, user2)
{
  let tr = document.createElement('tr');
  let td = tr.appendChild(document.createElement('td'));
  td.textContent = user1 + ' vs ' + user2;
  tr.id = '#defi_'+user1+'_'+user2;
  return tr;
}

// on lance le jeu
function lancerJeu(user) {
  if (listeDesJeu[user] == null || listeDesJeu[user].closed) {
    /* si le pointeur vers l'objet window n'existe pas, ou s'il existe
       mais que la fenêtre a été fermée */
    listeDesJeu[user] = window.open("https://"+window.location.host+"/jeu",user);
    /*listeDesJeu[user] = window.open("https://"+window.location.host+"/jeu",
           "PromoteFirefoxWindowName", "resizable=yes,scrollbars=yes,status=yes");*/
    /* alors, création du pointeur. La nouvelle fenêtre sera créée par dessus
       toute autre fenêtre existante. */
  }
  else {
    listeDesJeu[user].focus();
    /* sinon, la référence à la fenêtre existe et la fenêtre n'a pas été 
       fermée: la fenêtre est peut-être minimisée ou derrière la fenêtre 
       principale. Par conséquent, on peut l'amener par dessus les autres à
       l'aide de la méthode focus(). Il n'est pas nécessaire de recréer la fenêtre
       ou de recharger la ressource référencée. */
  };
}