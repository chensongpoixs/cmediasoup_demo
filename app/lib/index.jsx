import domready from 'domready';
import UrlParse from 'url-parse';
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import {
	applyMiddleware as applyReduxMiddleware,
	createStore as createReduxStore
} from 'redux';
import thunk from 'redux-thunk';
// import { createLogger as createReduxLogger } from 'redux-logger';
import randomString from 'random-string';
import * as faceapi from 'face-api.js';
import Logger from './Logger';
import * as utils from './utils';
import randomName from './randomName';
import deviceInfo from './deviceInfo';
import RoomClient from './RoomClient';
import RoomContext from './RoomContext';
import * as cookiesManager from './cookiesManager';
import * as stateActions from './redux/stateActions';
import reducers from './redux/reducers';
import Room from './components/Room';

const logger = new Logger();
const reduxMiddlewares = [ thunk ];

// if (process.env.NODE_ENV === 'development')
// {
// 	const reduxLogger = createReduxLogger(
// 		{
// 			duration  : true,
// 			timestamp : false,
// 			level     : 'log',
// 			logErrors : true
// 		});

// 	reduxMiddlewares.push(reduxLogger);
// }

let roomClient;
const store = createReduxStore(
	reducers,
	undefined,
	applyReduxMiddleware(...reduxMiddlewares)
);

window.STORE = store;

RoomClient.init({ store });

domready(async () =>
{
	logger.debug('DOM ready');

	await utils.initialize();

	run();
});

// Must be kept in sync with PixelStreamingProtocol::EToUE4Msg C++ enum.
const MessageType = {

    /**********************************************************************/

    /*
     * Control Messages. Range = 0..49.
     */
    IFrameRequest: 0,
    RequestQualityControl: 1,
    MaxFpsRequest: 2,
    AverageBitrateRequest: 3,
    StartStreaming: 4,
    StopStreaming: 5,
    LatencyTest: 6,
    RequestInitialSettings: 7,

    /**********************************************************************/

    /*
     * Input Messages. Range = 50..89.
     */

    // Generic Input Messages. Range = 50..59.
    UIInteraction: 50,
    Command: 51,

    // Keyboard Input Message. Range = 60..69.
    KeyDown: 60,
    KeyUp: 61,
    KeyPress: 62,

    // Mouse Input Messages. Range = 70..79.
    MouseEnter: 70,
    MouseLeave: 71,
    MouseDown: 72,
    MouseUp: 73,
    MouseMove: 74,
    MouseWheel: 75,
	MouseDoubleClick: 76,
    // Touch Input Messages. Range = 80..89.
    TouchStart: 80,
    TouchEnd: 81,
    TouchMove: 82,

    // Gamepad Input Messages. Range = 90..99
    GamepadButtonPressed: 90,
    GamepadButtonReleased: 91,
    GamepadAnalog: 92

    /**************************************************************************/
};




// Must be kept in sync with JavaScriptKeyCodeToFKey C++ array. The index of the
// entry in the array is the special key code given below.
const SpecialKeyCodes = {
    BackSpace: 8,
    Shift: 16,
    Control: 17,
    Alt: 18,
    RightShift: 253,
    RightControl: 254,
    RightAlt: 255
};

// We want to be able to differentiate between left and right versions of some
// keys.
function getKeyCode(e) {
    if (e.keyCode === SpecialKeyCodes.Shift && e.code === 'ShiftRight') return SpecialKeyCodes.RightShift;
    else if (e.keyCode === SpecialKeyCodes.Control && e.code === 'ControlRight') return SpecialKeyCodes.RightControl;
    else if (e.keyCode === SpecialKeyCodes.Alt && e.code === 'AltRight') return SpecialKeyCodes.RightAlt;
    else return e.keyCode;
}









