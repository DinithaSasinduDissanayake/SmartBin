import {MongoClient,ServerApiVersion} from "mongodb";

const uri = process.env.MONGODB_URI || "";
const frontend = new MongoClient(uri,{
    serverApi:{
        version:ServerApiVersion.v1,
        strict:true,
        deprecationErrors:true,
    },
});

try{
    await frontend.connect();
    await frontend.db("admin").command({ping:1});
    console.log(
        "Successfully connected to MongoDB"
    );
}
catch(error){
    console.error("Error connecting to MongoDB: ",error);
}

