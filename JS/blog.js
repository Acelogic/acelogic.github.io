new TypeIt('.Blog-Title', {

}).go();

new TypeIt('.Blog-Subtitle', {

}).go();


// Load and display blog posts
async function loadBlogPosts() {
  try {
    const response = await fetch('blog-posts.json');
    const data = await response.json();
    displayRecentPosts(data.posts);
  } catch (error) {
    console.error('Error loading blog posts:', error);
  }
}

function displayRecentPosts(posts) {
  // Get the top 3 most recent posts
  const recentPosts = posts.slice(0, 3);
  const container = document.getElementById('recent-blog-posts');

  if (!container) return;

  container.innerHTML = '';

  recentPosts.forEach(post => {
    const postHTML = `
      <article class="message is-link">
        <div class="message-header">
          <p>${post.category}</p>
        </div>
        <div class="message-body">
          <div class="columns">
            <div class="column is-one-third">
              <figure class="image is-3by2">
                <img src="${post.image}" alt="${post.title}">
              </figure>
            </div>
            <div class="column is-two-thirds">
              <p class="title is-4">${post.title}</p>
              <p class="subtitle is-6">Posted on ${post.date}</p>
              <p class="content">
                ${post.excerpt}
              </p>
              ${post.githubUrl ? `<a class="button is-primary" href="${post.githubUrl}" target="_blank">Read more</a>` : ''}
            </div>
          </div>
        </div>
      </article>
    `;
    container.insertAdjacentHTML('beforeend', postHTML);
  });
}

// Load posts when page loads
document.addEventListener('DOMContentLoaded', loadBlogPosts);

progressively.init({
    delay: 100,
    throttle: 300,
    smBreakpoint: 600,
    onLoad: function(elem) {
      console.log(elem);
    },
    onLoadComplete: function() {
      console.log('All images have finished loading (Blog)! ');
    }
  });