let playerElementClientRect = undefined;
let normalizeAndQuantizeUnsigned = undefined;
let normalizeAndQuantizeSigned = undefined;
var load = 0;
var mouse_down = 0;
function setupNormalizeAndQuantize() 
{
	let videoElement = document.getElementById("mediasoup-demo-app-container").getElementsByClassName("peer-container")[0];
	
	normalizeAndQuantizeUnsigned = (x, y) => {
		let normalizedX = x / videoElement.offsetWidth;
		let normalizedY = (y / videoElement.offsetHeight)  ;
		return {
			x: normalizedX * 65535,
			y: normalizedY * 65535
		};
	};
	// Signed.
	normalizeAndQuantizeSigned = (x, y) => {
		let normalizedX = x / videoElement.offsetWidth;
		let normalizedY = y / videoElement.offsetHeight;
		return {
			x: normalizedX * 32767,
			y: normalizedY * 32767
		};
	};
	load = 1;
}


function initMouseMove()
{
 if(!document.all)
 {
  document.captureEvents(Event.MOUSEMOVE);
  //document.captureEvents(Event.CLICK);
 }
 document.onmousemove = mouseMove; //注册鼠标移动时事件处理函数
 
//document.onmouseover = mouseover;  //注册鼠标经过时事件处理函数
//document.onmouseout = mouseout;  //注册鼠标移开时事件处理函数
document.onmousedown = mouseDown;  //注册鼠标按下时事件处理函数
document.onmouseup = mouseUp;  //注册鼠标松开时事件处理函数
// p1.onmousemove = this.mouseMove;  
document.onclick = mouseClick;  //注册鼠标单击时事件处理函数
document.onmousewheel = scrollFunc;
document.onkeydown = keydown;
document.onkeyup = keyup;
document.ondblclick = dblclick;  //注册鼠标双击时事件处理函数
document.onkeypress = keypress;
 document.onmouseenter = mouseenter; // 移入事件。
 
  document.onmouseleave = mouseleave; // 移出事件。
 /*
 click：单击事件。
dblclick：双击事件。
mousedown：按下鼠标键时触发。
mouseup：释放按下的鼠标键时触发。
mousemove：鼠标移动事件。
mouseover：移入事件。
mouseout：移出事件。
mouseenter：移入事件。
mouseleave：移出事件。
contextmenu：右键事件。
 
 */
 
}

