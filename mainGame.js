//(function(){
'use strict';
//

var clicked=false;

function getAimCoords(x0,y0,x1,y1,x2,y2,v0,t){ //v0 in seconds if t is in seconds
        if(x2-x1==0){
            let v=(y2-y1)/t
            let x=x2
            let A=1-(v0**2/v**2)
            let B=-2*y0+2*y2*(v0**2/v**2)
            let C=(x-x0)**2+y0**2-y2**2*(v0**2/v**2)

            let yf=(-B-(B**2-4*A*C)**0.5)/(2*A)
            let ys=(-B+(B**2-4*A*C)**0.5)/(2*A)

            return [[x2,yf],[x2,ys]]
        }else{
            let v=((x2-x1)**2+(y2-y1)**2)**0.5/t

            let m=(y2-y1)/(x2-x1)
            let n=y2-m*x2
            let AL=2*m*(y2-m*x2-y0)-2*x0
            let AR=-2*m**2*x2-2*x2
            let CL=x0**2+(y2-m*x2-y0)**2
            let CR=x2**2*(1+m**2)

            let xf=(-(v**2*AL-v0**2*AR)-((v**2*AL-v0**2*AR)**2-4*(v**2-v0**2)*(1+m**2)*(v**2*CL-v0**2*CR))**0.5)/(2*(v**2-v0**2*(1+m**2)))
            let xs=(-(v**2*AL-v0**2*AR)+((v**2*AL-v0**2*AR)**2-4*(v**2-v0**2)*(1+m**2)*(v**2*CL-v0**2*CR))**0.5)/(2*(v**2-v0**2*(1+m**2)))

            let yf=m*xf+n
            let ys=m*xs+n

            return [[xf,yf],[xs,ys]]
        }
    }

function KEventListener(){
	if(game){
		if((keyEvents.at(87) || keyEvents.at(38)) && survivor.midY > survivor.height/2){ //w - up
			survivor.moveVer(-10);
		};
		if((keyEvents.at(65) || keyEvents.at(37)) && survivor.midX > survivor.width/2){ //a - left
			survivor.moveHor(-10);
		};
		if((keyEvents.at(83) || keyEvents.at(40)) && survivor.midY < canv.height-survivor.height/2){ //s - down
			survivor.moveVer(10);
		};
		if((keyEvents.at(68) || keyEvents.at(39)) && survivor.midX < canv.width-survivor.width/2){ //d - right
			survivor.moveHor(10);
		};
		if((keyEvents.at(32) || clicked) && (reloadNum<=0 || rampage)){
			survivor.shoot();
			reloadNum=playerStats.maxReloadCd;
		}
	}
}
var menu=document.getElementById('menu').contentWindow
var sc=0
var hsc=0
if(localStorage.getItem('HighScore')){
	hsc=JSON.parse(localStorage.getItem('HighScore'));
}else{
	localStorage.setItem('HighScore',0)
}
var game=false
var IntInd=0
var healCd=0
var maxHealCd=400
var enSpd=5
var reloadNum=20
var enemyMaxReload=20
var enemyMaxReload2=50
var maxIntInd=50
var rToken=0
var rampage=false
var enemyMaxRange=200
var mouseX=0
var mouseY=0
var survivor=new Comp({type:'img',source:'./images/player.png',x:canv.width/2,y:canv.height/2,width:60,height:40}) //Comp
survivor.visible=false
var targetCursor=new Comp({type:'img',source:'./images/target.png'})
targetCursor.visible=false;
setTimeout(()=>{
	let rel=targetCursor.width/targetCursor.height;
	targetCursor.height=30;
	targetCursor.width=30*rel;
},10);
var projectiles=[]
var enemies=[] //melee
var enemies2=[] //shooters
var enemies3=[] //aiming shooters
var enemyprojectiles=[]
var playerStats={"gold":0,"maxHp":10,"maxRegSpeed":300,"maxReloadCd":20,"priceHp":100,"priceRegSpeed":100,"priceReload":100,"prSplit":false} //Stats

