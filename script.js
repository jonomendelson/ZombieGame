var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");
ctx.fillStyle = "#FF0000";
ctx.fillRect(100,195,5,5);

var xVel = 0;
var yVel = 0;
var xPos = 800;
var yPos = 195;

var canShoot = true;
var currGunType = "pistol";

var bulletXSize;
var bulletYSize;
var bulletColor;

var bullets = [];
var zombies = [];
var scoreLabels = [];
var particles = [];

var waves = [[2000, 25, 500], [1850, 35, 1000], [1700, 40, 1500], [1400, 50, 2000], [1200, 60, 3000]]; //spawnfreq, zombiesSpawned, massiveHealth
var wave = 1;
var zombiesSpawnedWave;
var score = 0;
var money = 0;
var streak = 1;
var health = 100;
var waveTextAlpha = 0;
var spawnerInt;
var fadeInt;

var mantle = new Image();
mantle.src = 'images/mantle.png';
var healthBar = new Image();
healthBar.src = 'images/healthBar.png';

var frame0 = new Image(); //init images for zombie
frame0.src = 'images/zombie0.png';
var frame1 = new Image();
frame1.src = 'images/zombie1.png';
var frame2 = new Image();
frame2.src = 'images/zombie2.png';
var frame0flip = new Image(); //init flipped images for zombie
frame0flip.src = 'images/zombie0flip.png';
var frame1flip = new Image();
frame1flip.src = 'images/zombie1flip.png';
var frame2flip = new Image();
frame2flip.src = 'images/zombie2flip.png';
var frameback = new Image();
frameback.src = 'images/zombieback.png';	
		
var runnerFrame0 = new Image(); //init images for runner
runnerFrame0.src = 'images/runner0.png'; 
var runnerFrame1 = new Image();
runnerFrame1.src = 'images/runner1.png';
var runnerFrame2 = new Image();
runnerFrame2.src = 'images/runner2.png';
var runnerFrame3 = new Image();
runnerFrame3.src = 'images/runner3.png';
var runnerFrame4 = new Image();
runnerFrame4.src = 'images/runner4.png';
var runnerFrame5 = new Image();
runnerFrame5.src = 'images/runner5.png';
var runnerFrame0flip = new Image(); //init flipped images for runner
runnerFrame0flip.src = 'images/runner0flip.png'; 
var runnerFrame1flip = new Image();
runnerFrame1flip.src = 'images/runner1flip.png';
var runnerFrame2flip = new Image();
runnerFrame2flip.src = 'images/runner2flip.png';
var runnerFrame3flip = new Image();
runnerFrame3flip.src = 'images/runner3flip.png';
var runnerFrame4flip = new Image();
runnerFrame4flip.src = 'images/runner4flip.png';
var runnerFrame5flip = new Image();
runnerFrame5flip.src = 'images/runner5flip.png';
var runnerback = new Image();
runnerback.src = 'images/runnerback.png';

function fadeTextIn(){
	fadeInt = setInterval(function(){waveTextAlpha += 0.01;if(waveTextAlpha >= 1){
		clearInterval(fadeInt);
		waveTextAlpha = 1;
	}}, 15);
}

function fadeTextOut(){
	fadeInt = setInterval(function(){waveTextAlpha -= 0.03;if(waveTextAlpha <= 0){
		clearInterval(fadeInt);
		waveTextAlpha = 0;
	}}, 15);
}

function runWave(waveNumber){
	fadeTextIn(); streak = 1;
	window.setTimeout(function(){fadeTextOut();spawnWave(waveNumber-1);}, 5000);	
}

function nextWave(){
wave++; 
runWave(wave);
}


function spawnWave(waveNumber){
	zombiesSpawnedWave = 0;
	spawnerInt = setInterval(function(){spawnRandZombie(); zombiesSpawnedWave++; if(zombiesSpawnedWave == waves[waveNumber][1]){clearInterval(spawnerInt);} }, waves[waveNumber][0]); 
}

