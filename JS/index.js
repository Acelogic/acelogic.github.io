//Type it Text Code
// Hero title
new TypeIt('.type-it-hero', {
  speed: 65
}).go();

// Video overlay text
new TypeIt('.type-it-video', {
  speed: 65,
  html: true
})
.type("I'm <strong class='has-text-white'>Miguel Cruz</strong>, a Software Engineer <i class='em em-male-technologist'></i> interested in Computer Architecture <i class='em em-male-mechanic'></i> and Operating Systems <i class='fab fa-linux'></i>")
.go();

new TypeIt('.console-typeit', {

}).go();

new TypeIt('.console-typeit2', {

}).go();

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
		  'help': 'Welcome to my site! You can type: <br>&nbsp;<span class="blue consoleLineFont">bio</span>: Short bio about myself<br>&nbsp;<span class="blue consoleLineFont">social</span>: Get in touch <br>&nbsp;<span class="blue consoleLineFont">projects</span>: View my projects<br>&nbsp;<span class="blue consoleLineFont">coursework</span>: My computer science courses<br>&nbsp;<span class="blue consoleLineFont">skills</span>: My technical skills',
		  'bio': 'Software Engineer interested in Computer Architecture and Operating Systems',
		  'social': '<span class="blue consoleLineFont">&nbsp;Twitter: <a class="consoleLineFont" href="http://www.twitter.com/Acelogic_" target="_blank">@Acelogic_</a></span> <br><span class="green consoleLineFont">&nbsp;Github: &nbsp;&nbsp;<a class="consoleLineFont "href="http://www.github.com/Acelogic" target="_blank">@Acelogic</a></span> <br><span class="blue consoleLineFont">&nbsp;LinkedIn: <a class="consoleLineFont" href="https://www.linkedin.com/in/mcruz4600/" target="_blank">Miguel Cruz</a></span>',
		  'projects': '1. <a class="consoleLineFont" href="https://github.com/Acelogic/Testfol-MarginStresser" target="_blank">Testfol-MarginStresser</a> - Portfolio margin stress testing (2025)<br>2. <a class="consoleLineFont" href="https://github.com/Acelogic/Earnings-Volatility-Calculator" target="_blank">Earnings-Volatility-Calculator</a> - Options volatility analysis (2025)<br>3. <a class="consoleLineFont" href="https://github.com/Acelogic/Maginator" target="_blank">Maginator</a> - Python project (2025)<br>4. <a class="consoleLineFont" href="https://github.com/Acelogic/CHIP-8-C" target="_blank">CHIP-8 C</a> - Emulator (2019)<br>5. <a class="consoleLineFont" href="https://github.com/Acelogic/ImageSegmentation" target="_blank">Image Segmentation</a> - Felzenszwalb Algorithm (2020)<br>6. <a class="consoleLineFont" href="https://github.com/Acelogic/TSHImplementation" target="_blank">Tiny Shell</a> - Unix shell (2020)<br>7. <a class="consoleLineFont" href="https://github.com/Acelogic/FPGrowth" target="_blank">FP Growth Trie</a> - Market basket analysis (2020)<br>8. <a class="consoleLineFont" href="https://github.com/nix-opus" target="_blank">CoinMarketCap Go API</a> - RESTful API (2021)<br>9. <a class="consoleLineFont" href="https://github.com/Acelogic/SortingAlgos" target="_blank">Sorting Algos</a> - Java implementations (2020)<br>10. <a class="consoleLineFont" href="https://github.com/nix-opus" target="_blank">Nix-Opus</a> - Homebrew OS (2018)',
		  'coursework': 'CSC-212: Programming & Computation<br>CSC-322: Operating Systems & x86 Architecture<br>CSC-344: Programming Languages (Racket, Prolog, Haskell, Rust)<br>CSC-365: Data Structures & Algorithms<br>CSC-366: Cognitive Science<br>CSC-490: Machine Learning',
		  'skills': 'Languages: C, C++, Java, JavaScript, Python, Go, Assembly<br>Systems: Linux, Operating Systems, Computer Architecture<br>Web: HTML, CSS, JavaScript, Node.js<br>Interests: Low Level Firmware, Reverse Engineering, OS Development',
		  'ls': 'really?...',
		  'man': 'you won\'t find that here.',
		  'cd': 'Where? Oh yeah, that\'s right, this is not a real console',
		  'sudo': 'Invalid sudoer. Admins are going to be notified!',
		  'pacman': 'I use Arch too, btw',
		  'pacman -Syu': 'I use Arch too, btw :)',
		  'clear': function() {
		    $("#console").find('.consoleLine').not(':last').remove();
		    $("#console").find('.greetingText').remove();
		  },
		  'apt': 'We don\'t do that here',
		  'apt-get update': 'We don\'t do that here',
		  'apt-get upgrade': 'We don\'t do that here',
		  'quote': '“The only way to do great work is to love what you do.” – Steve Jobs',
           'contact': 'Email: <a class="consoleLineFont" href="mailto:mcruz@mcruz.me">mcruz@mcruz.me</a>',
           'riddle': 'What has keys but can\'t open locks? Answer: A keyboard!',
          'fact': 'Did you know? The first computer bug was an actual bug! In 1947, a moth was found in the Mark II computer at Harvard University.',
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