if(localStorage.getItem('Stats')){
	try{
		let strange=JSON.parse(atob(localStorage.getItem('Stats')))
		playerStats.gold=typeof strange?.gold=='number' ? strange.gold : 0;
		playerStats.maxHp=typeof strange?.maxHp=='number' ? strange.maxHp : 10;
		playerStats.maxRegSpeed=typeof strange?.maxRegSpeed=='number' ? strange.maxRegSpeed : 300;
		playerStats.maxReloadCd=typeof strange?.maxReloadCd=='number' ? strange.maxReloadCd : 20;
		playerStats.priceHp=typeof strange?.priceHp=='number' ? strange.priceHp : 100;
		playerStats.priceRegSpeed=typeof strange?.priceRegSpeed=='number' ? strange.priceRegSpeed : 100;
		playerStats.priceReload=typeof strange?.priceReload=='number' ? strange.priceReload : 100;
		playerStats.prSplit=typeof strange?.prSplit=='boolean' ? strange.prSplit : false;
	}catch(e){
		playerStats={"gold":0,"maxHp":10,"maxRegSpeed":300,"maxReloadCd":20,"priceHp":100,"priceRegSpeed":100,"priceReload":100,"prSplit":false} //Stats
	}
}else{
	localStorage.setItem('Stats',btoa(JSON.stringify(playerStats)))
}

function startRampage(){
	rToken=0;
	rampage=true;
	setTimeout(()=>{rampage=false},5000);
}
	
document.addEventListener('mousemove',(event)=>{
	let r=canv.getBoundingClientRect();
	mouseX=event.clientX-r.left;
	mouseY=event.clientY-r.top
})

document.addEventListener('mousedown',(event)=>{
	clicked=true;
});

document.addEventListener('mouseup',(event)=>{
	clicked=false;
});

Comp.prototype.shoot=function(){//Comp
	if(this == survivor){
		projectiles.push(new Comp({x:this.midX,y:this.midY,width:20,height:10,angle:this.angle,color:'#000000'}))//Comp
	}else{}
}

Comp.prototype.reload=10//Comp

Comp.prototype.reload2=20

Comp.prototype.hp=10//Comp

Comp.prototype.reduceHp=function(d){//Comp
	this.hp-=d
	if(this.hp<=0 && this==survivor){
		this.hp=0;
		endGame(); // Game Over
	}
	if(this==survivor){
		console.log('ouch')
		this.img.src='./images/player-hurt.png'; //do not use this.source
		setTimeout(()=>{this.img.src='./images/player.png'},250);
	}
}

Comp.prototype.heal=function(d){ //Comp
	if(this==survivor && this.hp<playerStats.maxHp){
		this.hp+=d;
	}
}

Comp.prototype.wannaShoot=null;//Comp


function endGame(){game=false;clearInterval(GameUpdater);clearInterval(PrUpdater);objects=[];projectiles=[];enemies=[];enemies2=[];enemyprojectiles=[];alert('GAME OVER!')} // Game Over
	
function resetStats(){
	playerStats={"gold":0,"maxHp":10,"maxRegSpeed":300,"maxReloadCd":20,"priceHp":100,"priceRegSpeed":100,"priceReload":100};
	localStorage.removeItem('Stats')
	location.reload();
}
function resetHighScore(){
	hsc=0;
	localStorage.removeItem('HighScore')
	location.reload();
}
function resetGame(){
	resetStats();resetHighScore();
}

//work cycle

