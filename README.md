Projet AWS Master 1 (jeu de Dames)
==================================




#### principe du jeu de dames


  Deux joueurs, le noir et le blanc, jouent sur un échiquier 10×10.

  Chaque joueur dispose de 20 pions. Les pions ne peuvent être posés que sur les cases noire, ils commencent la partie disposés sur les quatres lignes les plus proches du joueur respectif.

  Les joueurs jouent à tour de rôle, les blancs commencent. Un pion ne peut se déplacer que d’une case, en diagonal vers l’avant (deux choix possibles). Lorsque l’une des deux cases en face d’un pion est occupée par un pion adverse, et qu’il y a une case libre derrière, le joueur peut prendre le pion adverse en le “sautant”, le pion est alors éliminé de l’échiquier.

  Lorsqu’un pion arrive sur la ligne opposée de l’échiquier, il est promu en dame. Une dame se comporte comme un pion, mais en plus elle peut se déplacer en arrière.

  Le joueur qui n’a plus de pions perd la partie.
  [Luca De Feo](http://defeo.lu/aws/project)(Dames)



Structure du projet
-------------------

Le projet est structué en 3 parties:
  
  - Inscription et Connexion
  - L'accès au service de l'application
  - Le jeu
  

  #### Inscription et Connexion
    
  Dans cette partie, il est question pour l'utilisateur en un premier temps de s'inscrire.
  
  Lors de l'inscription, les données renseignés par l'utilisateur sont analysées par le `serveur` en vérifiant qu'elle respectent les normes de sécurité et celle d'accès a cette application.
  par exemple le `login` renseigné doit être unique pour chaque utilisateur avec une taille minimum a respecter, et traiter certaint caractère destinés a nuire cette application.
  puis après annalyse, ces données conforne aux regles établits seront stockés dans une base de donnée cloud `MongoDB` `(No-SQL)` [MongoDB Atlas](https://www.mongodb.com/cloud)
  
  Après inscription, l'utilisateur est redirigé vers la page de connexion qui se connecte avec ses identifients d'inscription qui seront aussi analysés par le serveur. 
  
  #### L'accès au service de l'application
  
  Ici l'application permet a l'utilisateur voir les autres utilisateur connecter ainsi que des informations le cernant et ceux des autres.
  L'utilisateur interagit avec les autres en passant par le serveur. Il peux par exemple envoyer une demande de défi, résufé ou accepter un défi, voir ou modifier ses informations personnelles.
  
  #### Jeu
  
  C'est ici que se déroule un défi entre 2 utilisateurs. Celui qui lance le défi est considéré comme étant le `joueur 1` et l'autre le `joueur 2`.
  Tous informations issus de cette partie envoyer aux serveur seront analysé par ce dernier celon les règles du jeu puis a son tour, informe les 2 utilisateur en défi de la décision prise.
  A l'issu du jeu, un joueur est déclaré gagnant et un autre perdant.


 Contenant du projet
 -------------------
 
   - `.env`: un fichier caché contenant les informations de connexion a la base de donnée.
   - `User.js`: un script permettant de créer une instance d'utilisatuer.
   - `dames.js`: l'implémentation de la logique du jeu. C'est ce script qui décide en fonction des informations transmisent par les utilisateurs en défi.
   - `bd_init.js`: ce script est charger de l'initialisation de la base de donnée, tels que la creation des documents `MongoDB` (les tables en SQL), leurs initialisations par défaut. 
   - `server.js`: c'est dans ce script qu'est géré toutes les intéractions entre le client (utilisateur) et le serveur, la gestion des différentes `url`, le lancement de l'appication.
   - `package.json`: ce fichier contient les différentes configuration du projet.
   - `public`: qui est un dossier.
     - `css`: l'esemble des css utilisés coté client.
     - `addons et asserts`: contiennent une presentation.
     - `client.js`: un sript coté client (utilisateur) qui permet l'interaction avec le serveur.
     - `dameClient.js`: il envoie les données de l'utilisateur au serveur pour l'annalyse de la partie du jeu en cours.
   - `views`: ici l'ensemble des fichier html.
 
 
 
Mode de lancement du jeu
------------------------

Le projet étant développé et hebergé sur [Glitch](https://glitch.com/), alors il suffit tout simplement d'ouvrir un navigateur internet, saisie dans la barre d'adresse: [https://awsdame.glitch.me/](https://awsdame.glitch.me/)















Ce projet a été développé et hébergeé sur [Glitch](https://glitch.com/)  :)



