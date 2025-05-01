import express from "express";

import db from ".../db/connection.js";

import {ObjectId } from "mongodb";

const router = express.Router();

//insert 
router.post("/", async (req, res) => {
    try{
        let newSubscription = {
            name: req.body.name,
            price : req.body.price,
            features: req.body.features,
    };
    let collection = await db.collection("subscription");
    let result = await collection.insertOne(newSubscription);
   res.send(result).status(204);
}catch(error){
    console.error(error);
    res.status(500).send(" error insert subscription");
}
});
    