function updateGame(){
	if(game){
		KEventListener();
		survivor.angle=getAngle(mouseX-survivor.midX,mouseY-survivor.midY) //mouseX>survivor.midX ? Math.atan((mouseY-survivor.midY)/(mouseX-survivor.midX)) : Math.atan((mouseY-survivor.midY)/(mouseX-survivor.midX))+Math.PI
		enemies.forEach((el)=>{ //melee
			el.angle=getAngle(survivor.midX-el.midX,survivor.midY-el.midY) //el.midX>survivor.midX ? Math.atan((el.midY-survivor.midY)/(el.midX-survivor.midX))-Math.PI : Math.atan((el.midY-survivor.midY)/(el.midX-survivor.midX));
			el.angle+=(8*Math.random()-4)*Math.PI/180
			el.moveDir(enSpd)
			if(el.touches(survivor)){survivor.reduceHp(1);el.del();enemies.splice(enemies.indexOf(el),1)} //Ouch
		})
		enemies2.forEach((el)=>{ //shooters
			el.angle=getAngle(survivor.midX-el.midX,survivor.midY-el.midY) //el.midX>survivor.midX ? Math.atan((el.midY-survivor.midY)/(el.midX-survivor.midX))-Math.PI : Math.atan((el.midY-survivor.midY)/(el.midX-survivor.midX));
			if(distance(el.midX,el.midY,survivor.midX,survivor.midY) < enemyMaxRange){
				el.reload--;if(el.reload<=0){enemyprojectiles.push(new Comp({x:el.midX,y:el.midY,width:20,height:10,angle:el.angle,color:'#ffdd00'}));el.reload=enemyMaxReload} //Comp
			}else{
				el.moveDir(enSpd)
			}
		})
		enemies3.forEach((el)=>{ //aiming shooters
			if(distance(el.midX,el.midY,survivor.midX,survivor.midY) < enemyMaxRange){
				el.reload2--
				let p1=[survivor.midX,survivor.midY]
				let p2
				let coords
				setTimeout(()=>{
					p2=[survivor.midX,survivor.midY]
					if(p1[0]==p2[0] && p1[1]==p2[1]){
						coords=[p2[0],p2[1]]
					}else{
						let newPoints=getAimCoords(el.midX,el.midY,p1[0],p1[1],p2[0],p2[1],0.5,40)
						if(p1[0]<p2[0]){
							coords=newPoints[0]
						}else if(p1[0]>p2[0]){
							coords=newPoints[1]
						}else{
							if(p1[1]<p2[1]){
								coords=newPoints[0]
							}else{
								coords=newPoints[1]
							}
						}
					}
					el.angle=getAngle(coords[0]-el.midX,coords[1]-el.midY)
					if(el.reload2<=0){
						enemyprojectiles.push(new Comp({x:el.midX,y:el.midY,width:20,height:10,angle:el.angle,color:'#ffdd00'}));
						el.reload2=enemyMaxReload2
					}
				},40)
			}else{
				el.angle=el.midX>survivor.midX ? Math.atan((el.midY-survivor.midY)/(el.midX-survivor.midX))-Math.PI : Math.atan((el.midY-survivor.midY)/(el.midX-survivor.midX));
				el.moveDir(enSpd)
			}
		})
		if(IntInd % maxIntInd == 0){
			let spawnmode=parseInt(Math.random()*2)
			if(spawnmode){
				enemies.push(new Comp({x:parseInt(Math.random()*2)*(canv.width+50)-25, y:parseInt(Math.random()*canv.height+50)-25, width:40, height:40, color:'#ff0000'})); //Comp
			}else{
				enemies.push(new Comp({x:parseInt(Math.random()*canv.width+50)-25, y:parseInt(Math.random()*2)*(canv.height+50)-25, width:40, height:40, color:'#ff0000'})); //Comp
			}
			if(IntInd >= 2.5*maxIntInd){
				let spawnmode=parseInt(Math.random()*2)
				if(spawnmode){
					enemies2.push(new Comp({x:parseInt(Math.random()*2)*(canv.width+50)-25, y:parseInt(Math.random()*canv.height+50)-25, width:40, height:40, color:'#ffff00'})); //Comp
				}else{
					enemies2.push(new Comp({x:parseInt(Math.random()*canv.width+50)-25, y:parseInt(Math.random()*2)*(canv.height+50)-25, width:40, height:40, color:'#ffff00'})); //Comp
				}
			}
			IntInd++
			if(IntInd >= 6*maxIntInd){
				for(let i=0;i<Math.ceil(Math.random()*3);i++){
					let spawnmode=parseInt(Math.random()*2)
					if(spawnmode){
						enemies3.push(new Comp({x:parseInt(Math.random()*2)*(canv.width+50)-25, y:parseInt(Math.random()*canv.height+50)-25, width:40, height:40, color:'#0000ff'})); //Comp
					}else{
						enemies3.push(new Comp({x:parseInt(Math.random()*canv.width+50)-25, y:parseInt(Math.random()*2)*(canv.height+50)-25, width:40, height:40, color:'#0000ff'})); //Comp
					}
				}
				IntInd=0
			}
		}else{
			IntInd++
		}
		reloadNum--
		survivor.visible=true;
		if(rToken>=20){
			startRampage();
		}
		healCd++;
		if(healCd>=maxHealCd){
			survivor.heal(1);
			healCd=0;
		}
		try{
			targetCursor.midX=mouseX;
			targetCursor.midY=mouseY;
		}catch(e){}
	}
}