async function keypress(e)
{
	if (load === 0)
	{
		setupNormalizeAndQuantize();
	}
	
	let data = new DataView(new ArrayBuffer(3));
	data.setUint8(0, MessageType.KeyPress);
	data.setUint16(1, e.charCode, true);
	sendInputData(data.buffer);
	
}
async function keyup(e)
{
	if (load === 0)
	{
		setupNormalizeAndQuantize();
	}
	sendInputData(new Uint8Array([MessageType.KeyUp, getKeyCode(e)]).buffer);
}
async function dblclick(e)
{
	if (load === 0)
	{
		setupNormalizeAndQuantize();
	}
	return;
	var a = document.getElementById("mediasoup-demo-app-container").getElementsByClassName("peer-container")[0];
	// console.log( a );
	 //console.log('x = ' + x + ', y = ' + y +', clientwidth = ' +a.clientWidth + ', clientHeight ='+ a.clientHeight +' offsetLeft = ' + a.offsetLeft + ', offsetHeight ' + a.offsetHeight);
	 var clientx = 0;
	 var clienty = 0;
	// console.log('clientLeft = ' + e.clientLeft + ', clientTop = ' + e.clientTop);
	// var scrollx = a.offsetLeft  + a.clientLeft;
	// var scrolly = a.offsetTop + a.clientTop;
	 var new_width = a.offsetWidth + a.offsetLeft;
	 var new_height = (a.offsetHeight + a.offsetTop);
	 if ((x >= a.offsetLeft && x <= new_width) && ((y >= a.offsetTop ) && (y <= new_height)) )
	 {
		 clientx = x - a.offsetLeft;
		 clienty = y - a.offsetTop;
		// console.log('+++++++++++++++new_width = ' +new_width+', new_height= ' +new_height+', a.offsetLeft = '+a.offsetLeft+ ', a.offsetTop'+a.offsetTop+', clientx = ' + clientx + ', clienty = ' + clienty);
	 }
	 else 
	 { 
		 //console.log('-------------new_width = ' +new_width+', new_height= ' +new_height+', a.offsetLeft = '+a.offsetLeft+ ', a.offsetTop'+a.offsetTop+', clientx = ' + clientx + ', clienty = ' + clienty);
		 return;
	 }
	let coord = normalizeAndQuantizeUnsigned(clientx, clienty);
	
    let delta = normalizeAndQuantizeSigned(3, 3);
    let Data = new DataView(new ArrayBuffer(9));
    Data.setUint8(0, MessageType.MouseDoubleClick);
    Data.setUint16(1, coord.x, true);
    Data.setUint16(3, coord.y, true);
    Data.setInt16(5, delta.x, true);
    Data.setInt16(7, delta.y, true);
	console.log("send data -->>>>> move  x = " + coord.x + ", y = " + coord.y + ", deltax = " + delta.x + ", delta.y = " + delta.y);
	//console.log('send data -->>>>> move ');
    sendInputData(Data.buffer);
	
}
async function mouseover(e)
{
	if (load === 0)
	{
		setupNormalizeAndQuantize();
	}
	var a = document.getElementById("mediasoup-demo-app-container").getElementsByClassName("peer-container")[0];
	// console.log( a );
	 //console.log('x = ' + x + ', y = ' + y +', clientwidth = ' +a.clientWidth + ', clientHeight ='+ a.clientHeight +' offsetLeft = ' + a.offsetLeft + ', offsetHeight ' + a.offsetHeight);
	 var clientx = 0;
	 var clienty = 0;
	// console.log('clientLeft = ' + e.clientLeft + ', clientTop = ' + e.clientTop);
	// var scrollx = a.offsetLeft  + a.clientLeft;
	// var scrolly = a.offsetTop + a.clientTop;
	 var new_width = a.offsetWidth + a.offsetLeft;
	 var new_height = (a.offsetHeight + a.offsetTop);
	 if ((x >= a.offsetLeft && x <= new_width) && ((y >= a.offsetTop ) && (y <= new_height)) )
	 {
		 clientx = x - a.offsetLeft;
		 clienty = y - a.offsetTop;
		// console.log('+++++++++++++++new_width = ' +new_width+', new_height= ' +new_height+', a.offsetLeft = '+a.offsetLeft+ ', a.offsetTop'+a.offsetTop+', clientx = ' + clientx + ', clienty = ' + clienty);
	 }
	 else 
	 { 
		 //console.log('-------------new_width = ' +new_width+', new_height= ' +new_height+', a.offsetLeft = '+a.offsetLeft+ ', a.offsetTop'+a.offsetTop+', clientx = ' + clientx + ', clienty = ' + clienty);
		 return;
	 }
	let coord = normalizeAndQuantizeUnsigned(clientx, clienty);
	 //console.log('==================================================');
	//action_mouse(0, coord.x, coord.y, e.keyCode);
}

async function mouseout(e)
{
	if (load === 0)
	{
		setupNormalizeAndQuantize();
	}
	var a = document.getElementById("mediasoup-demo-app-container").getElementsByClassName("peer-container")[0];
	// console.log( a );
	 //console.log('x = ' + x + ', y = ' + y +', clientwidth = ' +a.clientWidth + ', clientHeight ='+ a.clientHeight +' offsetLeft = ' + a.offsetLeft + ', offsetHeight ' + a.offsetHeight);
	 var clientx = 0;
	 var clienty = 0;
	// console.log('clientLeft = ' + e.clientLeft + ', clientTop = ' + e.clientTop);
	// var scrollx = a.offsetLeft  + a.clientLeft;
	// var scrolly = a.offsetTop + a.clientTop;
	 var new_width = a.offsetWidth + a.offsetLeft;
	 var new_height = (a.offsetHeight + a.offsetTop);
	 if ((x >= a.offsetLeft && x <= new_width) && ((y >= a.offsetTop ) && (y <= new_height)) )
	 {
		 clientx = x - a.offsetLeft;
		 clienty = y - a.offsetTop;
		// console.log('+++++++++++++++new_width = ' +new_width+', new_height= ' +new_height+', a.offsetLeft = '+a.offsetLeft+ ', a.offsetTop'+a.offsetTop+', clientx = ' + clientx + ', clienty = ' + clienty);
	 }
	 else 
	 { 
		 //console.log('-------------new_width = ' +new_width+', new_height= ' +new_height+', a.offsetLeft = '+a.offsetLeft+ ', a.offsetTop'+a.offsetTop+', clientx = ' + clientx + ', clienty = ' + clienty);
		 return;
	 }
	let coord = normalizeAndQuantizeUnsigned(clientx, clienty);
	 //console.log('==================================================');
	//action_mouse(0, coord.x, coord.y, e.keyCode);
}

