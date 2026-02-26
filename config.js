require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  template_dir_location: 'root',
  public_dir_location: 'public',
  public_asset_caching_time: '1d',
  cache_compiled_templates: false,  // toggle on for smaller CPU cost
  root_file: 'index.sivu',
  force_csrf_middleware: true,
  session_secret: process.env.SESSION_SECRET || 'thisismysecret',
  pretty_routing: true,
  
  routes: [
    { method: "GET",  path: "/users/:id",      template: "user_show.sivu" },
    { method: "POST", path: "/users/:id",      action: "_user_update.sivu" },
    { method: "GET",  path: "/posts/:slug",    template: "post.sivu" },
  ]
};