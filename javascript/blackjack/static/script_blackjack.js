
let blackjackGame = {
    'you': {'scoreSpan': '#your-blackjack-result', 'div': '#your-box', 'score': 0},
    'dealer': {'scoreSpan': '#dealer-blackjack-result', 'div': '#dealer-box', 'score': 0},
    'cards': ['2','3','4','5','6','7','8','9','10','K','J','Q','A'],
    'cardsMap': {'2':2,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9,'10':10,'K':10,'J':10,'Q':10,'A':[1,11]},
    'wins': 0,
    'losses': 0,
    'draws': 0,
    'isStand': false,  // keeps track of whether the stand mode is activated
    'turnsOver': false  // the hit n the stand have been completly, all the turns are over, so we can hit deal
};

const YOU = blackjackGame['you'];
const DEALER = blackjackGame['dealer'];

const hitSound = new Audio('static/sounds/swish.m4a');
const winSound = new Audio('static/sounds/cash.mp3')
const lossSound = new Audio('static/sounds/aww.mp3');

document.querySelector('#blackjack-hit-button').addEventListener('click', blackjackHit);

document.querySelector('#blackjack-stand-button').addEventListener('click', dealerLogic);

document.querySelector('#blackjack-deal-button').addEventListener('click', blackjackDeal);



function blackjackHit() {   // acciones del boton hit
    if (blackjackGame['isStand'] === false) { // no se puede presionar hit si ya se presiono stand (flow)
        let card = randomCard();
        console.log(card);
        showCard(card, YOU);
        updatesScore(card, YOU);
        showScore(YOU);
    }
}



function randomCard() {
    let randomIndex = Math.floor(Math.random() * 13); // numero al azar entre 1-13
    return blackjackGame['cards'][randomIndex];  // seleciona una carta con el random index (nro al azar entre 1-13)
}


function showCard(card,activePlayer) {  // el activePlayer es el q esta jugando ahora (asi sabe en donde mostrar la carta si en el dealer o you)
    
    if (activePlayer['score'] <= 21){  // va a seguir mostrando cartas solo si estamos debajo de 21
        let cardImage = document.createElement('img');
        cardImage.src = `static/images/${card}.png`;
        document.querySelector(activePlayer['div']).appendChild(cardImage);  // estoy adjuntando la imagen que creé al div
        hitSound.play()     
    }
}


function blackjackDeal() {      // acciones botón deal
    if (blackjackGame['turnsOver'] === true) {  // no se puede apretar deal antes de que hayan terminado (flow)
        
        blackjackGame['isStand'] = false; 

        let yourImages = document.querySelector('#your-box').querySelectorAll('img');
        let dealerImages = document.querySelector('#dealer-box').querySelectorAll('img');

        for (let i = 0; i < yourImages.length; i++) {   // cuando apretamos deal se remueven las cartas presentes (tanto del you como del dealer)
            yourImages[i].remove();
        }

        for (let i = 0; i < dealerImages.length; i++) {
            dealerImages[i].remove();
        }

        YOU['score'] = 0;   // reinicia contador interno
        DEALER['score'] = 0;

        document.querySelector('#your-blackjack-result').textContent = 0;    // reinicia el contador html
        document.querySelector('#dealer-blackjack-result').textContent = 0;

        document.querySelector('#your-blackjack-result').style.color = '#fff';   // color blanco again contador html
        document.querySelector('#dealer-blackjack-result').style.color ='#fff';

        document.querySelector('#blackjack-result').textContent = "Let's play";  // cuando apretamos deal el "you won" / "you lost" 
        document.querySelector('#blackjack-result').style.color = "black";  // se tiene que volver a cambiar como estaba al inicio "let's play" (en negro)
       
        blackjackGame['turnsOver'] = false;
    }
    
}


function updatesScore(card, activePlayer) {
    // carta A puede ser 1 o 11: si agregando 11 no sobrepaso 21 agrego 11, sino agrego 1
    if(card == 'A'){
        if(activePlayer['score'] + 11 <= 21){
            activePlayer['score'] += 11;
        }
        else{
            activePlayer['score'] += 1;
        }
    }

    else{
        activePlayer['score'] += blackjackGame['cardsMap'][card];  // vamos cambiando el score segun la carta que aregamos
    }
}

function showScore(activePlayer) {
    if (activePlayer['score'] > 21){
        document.querySelector(activePlayer['scoreSpan']).textContent = 'F';
        document.querySelector(activePlayer['scoreSpan']).style.color = 'red';
    }
    else{
        document.querySelector(activePlayer['scoreSpan']).textContent = activePlayer['score']
    }
    
}

function sleep(ms) {  // pa q no de vuelta todas las cartas de una
    return new Promise(resolve => setTimeout(resolve, ms)); 
}

async function dealerLogic() {
    blackjackGame['isStand'] = true;   // cuando presionamos stand se activa dealerLogic(), then en dealerLogic cambiamos isStand to true (flow)
    
    
    while (DEALER['score'] < 16 && blackjackGame['isStand'] === true){
        let card = randomCard();
        showCard(card, DEALER);
        updatesScore(card, DEALER);
        showScore(DEALER); 
        await sleep(750);  // miliseconds, 
    }
    
    blackjackGame['turnsOver'] = true;  
    let winner = computeWinner();
    showResult(winner);
    
}

// compute winner and return who just won
// update the wins, draws, and losses

function computeWinner() {
    let winner;

    if(YOU['score'] <= 21){ // user didn't bust
        
        if(YOU['score'] > DEALER['score'] || DEALER['score'] > 21){  
            blackjackGame['wins']++;  // contador de victorias
            winner = YOU;
        }
        
        else if (YOU['score'] < DEALER['score']) {
            blackjackGame['losses']++;  // contador de derotas
            winner = DEALER;
        }

        else if (YOU['score'] === DEALER['score']) {
            blackjackGame['draws']++;  // contador de empates
        }
    }

    // condition: when user busts but dealer doesn't

    else if (YOU['score'] > 21 && DEALER['score'] <= 21){
        blackjackGame['losses']++;  // contador de derotas
        winner = DEALER;
    }

    else if (YOU['score'] > 21 && DEALER['score'] > 21) {
        blackjackGame['draws']++;   // contador de empates
    }

    console.log('winner is ', winner)
    return winner;
}

// muestra el resultado obtenido por computeWinner()

function showResult(winner) {
    let message, messageColor;

    if (blackjackGame['turnsOver'] === true){  // flow

        if (winner === YOU){
            document.querySelector('#wins').textContent = blackjackGame['wins']  // actualizamos el contador html
            message = 'You won!';
            messageColor = 'green';
            winSound.play();
        }
        else if (winner === DEALER){
            document.querySelector('#losses').textContent = blackjackGame['losses']  // actualizamos el contador html
            message = 'You lost!';
            messageColor = 'red';
            lossSound.play();
        }
        else{
            document.querySelector('#draws').textContent = blackjackGame['draws']
            message = 'You drew!';
            messageColor = 'black';
        }
    
        document.querySelector('#blackjack-result').textContent = message;  // cambiamos el contador html
        document.querySelector('#blackjack-result').style.color = messageColor;  // same pero color
    }
    
}