async function mouseenter(e)
{
	if (load === 0)
	{
		setupNormalizeAndQuantize();
	}
   let Data = new DataView(new ArrayBuffer(1));
	Data.setUint8(0, MessageType.MouseEnter);
	sendInputData(Data.buffer);
	
}


async function mouseleave(e)
{
	if (load === 0)
	{
		setupNormalizeAndQuantize();
	}
	let Data = new DataView(new ArrayBuffer(1));
	Data.setUint8(0, MessageType.MouseLeave);
	sendInputData(Data.buffer);
}

async  function scrollFunc(e) 
{ 
 
	if (load === 0)
	{
		setupNormalizeAndQuantize();
	}
	 var x,y;
	 if(!document.all)
	 {
	  x=e.pageX;
	  y=e.pageY;
	  
	 }else{
	  x=document.body.scrollLeft+event.clientX;
	  y=document.body.scrollTop+event.clientY;
	 }
	 
	var a = document.getElementById("mediasoup-demo-app-container").getElementsByClassName("peer-container")[0];
	 var clientx = 0;
	 var clienty = 0;
	 
	 if ((x >= a.offsetLeft || x <= (a.offsetWidth + a.offsetLeft)) && ((y >= a.offsetTop ) || (y <= (a.offsetHeight + a.offsetTop))) )
	 {
		 clientx = x - a.offsetLeft;
		 clienty = y - a.offsetTop;
	 }
	  
	 let coord = normalizeAndQuantizeUnsigned(clientx, clienty);
	
	 
    let Data = new DataView(new ArrayBuffer(7));
    Data.setUint8(0, MessageType.MouseWheel);
    Data.setInt16(1, e.wheelDelta, true);
    Data.setUint16(3, coord.x, true);
    Data.setUint16(5, coord.y, true);
    sendInputData(Data.buffer);
	
}


async function  keydown(e)
{
	 if (load === 0)
	{
		setupNormalizeAndQuantize();
	}
	console.log(e);
	sendInputData(new Uint8Array([MessageType.KeyDown, getKeyCode(e), e.repeat]).buffer);
	 
}

async function  mouseMove(e)
{
	
	if (load === 0)
	{
		setupNormalizeAndQuantize();
	}
	/*
	if (mouse_down === 1)
	{
		mouse_down = 0;
		return ;
	}
	*/
	//console.log(e);
	 var x,y;
	 if(!document.all)
	 {
	  x=e.pageX;
	  y=e.pageY;
	  //console.log('mouse mouseMove = ');
	 }else{
	  x=document.body.scrollLeft+event.clientX;
	  y=document.body.scrollTop+event.clientY;
	 }
	 
	  var a = document.getElementById("mediasoup-demo-app-container").getElementsByClassName("peer-container")[0];
	// console.log( a );
	 //console.log('x = ' + x + ', y = ' + y +', clientwidth = ' +a.clientWidth + ', clientHeight ='+ a.clientHeight +' offsetLeft = ' + a.offsetLeft + ', offsetHeight ' + a.offsetHeight);
	 var clientx = 0;
	 var clienty = 0;
	// console.log('clientLeft = ' + e.clientLeft + ', clientTop = ' + e.clientTop);
	// var scrollx = a.offsetLeft  + a.clientLeft;
	// var scrolly = a.offsetTop + a.clientTop;
	 var new_width = a.offsetWidth + a.offsetLeft;
	 var new_height = (a.offsetHeight + a.offsetTop);
	 if ((x >= a.offsetLeft && x <= new_width) && ((y >= a.offsetTop ) && (y <= new_height)) )
	 {
		 clientx = x - a.offsetLeft;
		 clienty = y - a.offsetTop;
		// console.log('+++++++++++++++new_width = ' +new_width+', new_height= ' +new_height+', a.offsetLeft = '+a.offsetLeft+ ', a.offsetTop'+a.offsetTop+', clientx = ' + clientx + ', clienty = ' + clienty);
	 }
	 else 
	 { 
		 //console.log('-------------new_width = ' +new_width+', new_height= ' +new_height+', a.offsetLeft = '+a.offsetLeft+ ', a.offsetTop'+a.offsetTop+', clientx = ' + clientx + ', clienty = ' + clienty);
		 return;
	 }
	 
	let coord = normalizeAndQuantizeUnsigned(clientx, clienty);
	
    let delta = normalizeAndQuantizeSigned(90, 90);
    let Data = new DataView(new ArrayBuffer(9));
    Data.setUint8(0, MessageType.MouseMove);
    Data.setUint16(1, coord.x, true);
    Data.setUint16(3, coord.y, true);
    Data.setInt16(5, delta.x, true);
    Data.setInt16(7, delta.y, true);
	console.log("send data -->>>>> move  x = " + coord.x + ", y = " + coord.y + ", deltax = " + delta.x + ", delta.y = " + delta.y);
	//console.log('send data -->>>>> move ');
    sendInputData(Data.buffer);
}

