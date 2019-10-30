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
                console.log(req.body.text, req.params.id)
                db.insertComment({text: req.body.text, post_id: req.params.id})
                .then(idObj => res.status(201).json(db.findCommentById(idObj.id)))
                .catch(() => res.status(500).json({ error: "There was an error while saving the comment to the database" }));
            } else {
                res.status(400).json({ errorMessage: "Please provide text for the comment." });
            }
        } else {
            res.status(404).json({ message: "The post with the specified ID does not exist." });
        }
    })
    .catch(() => res.status(500).json({ error: "The post information could not be retrieved." }))
})

module.exports = router;

