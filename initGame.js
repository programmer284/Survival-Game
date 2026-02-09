const canv = document.getElementById('canv');
const ctx = canv.getContext('2d');
var objects = [];


const keyEvents = [];
for(let i=0; i<256; i++){
	keyEvents.push(false);
}

function toBool(expr){if(expr){return true;}else{return false;}};
function distance(x1,y1,x2,y2){return ((x2-x1)**2+(y2-y1)**2)**0.5};
function getAngle(vectorX,vectorY){ //angle in radians
		if(vectorX==0)return -Math.sign(vectorY)*Math.PI/2
		return vectorX<0 ? Math.atan(vectorY/vectorX)-Math.PI : Math.atan(vectorY/vectorX)
    }


document.addEventListener('keydown',(event)=>{keyEvents[event.keyCode]=true});
document.addEventListener('keyup',(event)=>{keyEvents[event.keyCode]=false});

//classes
function Comp(args){
	this.type=args?.type ?? 'rect'
	this.width=args?.width ?? 10;
	this.height=args?.height ?? 10;
	this.midX=args?.x ?? 0;
	this.midY=args?.y ?? 0;
	this.rad=args?.rad ?? 10;
	this.color=args?.color ?? '#000000';
	this.angle=args?.angle ?? 0; //radians
	this.tiltAngle=args?.tiltAngle ?? 0; //radians, style angle
	//img
	if(this.type=='img'){
		this.img=new Image();
		this.source=args?.source ?? '';
		this.img.src=this.source;
		this.img.addEventListener('load',()=>{
			this.width=args.width ?? this.img.width;
			this.height=args.height ?? this.img.height;
		})
	}
	//
	//text
	if(this.type=='text'){
		this.content=args?.content ?? '';
		this.font=args?.font ?? '11px Arial'; // format: 'bold italic size family' - ex. 'bold italic 11px Arial'
		this.textBaseline=args?.textBaseline ?? 'middle'; // top, hanging, middle, alphabetic, ideographic, bottom
		this.textAlign=args?.textAlign ?? 'center'; // left, right, center, start, end
	}
	//
	this.visible=args?.visible ?? true;
	objects.push(this);
	this.getObjType=function(){
		return this.type
	};
	
	//important function
	
	this.refresh=function(){
		if(this.type=='rect' || this.type=='img'){
			this.width=Math.abs(this.width)
			this.height=Math.abs(this.height)
			this.rad=(this.width*this.height)**0.5
		}
		if(this.visible && this.type=='rect'){
			ctx.save();
			ctx.translate(this.midX,this.midY);
			ctx.rotate(this.angle+this.tiltAngle);
			ctx.fillStyle=this.color;
			ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
			ctx.restore();
		};
		if(this.visible && this.type=='circ'){
			ctx.fillStyle=this.color;
			ctx.strokeStyle=this.color;
			ctx.beginPath();
			ctx.arc(this.midX, this.midY, this.rad, 0, 2*Math.PI);
			ctx.fill();
			ctx.stroke();
			ctx.closePath();
		};
		if(this.visible && this.type=='img'){	
			ctx.save();
			ctx.translate(this.midX,this.midY);
			ctx.rotate(this.angle+this.tiltAngle);
			ctx.drawImage(this.img,-this.width/2,-this.height/2,this.width,this.height);
			ctx.restore();
		};
		if(this.visible && this.type=='text'){
			ctx.save();
			ctx.translate(this.midX,this.midY);
			ctx.rotate(this.angle+this.tiltAngle);
			ctx.fillStyle=this.color;
			ctx.font=this.font;
			ctx.textBaseline=this.textBaseline;
			ctx.textAlign=this.textAlign;
			ctx.fillText(this.content,0,0);
			ctx.restore();
		};
	};
	this.del=function(){
		try{
		objects.splice(objects.indexOf(this),1)
		}catch(e){console.log('could not delete object')}
	};
	this.touches=function(other){ // circular hitbox
		/*
		if((other.getObjType() == 'rect' || other.getObjType() == 'img') && this.getObjType() != 'circ'){
			let sumWidth=(this.width*Math.abs(Math.cos(this.angle))+this.height*Math.abs(Math.sin(this.angle))+other.width*Math.abs(Math.cos(other.angle))+other.height*Math.abs(Math.sin(other.angle)))/2
			let sumHeight=(this.height*Math.abs(Math.cos(this.angle))+this.width*Math.abs(Math.sin(this.angle))+other.midY+other.height*Math.abs(Math.cos(other.angle))+other.width*Math.abs(Math.sin(other.angle)))/2
			if(Math.abs(this.midX-other.midX)>sumWidth || Math.abs(this.midY-other.midY)>sumHeight){
				return false;
			}else{
				return true;
			}
		}
		*/
		//if(other.getObjType() == 'circ' || this.getObjType() == 'circ'){
			if(distance(this.midX,this.midY,other.midX,other.midY) > (this.rad+other.rad)){
				return false;
			}else{
				return true;
			}
		//}
	};
	this.touchesEdge=function(edge){
		if(this.type=='rect' || this.type=='img'){
			if(edge == 'top' && this.midY-this.height/2 <= 0){
				return true;
			};
			if(edge == 'bottom' && this.midY+this.height/2 >= canv.height){
				return true;
			};
			if(edge == 'left' && this.midX-this.width/2 <= 0){
				return true;
			};
			if(edge == 'right' && this.midX+this.width/2 >= canv.width){
				return true;
			};
		}
		if(this.type=='circ'){
			if(edge == 'top' && this.midY+this.radius <= 0){
				return true;
			};
			if(edge == 'bottom' && this.midY+this.radius >= canv.height){
				return true;
			};
			if(edge == 'left' && this.midX+this.radius <= 0){
				return true;
			};
			if(edge == 'right' && this.midX+this.radius >= canv.width){
				return true;
			};
		}
		return false;
	};
	this.moveHor=function(dx){
		this.midX+=dx;
	};
	this.moveVer=function(dy){
		this.midY+=dy
	};
	this.moveDir=function(d){
		this.midX+=d*Math.cos(this.angle);
		this.midY+=d*Math.sin(this.angle);
	}
}

Comp.prototype.getArguments=function(){return ['type','width','height','x','y','rad','color','angle','tiltAngle','source','visible','content','font','textBaseline','textAlign']};
Comp.prototype.getTypes=function(){return ['img','circ','rect','text']};

//

//update
let updateCanv=setInterval(()=>{
	ctx.clearRect(0,0,canv.width,canv.height);
	objects.forEach((el)=>{try{el?.refresh()}catch(e){}});
},40)
//