function displayBigText(text, alpha){
	ctx.fillStyle = "rgba(0, 0, 0, " + alpha + ")";
	ctx.font = "80pt PressStart";
	ctx.fillText(text, 550, 500);
}

function clear(){
ctx.clearRect( 0 , 0 , c.width, c.height );
}

function addParticleGroup(xPos, yPos, xVel, yVel, amount, red, green, blue, xSize, ySize, decay, xFrict, grav, angleSpread, sizeSpread, posSpread, opacSpread){
	var i = 0;
	while(i < amount){
		var currParticle = new Object();
		currParticle.x = xPos + Math.random()*posSpread - posSpread/2;
		currParticle.y = yPos + Math.random()*posSpread - posSpread/2;
		currParticle.xVel = xVel + Math.random()*angleSpread - angleSpread/2;
		currParticle.yVel = yVel + Math.random()*angleSpread - angleSpread/2;
		currParticle.xSize = xSize + Math.random()*sizeSpread - sizeSpread/2;
		currParticle.ySize = ySize + Math.random()*sizeSpread - sizeSpread/2;
		currParticle.life = 1 - Math.random()*opacSpread/2;
		currParticle.decay = decay;
		currParticle.xFrict = xFrict;
		currParticle.grav = grav;
		currParticle.red = red;
		currParticle.blue = blue;
		currParticle.green = green;
		particles.push(currParticle);
		i++;
	}
}

function updateParticles(){
	var i = 0;
	while (i < particles.length){
		particles[i].life -= particles[i].decay;
		particles[i].xVel *= particles[i].xFrict;
		particles[i].yVel += particles[i].grav;
		
		if(particles[i].life <= 0){
			particles.splice(i, 1);
			return 1;
		}
		
		ctx.fillStyle = "rgba(" + particles[i].red +","+ particles[i].green + "," + particles[i].blue + "," + particles[i].life + ")";
		particles[i].x += particles[i].xVel;
		particles[i].y += particles[i].yVel;
		ctx.fillRect(particles[i].x, particles[i].y, particles[i].xSize, particles[i].ySize);
		
		i++;
	}
	return 0;
}

function updateDisplay(){
	ctx.drawImage(mantle, -10, -65, 1500, 240);
	ctx.drawImage(healthBar,0,0,health*8,50,55,10,health*8,50); //0 - 800
	
	ctx.fillStyle = "#FFFFFF";
	ctx.font = "30pt PressStart";
	ctx.fillText("Score: " +score, 300-(Math.floor(Math.log(score+1))*10), 130);
	
	if(money < 1000000){
	ctx.fillStyle = "#FFFF00";
	ctx.font = (35-(Math.floor(Math.log(money+1))/1.2))+"pt PressStart";
	ctx.fillText("Money: $" +money, 1000-Math.floor(Math.log(money+1)*3), 60);
	}else{
	ctx.fillStyle = "#88FF00";
	ctx.font = "18pt PressStart";
	ctx.fillText("Money: $" +money, 1020, 55);
	}
	
	ctx.fillStyle = "#FFFFFF";
	ctx.font = "30pt PressStart";
	ctx.fillText("Wave " +wave, 1100, 140);
	
	
	ctx.fillStyle = "#FFFFFF";
	ctx.fillRect(925, 5, 3, 150);
}

function updatePos(){
	clear();

	xPos += xVel;
	yPos += yVel;
	xVel *= .85;
	
	if(yPos < c.height-61){
		yVel += 0.15;
	}else{
		yVel = 0;
		yPos = c.height-60;
	}
	
	updateBullets();
	updateZombies();
	checkCollision();
	updateScoreLabels();
	streak *= 1.0006;
	check	Collision();
	updateParticles();
	updateDisplay();
	displayBigText("Wave " + wave, waveTextAlpha);
	
	ctx.fillStyle = "#FF0000";
	ctx.fillRect(xPos,yPos,30,60);
}

