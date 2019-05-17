
// client-side js
// run by the browser each time your view template is loaded
var user;
var ws = new WebSocket('wss://' + window.location.host);

ws.addEventListener('open', function(e)
{
  console.log('suis la');
  
  //ws.send(JSON.stringify({ type: 'connect', message: 'nomUtilisateur' }));
  
  ws.addEventListener('message', function(e)
  {
    var msg = JSON.parse(e.data);
    if(msg['type'] === 'connect')
    {
      user = msg['message'];
      ws.send(JSON.stringify({ type: 'userName', message: user }));
    }
    else if(msg['type'] === 'userConnecter')
    {
      let table = document.createElement('table');
      for(let i in msg['message'])
      {
        /*let li = document.createElement('li');
        let texte = document.createTextNode(msg['listUser'][i]);
        li.appendChild(texte);
        ul.appendChild(li);*/
        
        let tr = table.appendChild(document.createElement('tr'));
        tr.className = "userConnecter";
        let tdUser = tr.appendChild(document.createElement('td'));
        let tdBouton = tr.appendChild(document.createElement('td'));
        let bouton = tdBouton.appendChild(document.createElement('button'));
        tdUser.textContent = msg['message'][i];
        bouton.textContent = 'Défier';
        bouton.addEventListener('click', function(event)
                                      {
                                        console.log('envoi du defi a ' + msg['message'][i]);
                                        ws.send(JSON.stringify({ type: 'defi', message: msg['message'][i], this: user }));
                                      });
        //bouton.dataset.colonne = msg['listUser'][i];
        //bouton.disabled = true;
      }
      /*table.addEventListener('click', function(event)
                                      {
                                        console.log(event.target.dataset.colonne);
                                        ws.send(JSON.stringify({ type: 'clic', message: event.target.dataset.colonne }));
                                      });*/
      let listUser = document.querySelector('#listUser');
      listUser.innerHTML = '';
      listUser.appendChild(table);
      console.log(e.data);
    }
    else if(msg['type'] === 'defi')
    {
      console.log('invitation réçu de '+msg['message']);
      let table = document.createElement('table');
      let tr = table.appendChild(document.createElement('tr'));
      let tdUser = tr.appendChild(document.createElement('td'));
      let tdBoutonOk = tr.appendChild(document.createElement('td'));
      let tdBoutonRefu = tr.appendChild(document.createElement('td'));
      let boutonOk = tdBoutonOk.appendChild(document.createElement('button'));
      let boutonRefu = tdBoutonRefu.appendChild(document.createElement('button'));
      tdUser.textContent = msg['message'];
      boutonOk.textContent = 'Accepter';
      boutonOk.addEventListener('click', function(event)
                                    {
                                      console.log('jai accepter ('+user+')');
                                      ws.send(JSON.stringify({ type: 'defiAccepter', message: msg['message'], this: user}));//nom user
                                    });
      boutonRefu.textContent = 'Refuser';
      boutonRefu.addEventListener('click', function(event)
                                    {
                                      console.log('refuser');
                                      ws.send(JSON.stringify({ type: 'defiRefuser', message: msg['this'] }));//nom user
                                    });
      let listUser = document.querySelector('#defi');
      listUser.innerHTML = '';
      listUser.appendChild(table);
      console.log(e.data);
    }
    else if(msg['type'] === 'defiAccepter')
    {
      console.log('défi accepter par '+ msg['message']);
      console.log('vous jouer avec ' + msg['this']);
    }
    else if(msg['type'] === 'defiRefuser')
    {
      console.log('défi refuser par' + msg['message']) ;
    }
  });
});



function gerer_click(event)
{
  ws.addEventListener('open', function(e)
  {
    console.log('clic');
    ws.send(JSON.stringify({ type: 'clic', message: 'nomUtilisateur' }));
  });
  
}
