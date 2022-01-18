//Type it Text Code
new TypeIt('.type-it', {
speed:65
});

new TypeIt('.console-typeit', {

});

new TypeIt('.console-typeit2', {

});

//Image Blur Code

progressively.init({
    delay: 100,
    throttle: 300,
    smBreakpoint: 600,
    onLoad: function(elem) {
      console.log(elem);
    },
    onLoadComplete: function() {
      console.log('All images have finished loading (Index) ');
    }
  });

///////////////////////////////////////Console Code////////////////////////////////////////////////////
  INPUT_HEAD = 'miguel:~ root$ ';


function initConsole(){
	// handle special keys:
	$(document).keydown(function(e) {
		key = e.which || e.keyCode;

		// if backspace
		if (key === 8 || key === 46) {
			e.preventDefault();
			return backspace();
		}
	})

	// handle letter keys:
	$(document).keypress(function(e){
		key = e.which || e.keyCode;

		// if enter/return
		if (key === 13) {
			return enter();
		}

		// otherwise, insert char into console
		letter = String.fromCharCode(key)
		lastLine = getLastLine();
		lastLine.html(lastLine.html() + letter)

	})

	function backspace() {
		k = getLastLine();
		if (k.html().length > INPUT_HEAD.length) {
			k.html(k.html().slice(0, -1));
		}
	} 

	// TODO: implement clear command
	// TODO: Implement blinking cursor correctly

	function enter() {
		lastLine = getLastLine()
		input = lastLine.html().slice(INPUT_HEAD.length);
		processInput(input);
		newLine(INPUT_HEAD);
	}
	function processInput(input) {
		commands = {
			'help': 'Welcome to my site! You can type: <br>&nbsp;<span class="blue consoleLineFont">bio</span>: Short bio about myself.<br>&nbsp;<span class="blue consoleLineFont">social</span>: Get in touch <br>&nbsp;<span class="blue consoleLineFont">hobbies</span>: Fun stuff<br>',
			'bio': '22 | Computer Science Major. Interested in Web3, Low Level Firmware, Reverse Engineering & Operating Systems',
			'social': '<span class="blue consoleLineFont">&nbsp;Twitter: <a class="consoleLineFont" href="http://www.twitter.com/Acelogic_" target="_blank">@Acelogic_</a></span> <br><span class="green consoleLineFont">&nbsp;Github: &nbsp;&nbsp;<a class="consoleLineFont "href="http://www.github.com/Acelogic" target="_blank">@Acelogic</a></span> <br>',
			'hobbies': 'Programming, Reading, Guitar, and touching grass',
			'ls':'really?...',
			'man': 'you won\'t find that here.',
			'cd' : 'Where ? Oh yeah that\'s right this is not a real console',
			'baus': 'thanks BAUS',
			'wow': 'much wow, indeed',
			'test': 'did I pass?',
			'sudo': 'Invaid Sudoer, Admins are going to be notified!!!!!',
			'pacman': 'I use arch too btw',
			'pacman -Syu': 'I use arch too btw :)',
			'clear': 'Not Going to Work Buddy :(',
			'apt': 'We don\'t do that here', 
			'apt-get update': 'We don\'t do that here',
			'apt-get upgrade': 'We don\'t do that here', 
		}

		if (input in commands) {
			if (typeof commands[input] === 'function') commands[input]();
			else newLine(commands[input]);
		}
		else if (input.length > 0) {
			newLine('zsh: ' + input + ': command not found');
		}
	}

	function newLine(output) {
		k = getLastLine().clone();
		k.html(output);
		$("#console").find('.consoleLine').removeClass('blinkplz') //Remove Blinking Before Appending
		$("#console").append(k);
		// auto scroll down
		$("#console").scrollTop($("#console")[0].scrollHeight)
	}
	function getLastLine() {
		return $("#console").find(".consoleLine").last();
	}
}

function initAll() {
	initConsole();
}
$(document).ready(initAll);
///////////////////////////////////////Console Code End ////////////////////////////////////////////////////



///////////////////////////////////////   Skills Code   ////////////////////////////////////////////////////