// 鼠标移动事件
async function  mouseClick(e)
{
	//if (load === 0)
	{
		setupNormalizeAndQuantize();
	}
	console.log('mouse Click = ' );
	console.log(e);
	 var x,y;
	 if(!document.all){
	 
	  x=e.pageX;
	  y=e.pageY;
	 }else{
	  x=document.body.scrollLeft+event.clientX;
	  y=document.body.scrollTop+event.clientY;
	 }
	 
	  var a = document.getElementById("mediasoup-demo-app-container").getElementsByClassName("peer-container")[0];
	// console.log( a );
	 //console.log('x = ' + x + ', y = ' + y +', clientwidth = ' +a.clientWidth + ', clientHeight ='+ a.clientHeight +' offsetLeft = ' + a.offsetLeft + ', offsetHeight ' + a.offsetHeight);
	 var clientx = 0;
	 var clienty = 0;
	// console.log('clientLeft = ' + e.clientLeft + ', clientTop = ' + e.clientTop);
	// var scrollx = a.offsetLeft  + a.clientLeft;
	// var scrolly = a.offsetTop + a.clientTop;
	 var new_width = a.offsetWidth + a.offsetLeft;
	 var new_height = (a.offsetHeight + a.offsetTop);
	 if ((x >= a.offsetLeft && x <= new_width) && ((y >= a.offsetTop ) && (y <= new_height)) )
	 {
		 clientx = x - a.offsetLeft;
		 clienty = y - a.offsetTop;
		// console.log('+++++++++++++++new_width = ' +new_width+', new_height= ' +new_height+', a.offsetLeft = '+a.offsetLeft+ ', a.offsetTop'+a.offsetTop+', clientx = ' + clientx + ', clienty = ' + clienty);
	 }
	 else 
	 { 
		 //console.log('-------------new_width = ' +new_width+', new_height= ' +new_height+', a.offsetLeft = '+a.offsetLeft+ ', a.offsetTop'+a.offsetTop+', clientx = ' + clientx + ', clienty = ' + clienty);
		 return;
	 }
	let coord = normalizeAndQuantizeUnsigned(clientx, clienty);
	
    let delta = normalizeAndQuantizeSigned(3, 3);
    let Data = new DataView(new ArrayBuffer(9));
    Data.setUint8(0, MessageType.MouseMove);
    Data.setUint16(1, coord.x, true);
    Data.setUint16(3, coord.y, true);
    Data.setInt16(5, delta.x, true);
    Data.setInt16(7, delta.y, true);
	console.log("send data -->>>>> move  x = " + coord.x + ", y = " + coord.y + ", deltax = " + delta.x + ", delta.y = " + delta.y);
	//console.log('send data -->>>>> move ');
    sendInputData(Data.buffer);
}