function updateBullets(){
	var i = 0;
	var newX; var newY;
	while (i < bullets.length){
		newX = 0;
		newY = 0;
		bullets[i].x += bullets[i].xVel;
		newX = bullets[i].x;
		newY = bullets[i].y;
		ctx.fillStyle = bulletColor;
		ctx.fillRect(newX,newY+25,bulletXSize,bulletYSize);
		i++;
	}
	
}

function updateZombies(){
	var i = 0;
	var newX; var newY;
	while (i < zombies.length){
		newX = 0;
		newY = 0;
		
		if(zombies[i].type == "jumper"){
			ctx.fillStyle = "#333333";
			ctx.fillRect(zombies[i].x-10, zombies[i].y+15,(zombies[i].health/(zombies[i].maxHealth/50)),5);
		}else if(zombies[i].type == "walker"){
			ctx.fillStyle = "#333333";
			ctx.fillRect(zombies[i].x-10, zombies[i].y+15,(zombies[i].health/(zombies[i].maxHealth/50)),5);
		}else if(zombies[i].type == "runner"){
			ctx.fillStyle = "#333333";
			ctx.fillRect(zombies[i].x-10, zombies[i].y+15,(zombies[i].health/(zombies[i].maxHealth/50)),5);
		}else if(zombies[i].type == "massive"){
			ctx.fillStyle = "#333333";
			ctx.fillRect(zombies[i].x-157, zombies[i].y-330,(zombies[i].health/(zombies[i].maxHealth/319)),5);
		}
		
		if(zombies[i].x > xPos){//right
			if(zombies[i].xVel > 0){
				zombies[i].xVel *= -1;
			}
		}else{//left
			if(zombies[i].xVel < 0){
				zombies[i].xVel *= -1;
			}
		}
		
		if(zombies[i].type != "massive"){
			if(zombies[i].y > 705){
				zombies[i].y = 706;
				zombies[i].yVel = 0;
			}else{
				zombies[i].yVel += .15;
			}
		}
		
		var speedGoal = 1.5;
		if(zombies[i].type == "runner"){
			speedGoal = 3;
		}else if(zombies[i].type == "massive"){
			speedGoal = 0.8;
		}
		
		
		if(zombies[i].xVel > 0){
			zombies[i].xVel = ((speedGoal-zombies[i].xVel)*0.06)+zombies[i].xVel;
		}else{
			zombies[i].xVel = zombies[i].xVel;
		}
		
		zombies[i].x += zombies[i].xVel;
		zombies[i].y += zombies[i].yVel;
		newX = zombies[i].x;
		newY = zombies[i].y;
		
		if(zombies[i].type == "walker"){
		zombies[i].animationFrame+=0.1;
		}else if(zombies[i].type == "runner"){
		zombies[i].animationFrame+=0.2;
		}
		
		
		if(zombies[i].type == "jumper"){
			ctx.fillStyle = "#00DD33";
		}else if(zombies[i].type == "walker"){
			ctx.fillStyle = "#005500";
		}else if(zombies[i].type == "runner"){
			ctx.fillStyle = "#999900";
		}else if(zombies[i].type == "massive"){
			ctx.fillStyle = "#DDDDDD";
		}
		
		if(zombies[i].type == "massive"){
			ctx.fillRect(newX-150,newY-305,300,400);
		}else if(zombies[i].type == "walker"){
			if(Math.abs(zombies[i].x - xPos) < 15){
				ctx.drawImage(frameback, newX, newY+25);
			}else if(zombies[i].xVel > 0){
				if(Math.floor(zombies[i].animationFrame) % 4 == 0){
					ctx.drawImage(frame0, newX, newY+25);
				}else if(Math.floor(zombies[i].animationFrame) % 4 == 1){
					ctx.drawImage(frame1, newX, newY+25);
				}else if(Math.floor(zombies[i].animationFrame) % 4 == 2){
					ctx.drawImage(frame0, newX, newY+25);
				}else if(Math.floor(zombies[i].animationFrame) % 4 == 3){
					ctx.drawImage(frame2, newX, newY+25);
				}
			}else{
				if(Math.floor(zombies[i].animationFrame) % 4 == 0){
					ctx.drawImage(frame0flip, newX, newY+25);
				}else if(Math.floor(zombies[i].animationFrame) % 4 == 1){
					ctx.drawImage(frame1flip, newX, newY+25);
				}else if(Math.floor(zombies[i].animationFrame) % 4 == 2){
					ctx.drawImage(frame0flip, newX, newY+25);
				}else if(Math.floor(zombies[i].animationFrame) % 4 == 3){
					ctx.drawImage(frame2flip, newX, newY+25);
				}
			}
		}else if(zombies[i].type == "runner"){
			if(Math.abs(zombies[i].x - xPos) < 15){
				ctx.drawImage(runnerback, newX, newY+25);
			}else if(zombies[i].xVel > 0){
				if(Math.floor(zombies[i].animationFrame) % 6 == 0){
					ctx.drawImage(runnerFrame0, newX, newY+25);
				}else if(Math.floor(zombies[i].animationFrame) % 6 == 1){
					ctx.drawImage(runnerFrame1, newX, newY+25);
				}else if(Math.floor(zombies[i].animationFrame) % 6 == 2){
					ctx.drawImage(runnerFrame2, newX, newY+25);
				}else if(Math.floor(zombies[i].animationFrame) % 6 == 3){
					ctx.drawImage(runnerFrame3, newX, newY+25);
				}else if(Math.floor(zombies[i].animationFrame) % 6 == 4){
					ctx.drawImage(runnerFrame4, newX, newY+25);
				}else if(Math.floor(zombies[i].animationFrame) % 6 == 5){
					ctx.drawImage(runnerFrame5, newX, newY+25);
				}
			}else{
				if(Math.floor(zombies[i].animationFrame) % 6 == 0){
					ctx.drawImage(runnerFrame0flip, newX, newY+25);
				}else if(Math.floor(zombies[i].animationFrame) % 6 == 1){
					ctx.drawImage(runnerFrame1flip, newX, newY+25);
				}else if(Math.floor(zombies[i].animationFrame) % 6 == 2){
					ctx.drawImage(runnerFrame2flip, newX, newY+25);
				}else if(Math.floor(zombies[i].animationFrame) % 6 == 3){
					ctx.drawImage(runnerFrame3flip, newX, newY+25);
				}else if(Math.floor(zombies[i].animationFrame) % 6 == 4){
					ctx.drawImage(runnerFrame4flip, newX, newY+25);
				}else if(Math.floor(zombies[i].animationFrame) % 6 == 5){
					ctx.drawImage(runnerFrame5flip, newX, newY+25);
				}
			}
		}else{
			ctx.fillRect(newX,newY+25,30,70);
		}
		
		i++;
	}
}

