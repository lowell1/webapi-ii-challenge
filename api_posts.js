const express = require("express");
const router = express.Router();
const db = require("./data/db.js");

router.use(express.json());

router.post("/", (req, res) => {
    if(req.body.title && req.body.contents) {
        db.insert(req.body)
        .then(idObj => {
            db.findById(idObj.id)
            .then(post => res.status(201).json(post))
            .catch(() => res.status(500).json({ error: "The post information could not be retrieved." }))            
        })
        .catch(() => res.status(500).json({ error: "There was an error while saving the post to the database" }));
    } else {
        res.status(400).json({ errorMessage: "Please provide title and contents for the post." });
    }
})

router.post("/:id/comments", (req, res) => {
    db.findById(req.params.id)
    .then(post => {
        if(post) {
            if(req.body.text) {
                db.insertComment({text: req.body.text, post_id: req.params.id})
                .then(idObj => {
                    db.findCommentById(idObj.id)
                    .then(comment => {
                        res.status(201).json(comment)
                    })
                    .catch(() => {
                        res.status(500).json({error: "could not retrieve comment from database"});
                    })
                })
                .catch(error => {
                    console.log("error: ", error);
                    res.status(500).json({ error: "There was an error while saving the comment to the database" });
                });
            } else {
                res.status(400).json({ errorMessage: "Please provide text for the comment." });
            }
        } else {
            res.status(404).json({ message: "The post with the specified ID does not exist." });
        }
    })
    .catch(() => res.status(500).json({ error: "The post information could not be retrieved." }));
});

/*When the client makes a `GET` request to `/api/posts`:

- If there's an error in retrieving the _posts_ from the database:
  - cancel the request.
  - respond with HTTP status code `500`.
  - return the following JSON object: `{ error: "The posts information could not be retrieved." }`. */

router.get("/", (req, res) => {
    db.find()
    .then(posts => res.status(200).json(posts))
    .catch(() => res.status(500).json({ error: "The posts information could not be retrieved." }));
});

/*
When the client makes a `GET` request to `/api/posts/:id`:

- If the _post_ with the specified `id` is not found:

  - return HTTP status code `404` (Not Found).
  - return the following JSON object: `{ message: "The post with the specified ID does not exist." }`.

- If there's an error in retrieving the _post_ from the database:
  - cancel the request.
  - respond with HTTP status code `500`.
  - return the following JSON object: `{ error: "The post information could not be retrieved." }`.
*/

router.get("/:id", (req, res) => {
    db.findById(req.params.id)
    .then(post => post.length ? res.status(200).json(post) : res.status(404).json({ message: "The post with the specified ID does not exist." }))
    .catch(() => res.status(500).json({ error: "The post information could not be retrieved." }));
})

/**
 * When the client makes a `GET` request to `/api/posts/:id/comments`:

- If the _post_ with the specified `id` is not found:

  - return HTTP status code `404` (Not Found).
  - return the following JSON object: `{ message: "The post with the specified ID does not exist." }`.

- If there's an error in retrieving the _comments_ from the database:
  - cancel the request.
  - respond with HTTP status code `500`.
  - return the following JSON object: `{ error: "The comments information could not be retrieved." }`.

 */

 router.get("/:id/comments", (req, res) => {
     db.findById(req.params.id)
     .then(posts => {
        posts.length ?
        db.findCommentById(req.params.id)
        .then(comments => res.status(200).json(comments))
        .catch(() => res.status(500).json({error: "comments could not be retrieved"})) :
        res.status(404).json({ message: "The post with the specified ID does not exist." })
     })
     .catch(() => res.status(500).json({ error: "The comments information could not be retrieved." }))
 })

/**
 * When the client makes a `DELETE` request to `/api/posts/:id`:

- If the _post_ with the specified `id` is not found:

  - return HTTP status code `404` (Not Found).
  - return the following JSON object: `{ message: "The post with the specified ID does not exist." }`.

- If there's an error in removing the _post_ from the database:
  - cancel the request.
  - respond with HTTP status code `500`.
  - return the following JSON object: `{ error: "The post could not be removed" }`.
 */

 router.delete("/:id", (req, res) => {
    db.findById(req.params.id)
    .then(posts => {
        console.log(posts)
        posts.length ?
        db.remove(req.params.id)
        .then(() => res.status(200).json(posts)) :
        res.status(404).json({ message: "The post with the specified ID does not exist." });
    })
    .catch(() => res.status(500).json({ error: "The post could not be removed" }));
 });

 /**When the client makes a `PUT` request to `/api/posts/:id`:

- If the _post_ with the specified `id` is not found:

  - return HTTP status code `404` (Not Found).
  - return the following JSON object: `{ message: "The post with the specified ID does not exist." }`.

- If the request body is missing the `title` or `contents` property:

  - cancel the request.
  - respond with HTTP status code `400` (Bad Request).
  - return the following JSON response: `{ errorMessage: "Please provide title and contents for the post." }`.

- If there's an error when updating the _post_:

  - cancel the request.
  - respond with HTTP status code `500`.
  - return the following JSON object: `{ error: "The post information could not be modified." }`.

- If the post is found and the new information is valid:

  - update the post document in the database using the new information sent in the `request body`.
  - return HTTP status code `200` (OK).
  - return the newly updated _post_. */

router.put("/:id", (req, res) => {
    if(req.body.title && req.body.contents) {
        db.update(req.params.id, req.body)
        .then(() => {
            db.findById(req.params.id)
            .then(posts => res.status(200).json(posts));
        })
        .catch(() => res.status(500).json({ error: "The post information could not be modified." }))
    } else {
        res.status(400).json({ errorMessage: "Please provide title and contents for the post." });
    }
})

module.exports = router;

