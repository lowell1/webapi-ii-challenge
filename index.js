const express = require("express");
const server = express();
const apiPosts = require("./api_posts");

server.use("/api/posts", apiPosts);

server.listen(8000, () => {
    console.log("server listening port 8000");
})