function checkPlayerCollision(){
	var i = 0;
	var force = 1;
	while (i < zombies.length){
		if((Math.abs(zombies[i].x - xPos) < 30) || ((Math.abs(zombies[i].x - xPos) < 170)&&(zombies[i].type == "massive"))){
			if((Math.abs(zombies[i].y - yPos) < 40) || ((Math.abs(zombies[i].y - yPos) < 170)&&(zombies[i].type == "massive"))){//collided
				
				if(zombies[i].type == "massive"){
					force = 3;
				}
				health-=0.5*force;
				if(health < 0){
					document.location.href = "404.php";
				}
				streak = 1;
				if(zombies[i].x - xPos < 0){//right
					xVel += force;
				}else{//left
					xVel -= force;
				}
			}
		}
		i++;
	}
}

function checkKeys(){
	if(isLeftDown){
		moveLeft();
	}else if(isRightDown){
		moveRight();
	}
	if(isUpDown){
		jump();
	}else if(isDownDown){
		slam();
	}
}

function spawnRandMassive(health){
var randomNumber = Math.round(Math.random()*2);

	if(randomNumber == 1){
		spawnZombie("left", "massive", health);
	}else{
		spawnZombie("right", "massive", health);
	}
}

function checkCollision(){
var didRemove = false;
var i = 0;
	while (i < bullets.length){
		var j= 0;
		while (j < zombies.length){
			if(((Math.abs(bullets[i].x - zombies[j].x) < 20)) || ((Math.abs(bullets[i].x - zombies[j].x) < 120) && (zombies[j].type == "massive"))){
				if(((Math.abs(bullets[i].y - zombies[j].y) < 40)) || ((Math.abs(bullets[i].y - zombies[j].y) < 200) && (zombies[j].type == "massive"))){ //collided
					
					
					
					
					zombies[j].health -= bullets[i].healthLeftToTake;
					bullets[i].healthLeftToTake -= 100;
					
					if(zombies[j].xVel < 0){//right
						zombies[j].xVel += 1;
						addParticleGroup(zombies[j].x-25, zombies[j].y+45, 6, 1, 15, 255, 25, 25, 10, 10, 0.05, 0.98, 0.5, 3, 5, 5, 0.3);
					}else{//left
						zombies[j].xVel -= 1;
						addParticleGroup(zombies[j].x+25, zombies[j].y+45, -6, 1, 15, 255, 25, 25, 10, 10, 0.05, 0.98, 0.5, 3, 5, 5, 0.3);
					}
					
					if(bullets[i].healthLeftToTake < 0){
						bullets.splice(i, 1);
						didRemove= true;
					}
					
					if(zombies[j].health <= 0){
						var myScoreLabel = new Object();
						myScoreLabel.x = zombies[j].x;
						myScoreLabel.y = zombies[j].y;
						myScoreLabel.percCompleted = 0;
						
						if(zombies[j].type == "walker"){
							money += 100;
							score += 100*5*Math.floor(streak);
							myScoreLabel.text = "+$100";
						}else if(zombies[j].type == "runner"){
							money += 150;
							score += 150*5*Math.floor(streak);
							myScoreLabel.text = "+$150";
						}else if(zombies[j].type == "jumper"){
							money += 200;
							score += 200*5*Math.floor(streak);
							myScoreLabel.text = "+$200";
						}else if(zombies[j].type == "massive"){
							money += 3000;
							score += 300*5*Math.floor(streak);
							myScoreLabel.text = "+$3000";
						}
						
						
						
						scoreLabels.push(myScoreLabel);
						
						addParticleGroup(zombies[j].x, zombies[j].y+55, 0, 3, 15, 255, 25, 25, 10, 10, 0.05, 0.98, 0.5, 3, 5, 5, 0.3); //work on this
						zombies.splice(j, 1);
						
						didRemove = true;
					}
				}
			}
			if(didRemove){
			return null;
			}
			j++;
		}
		i++;
	}
	return null;
}