async function  mouseDown(e)
{
	if (load === 0)
	{
		setupNormalizeAndQuantize();
	}
	 var x,y;
	 if(!document.all){
	 
	  x=e.pageX;
	  y=e.pageY;
	 }else{
	  x=document.body.scrollLeft+event.clientX;
	  y=document.body.scrollTop+event.clientY;
	 }
	mouse_down = 1;
	 let coord = normalizeAndQuantizeUnsigned(x, y);
    let Data = new DataView(new ArrayBuffer(6));
    Data.setUint8(0, MessageType.MouseDown);
    Data.setUint8(1, e.button);
    Data.setUint16(2, coord.x, true);
    Data.setUint16(4, coord.y, true);
    sendInputData(Data.buffer);
	 
}


async function  mouseUp(e)
{
	if (load === 0)
	{
		setupNormalizeAndQuantize();
	}
	mouse_down = 0;
	 var x,y;
	 if(!document.all){
	 
	  x=e.pageX;
	  y=e.pageY;
	 }else{
	  x=document.body.scrollLeft+event.clientX;
	  y=document.body.scrollTop+event.clientY;
	 }
	 
	 
	  var a = document.getElementById("mediasoup-demo-app-container").getElementsByClassName("peer-container")[0];
	// console.log( a );
	 //console.log('x = ' + x + ', y = ' + y +', clientwidth = ' +a.clientWidth + ', clientHeight ='+ a.clientHeight +' offsetLeft = ' + a.offsetLeft + ', offsetHeight ' + a.offsetHeight);
	 var clientx = 0;
	 var clienty = 0;
	// console.log('clientLeft = ' + e.clientLeft + ', clientTop = ' + e.clientTop);
	// var scrollx = a.offsetLeft  + a.clientLeft;
	// var scrolly = a.offsetTop + a.clientTop;
	 var new_width = a.offsetWidth + a.offsetLeft;
	 var new_height = (a.offsetHeight + a.offsetTop);
	 if ((x >= a.offsetLeft && x <= new_width) && ((y >= a.offsetTop ) && (y <= new_height)) )
	 {
		 clientx = x - a.offsetLeft;
		 clienty = y - a.offsetTop;
		// console.log('+++++++++++++++new_width = ' +new_width+', new_height= ' +new_height+', a.offsetLeft = '+a.offsetLeft+ ', a.offsetTop'+a.offsetTop+', clientx = ' + clientx + ', clienty = ' + clienty);
	 }
	 else 
	 { 
		 //console.log('-------------new_width = ' +new_width+', new_height= ' +new_height+', a.offsetLeft = '+a.offsetLeft+ ', a.offsetTop'+a.offsetTop+', clientx = ' + clientx + ', clienty = ' + clienty);
		 return;
	 }
	 
	 
	 
	 
	 
	 let coord = normalizeAndQuantizeUnsigned(clientx, clienty);;
    let Data = new DataView(new ArrayBuffer(6));
    Data.setUint8(0, MessageType.MouseUp);
    Data.setUint8(1, e.button);
    Data.setUint16(2, coord.x, true);
    Data.setUint16(4, coord.y, true);
   sendInputData(Data.buffer);
	//roomClient.sendChatMessage(Data.buffer);
}
async function sendInputData(data)
{
	roomClient.sendChatMessage(data);
}
async function action_mouse(action, wight, height, keyvalue)
{
	 var move_xy =
	 {
		 "event" : action,
		 "wight" : wight,
		 "height": height,
		 "windowwidth" : window.screen.width,
		 "windowheight" : window.screen.height,
		 "key": keyvalue
	 };
	// var postion = 'x = ' + x + ', y = ' + y +', wight = '+	 document.body.offsetWidth  + ', height = ' + document.body.offsetHeight;
	// console.log(JSON.stringify(move_xy));
	 //await this.test();
	// roomClient.sendMoveMessage(JSON.stringify(move_xy));
	 
	 //logger.debug('sendMoveMessage() [text:"%s]', move_xy);
}


