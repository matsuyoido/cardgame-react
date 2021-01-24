const http = require("http");
const fs = require('fs');
// root は develop
const folderPath = './dist';
const types = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "text/javascript",
    ".png": "image/png",
    ".gif": "image/gif",
    ".svg": "svg+xml"
};

function getType(_url) {
  for (var key in types) {
    if (_url.endsWith(key)) {
      return types[key];
    }
  }
  return "text/plain";
}
const server = http.createServer(function (req, res) {
    let filePath = req.url.endsWith("/") ? req.url + "index.html" : req.url;
    let url = folderPath;
    if (filePath.endsWith('js')) {
      let paths = filePath.split('/');
      url += '/' + paths[paths.length - 1];
    } else {
      url += '/index.html'; // どんなURLが来たとしてもindexに飛ぶ
    }
    if (fs.existsSync(url)) {
      fs.readFile(url, (err, data) => {
        if (!err) {
          res.writeHead(200, {"Content-Type": getType(url)});
          res.end(data);
        } else {
          res.statusCode = 500;
          res.end();
        }
      });
    } else {
      res.statusCode = 404;
      res.end();
    }
});

var port = process.env.PORT || 3000;
server.listen(port, function() {
    console.log("To view your app, open this link in your browser: http://localhost:" + port);
});