var skills = [
	{"header" : "INTERESTS",
	  "captions" : [
		"Web",
		"OS",
		"Mobile",
		"Design",
		"AI"
	  ],
	  "values" : [
		0.70,
		0.90,
		0.70,
		0.80,
		0.70
	  ]
	},
	{"header" : "LANGUAGES",
	  "captions" : [
		"C++",
		"C",
		"JS",
		"Scala",
		"Java"
	  ],
	  "values" : [
		0.80,
		0.85,
		0.90,
		0.70,
		0.90
	  ]
	},
	{"header" : "MISC",
	  "captions" : [
		"Linux",
		"git",
		"Robotics",
		"Drivers",
		"Shell"
	  ],
	  "values" : [
		0.85,
		0.85,
		0.75,
		0.60,
		0.80
	  ]
	}
  ];
  
  var pentagonIndex = 0;
  var valueIndex = 0;
  var width = 0;
  var height = 0;
  var radOffset = Math.PI/2
  var sides = 5; // Number of sides in the polygon
  var theta = 2 * Math.PI/sides; // radians per section
  
  function getXY(i, radius) {
	return {"x": Math.cos(radOffset +theta * i) * radius*width + width/2,
	  "y": Math.sin(radOffset +theta * i) * radius*height + height/2};
  }
  
  var hue = [];
  var hueOffset = 134; //Change Color
  
  for (var s in skills) {
	$(".hexGraph").append('<div class="pentagon" id="interests"><div class="header"></div><canvas class="pentCanvas"/></div>');
	hue[s] = (hueOffset + s * 255/skills.length) % 255;
  }
  
  $(".pentagon").each(function(index){
	width = $(this).width();
	height = $(this).height();
	var ctx = $(this).find('canvas')[0].getContext('2d');
	ctx.canvas.width = width;
	ctx.canvas.height = height;
	ctx.font="15px Monospace";
	ctx.textAlign="center";
	
	/*** LABEL ***/
	color = "hsl("+hue[pentagonIndex]+", 100%, 50%)";
	ctx.fillStyle = color;
	ctx.fillText(skills[pentagonIndex].header, width/2, 15);
  
	ctx.font="13px Monospace";   
  
	/*** PENTAGON BACKGROUND ***/
	for (var i = 0; i < sides; i++) {
	  // For each side, draw two segments: the side, and the radius
	  ctx.beginPath();
	  xy = getXY(i, 0.3);
	  colorJitter = 25 + theta*i*2;
	  color = "hsl("+hue[pentagonIndex]+",100%," + colorJitter + "%)";
	  ctx.fillStyle = color;
	  ctx.strokeStyle = color;
	  ctx.moveTo(0.5*width, 0.5*height); //center
	  ctx.lineTo(xy.x, xy.y);
	  xy = getXY(i+1, 0.3);
	  ctx.lineTo(xy.x, xy.y);
	  xy = getXY(i, 0.37);
	  console.log();
	  ctx.fillText(skills[ pentagonIndex].captions[valueIndex],xy.x, xy.y +5);
	  valueIndex++;
	  ctx.closePath();
	  ctx.fill();
	  ctx.stroke();
	}
	
	valueIndex = 0;
	ctx.beginPath();
	ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
	ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
	ctx.lineWidth = 5;
	var value = skills[pentagonIndex].values[valueIndex];
	xy = getXY(i, value * 0.3);
	ctx.moveTo(xy.x,xy.y);
	/*** SKILL GRAPH ***/
	for (var i = 0; i < sides; i++) {
	  xy = getXY(i, value * 0.3);
	  ctx.lineTo(xy.x,xy.y);
	  valueIndex++;
	  value = skills[pentagonIndex].values[valueIndex];
	}
	ctx.closePath();
	ctx.stroke();
	ctx.fill();
	valueIndex = 0;  
	pentagonIndex++;
	});
	

// Fade in the Skills Section (Still needs some work)
$(function() {
	//caches a jQuery object containing the header element
	var header = $(".animation-test");
	$(window).scroll(function() {
			var scroll = $(window).scrollTop();

			if (scroll >= 500) {
					header.removeClass('fade-in').addClass("fade-in");
			} else {
					header.removeClass("fade-in").addClass('hexGraph');
			}
	});
});
///////////////////////////////////////   Skills Code End  ////////////////////////////////////////////////////