function updateScoreLabels(){
	var i= 0;
	var yOffset;
	var alpha;
	while(i < scoreLabels.length){
		yOffset = (scoreLabels[i].percCompleted)/3;
		alpha = (100-scoreLabels[i].percCompleted)/100;
		ctx.fillStyle = "rgba(0, 0, 0, " + alpha + ")";
		ctx.font = "16pt PressStart";
		ctx.fillText(scoreLabels[i].text, scoreLabels[i].x, scoreLabels[i].y-2*yOffset);	
		scoreLabels[i].percCompleted+=2;
		if(scoreLabels[i].percCompleted > 100){
			scoreLabels.splice(i, 1);
		}
		i+=1;
	}
}



function moveLeft(){
xVel -= 1;
}

function moveRight(){
xVel += 1;
}

function jump(){
	if(yPos > c.height-66){
		yVel -= 2;
	}
}

function slam(){
	yVel = 15;
}

function shoot(direction){
	if(canShoot){
	var stats = getGunStats(currGunType);
	 bulletXSize = stats[0];
	 bulletYSize = stats[1];
	 bulletColor = stats[5];
	var myBullet = new Object();
	myBullet.x = xPos;
	myBullet.y = yPos;
	myBullet.healthLeftToTake = stats[6];
	if(direction == "left"){
		myBullet.xVel = -1 * stats[2];
		xVel += stats[4];
	}else if(direction == "right"){
		myBullet.xVel = stats[2];
		xVel -= stats[4];
	}
	canShoot = false;
	window.setTimeout(function(){canShoot=true;}, stats[3]);
	bullets.push(myBullet);
	}
}

