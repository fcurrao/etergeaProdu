(function(window) {
    window.env = window.env || {};
  
    // Environment variables
    window["env"]["apiUrl"] = "${API_BASE_URL}";
    window["env"]["debug"] = false;
  })(this);