function updateProjectiles(){
	projectiles.forEach((el)=>{
		el.moveDir(5)
		if(el.touchesEdge('top') || el.touchesEdge('bottom') || el.touchesEdge('right') || el.touchesEdge('left')){el.del();projectiles.splice(projectiles.indexOf(el),1);}
		enemies.forEach((en)=>{
			if(en.touches(el)){
				en.del();enemies.splice(enemies.indexOf(en),1);
				maxIntInd=maxIntInd>3 ? maxIntInd-1 : maxIntInd;
				sc++;
				enSpd=enSpd<15 ? enSpd+0.1 : enSpd;
				if(!rampage){rToken++};
				maxHealCd=maxHealCd>playerStats.maxRegSpeed ? maxHealCd-=10 : maxHealCd;
				playerStats.gold+=5+Math.floor(Math.random()*7)-3;
				if(playerStats.prSplit){
					for(let i of [-Math.PI/4,Math.PI/4]){projectiles.push(new Comp({x:el.midX,y:el.midY,width:20,height:10,angle:el.angle+i,color:'#000000'}))}
				}
			} //Kill
		})
		enemies2.forEach((en)=>{
			if(en.touches(el)){en.del();enemies2.splice(enemies2.indexOf(en),1);
				maxIntInd=maxIntInd>3 ? maxIntInd-1 : maxIntInd;
				sc+=2;
				enSpd=enSpd<15 ? enSpd+0.1 : enSpd;
				enemyMaxReload=enemyMaxReload>4 ? enemyMaxReload-0.5 : enemyMaxReload;
				if(!rampage){rToken+=2};
				enemyMaxRange=enemyMaxRange<300 ? enemyMaxRange+=10 : enemyMaxRange;
				clearTimeout(en.wannaShoot);
				playerStats.gold+=10+Math.floor(Math.random()*9)-4;
				if(playerStats.prSplit){
					for(let i of [-Math.PI/4,Math.PI/4]){projectiles.push(new Comp({x:el.midX,y:el.midY,width:20,height:10,angle:el.angle+i,color:'#000000'}))}
				}
			} //Kill
		})
		enemies3.forEach((en)=>{
			if(en.touches(el)){en.del();enemies3.splice(enemies3.indexOf(en),1);
				maxIntInd=maxIntInd>3 ? maxIntInd-1 : maxIntInd;
				sc+=4;
				enSpd=enSpd<15 ? enSpd+0.1 : enSpd;
				enemyMaxReload2=enemyMaxReload2>8 ? enemyMaxReload2-0.5 : enemyMaxReload2;
				if(!rampage){rToken+=2};
				enemyMaxRange=enemyMaxRange<300 ? enemyMaxRange+=10 : enemyMaxRange;
				clearTimeout(en.wannaShoot);
				playerStats.gold+=20+Math.floor(Math.random()*15)-7;
				if(playerStats.prSplit){
					for(let i of [-Math.PI/4,Math.PI/4]){projectiles.push(new Comp({x:el.midX,y:el.midY,width:20,height:10,angle:el.angle+i,color:'#000000'}))}
				}
			} //Kill
		})
	})
	enemyprojectiles.forEach((el)=>{
		el.moveDir(1)
		if(el.touchesEdge('top') || el.touchesEdge('bottom') || el.touchesEdge('right') || el.touchesEdge('left')){el.del();enemyprojectiles.splice(enemyprojectiles.indexOf(el),1);}
		if(el.touches(survivor)){survivor.reduceHp(4);el.del();enemyprojectiles.splice(enemyprojectiles.indexOf(el),1);} // Ouch
	})
}

