new TypeIt('.type-it', {
 
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