function spawnRandZombie(){
var randomNumber = Math.round(Math.random()*6);

	if(randomNumber == 1){
		spawnZombie("left", "walker", 110);
	}else if(randomNumber == 2){
		spawnZombie("right", "walker", 110);
	}else if(randomNumber == 3){
		spawnZombie("left", "jumper", 60);
	}else if(randomNumber == 4){
		spawnZombie("right", "jumper", 60);
	}else if(randomNumber == 5){
		spawnZombie("left", "runner", 75);
	}else if(randomNumber == 6){
		spawnZombie("right", "runner", 75);
	}
}

function spawnZombie(side, type, setHealth){
	var myZombie = new Object();
	if(type == "walker"){
		myZombie.type = "walker";
		
		myZombie.yVel = 0;
		myZombie.y = 705;
		
		if(side == "left"){
			myZombie.x = 0;
			myZombie.xVel = 1.5;
			myZombie.side = "left";
		}else if(side == "right"){
			myZombie.x = 1800;
			myZombie.xVel = -1.5;
			myZombie.side = "right";
		}
		myZombie.health = setHealth;
		myZombie.maxHealth = setHealth;
	}else if(type == "jumper"){
		myZombie.type = "jumper";
		
		myZombie.yVel = 0;
		myZombie.y = 705;
		
		if(side == "left"){
			myZombie.x = 0;
			myZombie.xVel = 1.5;
			myZombie.side = "left";
		}else if(side == "right"){
			myZombie.x = 1800;
			myZombie.xVel = -1.5;
			myZombie.side = "right";
		}
		
		myZombie.jump = function(){
			myZombie.y = 704;
			myZombie.yVel -= 8;
		}
		myZombie.health = setHealth;
		myZombie.maxHealth = setHealth;
		window.setInterval(function(){myZombie.jump();}, 2300);
	}else if(type == "runner"){
		myZombie.type = "runner";
		
		myZombie.yVel = 0;
		myZombie.y = 705;
		
		if(side == "left"){
			myZombie.x = 0;
			myZombie.xVel = 3;
			myZombie.side = "left";
		}else if(side == "right"){
			myZombie.x = 1800;
			myZombie.xVel = -3;
			myZombie.side = "right";
		}
		
		myZombie.health = setHealth;
		myZombie.maxHealth = setHealth;
	}else if(type == "massive"){
		myZombie.type = "massive";
		
		myZombie.yVel = 0;
		myZombie.y = 705;
		
		if(side == "left"){
			myZombie.x = -200;
			myZombie.xVel = 0.8;
			myZombie.side = "left";
		}else if(side == "right"){
			myZombie.x = 2200;
			myZombie.xVel = -0.8;
			myZombie.side = "right";
		}
		
		myZombie.health = setHealth;
		myZombie.maxHealth = setHealth;
	}
	myZombie.animationFrame = 0;
	zombies.push(myZombie);
}

function getGunStats(gunType){ //stats: xSize, ySize, speed, cooldown, kickback, color, zombieBeforeBreak
var stats = [];
	if(gunType == "shotgun"){
		return [15, 15, 10, 1500, 20, "#000000", 150];
	}else if(gunType == "pistol"){
		return [15, 5, 15, 500, 2, "#000066", 40];
	}else if(gunType == "machineGun"){
		return [7, 3, 12, 50, 0.5, "#333300", 10];
	}else if(gunType == "flaming"){
		return [10, 5, 22, 3500, 20, "#993300", 300];
	}else if(gunType == "OP"){
		return [15, 5, 15, 20, 0, "#FF0000", 100000];
	}
}