// 鼠标移动事件
async function  old_mouseMove(e)
{
	//if (load === 0)
	{
		setupNormalizeAndQuantize();
	}
	//console.log('==========================');
	//console.log( e);
	//console.log('==========================');
	 var x,y;
	 if(!document.all){
	 
	  x=e.pageX;
	  y=e.pageY;
	 }else{
	  x=document.body.scrollLeft+event.clientX;
	  y=document.body.scrollTop+event.clientY;
	 }
	 var postion = 'x = ' + x + ', y = ' + y +', wight = '+	 document.body.offsetWidth  + ', height = ' + document.body.offsetHeight;
	 console.log(postion);
	 //await this.test();
	 // 对方的信息数组获取控件位置的信息的数组
	 //var a = document.getElementById("test").getElementsByTagName("div"); //peer-container active-speaker
	 var b = document.getElementById("mediasoup-demo-app-container").getElementsByClassName("peer-container");
	 console.log( b );
	 var a = document.getElementById("mediasoup-demo-app-container").getElementsByClassName("peer-container")[0];
	 console.log( a );
	 console.log('offsetLeft = ' + a.offsetLeft + ', offsetHeight ' + a.offsetHeight);
	const temp_peers =  document.getElementById('mediasoup-demo-app-container');
	const temp_peer =  document.getElementById('video');
	console.log("=================mediasoup-demo-app-container============ temp peers = " + temp_peers.right + ", offsetLeft = " + temp_peers.offsetLeft);
	console.log("===============video ============== temp peer = " + temp_peer);
	 roomClient.sendChatMessage(postion);
	 
	 logger.debug('sendChatMessage() ---[text:"%s]', postion);
}

async function run()
{
	logger.debug('run() [environment:%s]', process.env.NODE_ENV);

	const urlParser = new UrlParse(window.location.href, true);
	const peerId = randomString({ length: 8 }).toLowerCase();
	let roomId = urlParser.query.roomId;
	let displayName =
		urlParser.query.displayName || (cookiesManager.getUser() || {}).displayName;
	const handler = urlParser.query.handler;
	const useSimulcast = urlParser.query.simulcast !== 'false';
	const useSharingSimulcast = urlParser.query.sharingSimulcast !== 'false';
	const forceTcp = urlParser.query.forceTcp === 'true';
	const produce = urlParser.query.produce !== 'false';
	const consume = urlParser.query.consume !== 'false';
	const forceH264 = urlParser.query.forceH264 === 'true';
	const forceVP9 = urlParser.query.forceVP9 === 'true';
	const svc = urlParser.query.svc;
	const datachannel = urlParser.query.datachannel !== 'false';
	const info = urlParser.query.info === 'true';
	const faceDetection = urlParser.query.faceDetection === 'true';
	const externalVideo = urlParser.query.externalVideo === 'true';
	const throttleSecret = urlParser.query.throttleSecret;
	const e2eKey = urlParser.query.e2eKey;

	// Enable face detection on demand.
	if (faceDetection)
		await faceapi.loadTinyFaceDetectorModel('/resources/face-detector-models');

	if (info)
	{
		// eslint-disable-next-line require-atomic-updates
		window.SHOW_INFO = true;
	}

	if (throttleSecret)
	{
		// eslint-disable-next-line require-atomic-updates
		window.NETWORK_THROTTLE_SECRET = throttleSecret;
	}

	if (!roomId)
	{
		roomId = randomString({ length: 8 }).toLowerCase();

		urlParser.query.roomId = roomId;
		window.history.pushState('', '', urlParser.toString());
	}

	// Get the effective/shareable Room URL.
	const roomUrlParser = new UrlParse(window.location.href, true);

	for (const key of Object.keys(roomUrlParser.query))
	{
		// Don't keep some custom params.
		switch (key)
		{
			case 'roomId':
			case 'handler':
			case 'simulcast':
			case 'sharingSimulcast':
			case 'produce':
			case 'consume':
			case 'forceH264':
			case 'forceVP9':
			case 'forceTcp':
			case 'svc':
			case 'datachannel':
			case 'info':
			case 'faceDetection':
			case 'externalVideo':
			case 'throttleSecret':
			case 'e2eKey':
				break;

			default:
				delete roomUrlParser.query[key];
		}
	}
	delete roomUrlParser.hash;

	const roomUrl = roomUrlParser.toString();

	let displayNameSet;

	// If displayName was provided via URL or Cookie, we are done.
	if (displayName)
	{
		displayNameSet = true;
	}
	// Otherwise pick a random name and mark as "not set".
	else
	{
		displayNameSet = false;
		displayName = randomName();
	}
		//displayName = 'chensong';
	// Get current device info.
	const device = deviceInfo();

	store.dispatch(
		stateActions.setRoomUrl(roomUrl));

	store.dispatch(
		stateActions.setRoomFaceDetection(faceDetection));

	store.dispatch(
		stateActions.setMe({ peerId, displayName, displayNameSet, device }));

	roomClient = new RoomClient(
		{
			roomId,
			peerId,
			displayName,
			device,
			handlerName : handler,
			useSimulcast,
			useSharingSimulcast,
			forceTcp,
			produce,
			consume,
			forceH264,
			forceVP9,
			svc,
			datachannel,
			externalVideo,
			e2eKey
		});
	
	// NOTE: For debugging.
	// eslint-disable-next-line require-atomic-updates
	window.CLIENT = roomClient;
	// eslint-disable-next-line require-atomic-updates
	window.CC = roomClient;

	render(
		<Provider store={store}>
			<RoomContext.Provider value={roomClient}>
				<Room />
			</RoomContext.Provider>
		</Provider>,
		document.getElementById('mediasoup-demo-app-container')
	);

	initMouseMove();
}






