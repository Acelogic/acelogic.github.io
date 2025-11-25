new TypeIt('.Proj-Title', {

}).go();

new TypeIt('.Proj-Subtitle', {

}).go();


progressively.init({
  delay: 50,
  throttle: 300,
  smBreakpoint: 600,
  onLoad: function(elem) {
    console.log(elem);
  },
  onLoadComplete: function() {
    console.log('All images have finished loading (Projects) !');
  }
});