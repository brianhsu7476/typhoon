document.querySelector('#imageInput').addEventListener('change', update);
var CX=document.querySelector('#cx'), CY=document.querySelector('#cy'), R=document.querySelector('#radius');
CX.value=300, CY.value=300, R.value=1.5;
var cx=Number(CX.value), cy=Number(CY.value), r=Number(R.value);
var w1=2048, h1=2048;
var saveURL='';

function f(x, y){
	var d=(x-cx)*(x-cx)+(y-cy)*(y-cy);
	if(d==0)return [];
	d=Math.sqrt(d);
	var theta=Math.atan2(y-cy, x-cx)+r*Math.log(d);
	return [Math.round(cx+d*Math.cos(theta)), Math.round(cy+d*Math.sin(theta))];
}

function inversion(){
	var cv0=document.querySelector('#original'), ct0=cv0.getContext('2d');
	var cv1=document.querySelector('#inversion'), ct1=cv1.getContext('2d');
	var w0=cv0.width, h0=cv0.height;
	cv1.width=w1, cv1.height=h1;
	var origin=ct0.getImageData(0, 0, cv0.width, cv0.height), inv=[];
	for(var i=0; i<w1*h1*4; ++i)inv.push(0);
	for(var i=0; i<h1; ++i)for(var j=0; j<w1; ++j){
		var ret=f(cx-h1/2+i, cy-w1/2+j);
		if(ret.length==0)continue;
		x0=ret[0], y0=ret[1];
		if(0<=x0&&x0<h0&&0<=y0&&y0<w0)for(var k=0; k<4; ++k)inv[4*(i*w1+j)+k]=origin.data[4*(x0*w0+y0)+k];
	}
	var inverse=ct1.getImageData(0, 0, cv1.width, cv1.height);
	for(var i=0; i<inv.length; ++i)inverse.data[i]=inv[i];
	ct1.putImageData(inverse, 0, 0);
	document.querySelector('#text1').innerHTML='颱風天計算完成（在網頁的最下面）！';
	document.querySelector('#button1').innerHTML='<input type="button" value="下載颱風天" onclick="download()">';
	saveURL=cv1.toDataURL('image/png');
}

function update(evt){
	const file=evt.target.files[0];
	if(!file)return;
	const img=new Image();
	img.onload=function(){
		var canvas=document.querySelector('#original'), ctx=canvas.getContext('2d');
		canvas.height=img.height, canvas.width=img.width;
		ctx.drawImage(img, 0, 0);
		upd();
	};
	const reader=new FileReader();
	reader.onload=function(evt){img.src=evt.target.result;};
	reader.readAsDataURL(file);
}

function upd(){
	var cv0=document.querySelector('#original'), ct0=cv0.getContext('2d');
	var cv1=document.querySelector('#circle'), ct1=cv1.getContext('2d');
	cv1.width=cv0.width, cv1.height=cv0.height;
	var origin=ct0.getImageData(0, 0, cv0.width, cv0.height);
	ct1.putImageData(origin, 0, 0);
	cx=Number(CX.value), cy=Number(CY.value), r=Number(R.value);

	var ret=f(cx-h1/2, cy);
	ct1.moveTo(ret[1], ret[0]);
	ct1.beginPath();
	for(var i=-h1/2, j=0; i<h1/2; ++i){
		var ret=f(cx+i, cy+j);
		ct1.lineTo(ret[1], ret[0]);
	}
	ct1.stroke();
	ret=f(cx, cy-w1/2);
	ct1.moveTo(ret[1], ret[0]);
	ct1.beginPath();
	for(var i=0, j=-w1/2; j<w1/2; ++j){
		var ret=f(cx+i, cy+j);
		ct1.lineTo(ret[1], ret[0]);
	}
	ct1.stroke();
}

function inverse(){
	document.querySelector('#text1').innerHTML='正在計算颱風天...';
	setTimeout(function(){
		inversion(cx, cy, r);
	}, 0);
}

function download(){
	var link=document.createElement('a');
	link.href=saveURL, link.download='inversion.png';
	document.body.appendChild(link), link.click(), document.body.removeChild(link);
}

document.onkeydown=function(e){
	e=window.event||e;
	var k=e.keyCode;
	if(k==13||k==108)upd();
}