// NOTE: Debugging stuff.

window.__sendSdps = function()
{
	logger.warn('>>> send transport local SDP offer:');
	logger.warn(
		roomClient._sendTransport._handler._pc.localDescription.sdp);

	logger.warn('>>> send transport remote SDP answer:');
	logger.warn(
		roomClient._sendTransport._handler._pc.remoteDescription.sdp);
};

window.__recvSdps = function()
{
	logger.warn('>>> recv transport remote SDP offer:');
	logger.warn(
		roomClient._recvTransport._handler._pc.remoteDescription.sdp);

	logger.warn('>>> recv transport local SDP answer:');
	logger.warn(
		roomClient._recvTransport._handler._pc.localDescription.sdp);
};

let dataChannelTestInterval = null;

window.__startDataChannelTest = function()
{
	let number = 0;

	const buffer = new ArrayBuffer(32);
	const view = new DataView(buffer);

	dataChannelTestInterval = window.setInterval(() =>
	{
		if (window.DP)
		{
			view.setUint32(0, number++);
			roomClient.sendChatMessage(buffer);
		}
	}, 100);
};

window.__stopDataChannelTest = function()
{
	window.clearInterval(dataChannelTestInterval);

	const buffer = new ArrayBuffer(32);
	const view = new DataView(buffer);

	if (window.DP)
	{
		view.setUint32(0, Math.pow(2, 32) - 1);
		window.DP.send(buffer);
	}
};

window.__testSctp = async function({ timeout = 100, bot = false } = {})
{
	let dp;

	if (!bot)
	{
		await window.CLIENT.enableChatDataProducer();

		dp = window.CLIENT._chatDataProducer;
	}
	else
	{
		await window.CLIENT.enableBotDataProducer();

		dp = window.CLIENT._botDataProducer;
	}

	logger.warn(
		'<<< testSctp: DataProducer created [bot:%s, streamId:%d, readyState:%s]',
		bot ? 'true' : 'false',
		dp.sctpStreamParameters.streamId,
		dp.readyState);

	function send()
	{
		dp.send(`I am streamId ${dp.sctpStreamParameters.streamId}`);
	}

	if (dp.readyState === 'open')
	{
		send();
	}
	else
	{
		dp.on('open', () =>
		{
			logger.warn(
				'<<< testSctp: DataChannel open [streamId:%d]',
				dp.sctpStreamParameters.streamId);

			send();
		});
	}

	setTimeout(() => window.__testSctp({ timeout, bot }), timeout);
};

setInterval(() =>
{
	if (window.CLIENT._sendTransport)
	{
		window.H1 = window.CLIENT._sendTransport._handler;
		window.PC1 = window.CLIENT._sendTransport._handler._pc;
		window.DP = window.CLIENT._chatDataProducer;
	}
	else
	{
		delete window.PC1;
		delete window.DP;
	}

	if (window.CLIENT._recvTransport)
	{
		window.H2 = window.CLIENT._recvTransport._handler;
		window.PC2 = window.CLIENT._recvTransport._handler._pc;
	}
	else
	{
		delete window.PC2;
	}
}, 2000);