var GameUpdater;
var PrUpdater;
var MainUpdater;
window.addEventListener('load',()=>{
	document.getElementById('startBtn').addEventListener('click',()=>{
		if(!game){
			for(let i of [87,65,83,68,37,38,39,40,32]){keyEvents[i]=false}
			maxIntInd=50;
			enSpd=5;
			reloadNum=20;enemyMaxReload=30;
			rToken=0;rampage=false;
			enemyMaxRange=200;
			sc=0;
			IntInd=0;
			maxHealCd=400;
			healCd=0;
			objects=[];
			enemies=[];
			enemies2=[];
			enemies3=[];
			projectiles=[];
			enemyprojectiles=[];
			survivor=new Comp({type:'img',source:'./images/player.png',x:canv.width/2,y:canv.height/2,width:60,height:40}); //Comp
			survivor.visible=true;
			survivor.hp=playerStats.maxHp;
			targetCursor=new Comp({type:'img',source:'./images/target.png'})
			targetCursor.visible=true;
			setTimeout(()=>{
				let rel=targetCursor.width/targetCursor.height;
				targetCursor.height=30;
				targetCursor.width=30*rel;
			},10);
			game=true;
			survivor.visible=true;
			survivor.midX=canv.width/2;
			survivor.midY=canv.height/2;
			GameUpdater=setInterval(updateGame,40);
			PrUpdater=setInterval(updateProjectiles,2);
		}
	});
	MainUpdater=setInterval(updateMain,40);
	document.getElementById('upgHP')?.addEventListener('click',()=>{ // upgrade HP
		if(!game){
			if(playerStats.gold>=playerStats.priceHp){
				playerStats.maxHp++;
				playerStats.gold-=playerStats.priceHp;
				playerStats.priceHp+=10;
			}
		}
	})
	document.getElementById('upgReg')?.addEventListener('click',()=>{ // upgrade Regeneration
		if(!game){
			if(playerStats.gold>=playerStats.priceRegSpeed && playerStats.maxRegSpeed>10){
				playerStats.maxRegSpeed-=10;
				playerStats.gold-=playerStats.priceRegSpeed;
				playerStats.priceRegSpeed+=10;
			}
		}
	})
	document.getElementById('upgRel')?.addEventListener('click',()=>{ // upgrade Reload
		if(!game){
			if(playerStats.gold>=playerStats.priceReload && playerStats.maxReloadCd>5){
				playerStats.maxReloadCd--;
				playerStats.gold-=playerStats.priceReload;
				playerStats.priceReload+=20;
			}
		}
	})
	document.getElementById('unlPrSp')?.addEventListener('click',()=>{ // unlock Projectile Splitting
		if(!game){
			if(playerStats.gold>=1000){
				playerStats.gold-=1000;
				playerStats.prSplit=true;
			}
		}
	})
	document.getElementById('resetStatsBtn')?.addEventListener('click',()=>{
		if(confirm('[Reset Stats] Are you sure?'))resetStats()
	})
	document.getElementById('resetHSBtn')?.addEventListener('click',()=>{
		if(confirm('[Reset High Score] Are you sure?'))resetHighScore()
	})
	document.getElementById('resetGameBtn')?.addEventListener('click',()=>{
		if(confirm('[Reset All] Are you sure?'))resetGame()
	})
});
	
function updateMain(){
	hsc=hsc<sc ? sc : hsc;
	localStorage['HighScore']=JSON.stringify(hsc)
	localStorage['Stats']=btoa(JSON.stringify(playerStats))
	try{
		document.getElementById('hpBar').value=''+survivor.hp;
		document.getElementById('hpBar').max=''+playerStats.maxHp;
		document.getElementById('sc').innerHTML=sc;
		document.getElementById('hsc').innerHTML=hsc;
		document.getElementById('priceHP').innerHTML=playerStats.priceHp;
		if(playerStats.maxRegSpeed<=10){
			document.getElementById('dispUpgReg').innerHTML='MAX';
		}else{
			document.getElementById('priceReg').innerHTML=''+playerStats.priceRegSpeed;
		}
		if(playerStats.maxReloadCd<=5){
			document.getElementById('dispUpgRel').innerHTML='MAX';
		}else{
			document.getElementById('priceRel').innerHTML=''+playerStats.priceReload;
		}
		if(playerStats.prSplit){
			document.getElementById('dispUnlPrSp').innerHTML='UNLOCKED'
		}
		document.getElementById('GoldCount').innerHTML=''+playerStats.gold
	}catch(e){console.log(e)}
	if(game){
		document.getElementById('canv').style.cursor='none';
	}else{
		document.getElementById('canv').style.cursor='';
	}
}
	

//})()
