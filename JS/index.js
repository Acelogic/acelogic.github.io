new TypeIt('.type-it', {
speed:60
});

new TypeIt('.console-typeit', {

});

new TypeIt('.console-typeit2', {

});




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

//Console Code

  INPUT_HEAD = 'miguel:~ root$ ';


function initConsole() {
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

	function enter() {
		lastLine = getLastLine()
		input = lastLine.html().slice(INPUT_HEAD.length);
		processInput(input);
		newLine(INPUT_HEAD);
	}
	function processInput(input) {
		commands = {

			'help': 'Welcome to my site! You can type: <br>&nbsp;<span class="blue consoleLineFont">bio</span>: Short bio about myself.<br>&nbsp;<span class="blue consoleLineFont">social</span>: Get in touch <br>&nbsp;<span class="blue consoleLineFont">hobbies</span>: Fun stuff<br>',
			'bio': '18 | Computer Engineering Major. Interested in IC design, Low Level Firmware, Reverse Engineering & Operating Systems',
			'social': '<span class="blue consoleLineFont">&nbsp;Twitter: <a class="consoleLineFont" href="http://www.twitter.com/Acelogic_" target="_blank">@Acelogic_</a></span> <br><span class="green consoleLineFont">&nbsp;Github: &nbsp;&nbsp;<a class="consoleLineFont "href="http://www.github.com/Acelogic" target="_blank">@Acelogic</a></span> <br>',
			'hobbies': 'Programming, Reading, and Guitar.',
			'ls':'really?...',
			'man': 'you won\'t find that here.',
			'cd' : 'Where ? Oh yeah that\'s right this is not a real console',
			'baus': 'thanks BAUS',
			'wow': 'much wow, indeed',
			'test': 'did I pass?',
			'sudo': 'Invaid Sudoer, Admins are going to be notified!!!!!',
			'pacman': 'I use arch too btw',
			'clear': '\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n',
		}

		if (input in commands) {
			if (typeof commands[input] === 'function') commands[input]();
			else newLine(commands[input]);
		}
		else if (input.length > 0) {
			newLine('-zsh: ' + input + ': command not found');
		}
	}

	function newLine(output) {
		k = getLastLine().clone();
		k.html(output);
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