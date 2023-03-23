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

function initConsole() {
  // handle special keys:
  $("#console-input").keydown(function (e) {
    key = e.which || e.keyCode;

    // if backspace
    if (key === 8 || key === 46) {
      e.preventDefault();
      return backspace();
    }
  });

  // handle letter keys:
  $("#console-input").keypress(function (e) {
    key = e.which || e.keyCode;

    // if enter/return
    if (key === 13) {
      return enter();
    }

    // otherwise, insert char into console
    letter = String.fromCharCode(key);
    lastLine = getLastLine();
    lastLine.html(lastLine.html() + letter);
  });

  function backspace() {
    k = getLastLine();
    if (k.html().length > INPUT_HEAD.length) {
      k.html(k.html().slice(0, -1));
    }
  }

  function enter() {
    lastLine = getLastLine();
    input = lastLine.html().slice(INPUT_HEAD.length);
    processInput(input);
    newLine(INPUT_HEAD);
  }

  function processInput(input) {
	  commands = {
		  'help': 'Welcome to my site! You can type: <br>&nbsp;<span class="blue consoleLineFont">bio</span>: Short bio about myself.<br>&nbsp;<span class="blue consoleLineFont">social</span>: Get in touch <br>&nbsp;<span class="blue consoleLineFont">hobbies</span>: Fun stuff<br>&nbsp;<span class="blue consoleLineFont">projects</span>: Recent projects<br>&nbsp;<span class="blue consoleLineFont">skills</span>: My skills',
		  'bio': '23 | Computer Science Major. Interested in Web3, Low Level Firmware, Reverse Engineering & Operating Systems',
		  'social': '<span class="blue consoleLineFont">&nbsp;Twitter: <a class="consoleLineFont" href="http://www.twitter.com/Acelogic_" target="_blank">@Acelogic_</a></span> <br><span class="green consoleLineFont">&nbsp;Github: &nbsp;&nbsp;<a class="consoleLineFont "href="http://www.github.com/Acelogic" target="_blank">@Acelogic</a></span> <br>',
		  'hobbies': 'Programming, Reading, Guitar, and touching grass',
		  'projects': '1. Project 1: An awesome web app<br>2. Project 2: A mobile app for productivity<br>3. Project 3: A game using Unity',
		  'skills': 'Programming languages: Python, JavaScript, C<br>Web development: HTML, CSS, React, Node.js<br>Frameworks: Django, Flask, Express<br>Databases: MySQL, PostgreSQL, MongoDB',
		  'ls': 'really?...',
		  'man': 'you won\'t find that here.',
		  'cd': 'Where? Oh yeah, that\'s right, this is not a real console',
		  'baus': 'thanks BAUS',
		  'wow': 'much wow, indeed',
		  'test': 'did I pass?',
		  'sudo': 'Invalid sudoer. Admins are going to be notified!',
		  'pacman': 'I use Arch too, btw',
		  'pacman -Syu': 'I use Arch too, btw :)',
		  'clear': 'Not Going to Work Buddy :(',
		  'apt': 'We don\'t do that here',
		  'apt-get update': 'We don\'t do that here',
		  'apt-get upgrade': 'We don\'t do that here',
		  'quote': '“The only way to do great work is to love what you do.” – Steve Jobs',
		  'joke': 'Why did the programmer get stuck in the shower? Because the shampoo bottle said "Lather, Rinse, Repeat"!',
		  'inspire': 'Believe in yourself and all that you are. Know that there is something inside you that is greater than any obstacle.',
		  'education': 'B.Sc. in Computer Science from XYZ University',
  		  'experience': '1. Software Engineer at ABC Company<br>2. Intern at DEF Startup',
          'contact': 'Email: miguel@example.com',
          'blog': 'Check out my blog at <a class="consoleLineFont" href="https://miguel-blog.example.com" target="_blank">miguel-blog.example.com</a>',
          'riddle': 'What has keys but can\'t open locks? Answer: A keyboard!',
          'fact': 'Did you know? The first computer bug was an actual bug! In 1947, a moth was found in the Mark II computer at Harvard University.',
          'motivate': '“Success is not final, failure is not fatal: It is the courage to continue that counts.” – Winston Churchill',
          'tip': 'Programming Tip: Break your problems down into smaller, manageable tasks. It makes problem-solving easier and more organized.',
          'tool': 'VSCode is my favorite code editor. It has excellent features and a rich ecosystem of extensions.',
         'language': 'My favorite programming language is Python because of its simplicity, readability, and versatility.'
	  };


    if (input in commands) {
      if (typeof commands[input] === 'function') commands[input]();
      else newLine(commands[input]);
    } else if (input.length > 0) {
      newLine('zsh: ' + input + ': command not found');
    }
  }

  function newLine(output) {
    k = getLastLine().clone();
    k.html(output);
    $("#console").find('.consoleLine').removeClass('blinkplz'); //Remove Blinking Before Appending
    $("#console").append(k);
    // auto scroll down
    $("#console").scrollTop($("#console")[0].scrollHeight);
  }

  function getLastLine() {
    return $("#console").find(".consoleLine").last();
  }
}

function initAll() {
  initConsole();
  $("#console-input").focus();
}

$(document).ready(initAll);

document.addEventListener('keydown', function (event) {
  if (event.code === 'Space' && !event.target.classList.contains('consoleLine')) {
    event.preventDefault();
  }
});

///////////////////////////////////////Console Code End ////////////////////////////////////////////////////

