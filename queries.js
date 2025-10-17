//CONNECT TO A MONGODB
const {MongoClient} = require('mongodb');
const { title } = require('process');
const uri = "mongodb+srv://mern-stack:mongolanguage@cluster0.bwfa3wz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db('plp_bookstore');
    const collection = db.collection('books');
 
    const books = db.collection("books")
    
    //BASIC CRUD
    //find
    console.log (await books.find({genre:"Romance"}).toArray());
    console.log (await books.find({published_year:{$gt:2003}}).toArray());
    console.log (await books.find({author:"John Grisham"}).toArray());
    //update
    console.log (await books.updateOne(
      {title:"The Stanislaski Sisters"},
      {$set:{price:400}}
    ));
    //delete
    console.log(await books.deleteOne(
      {title:"Escape Clause"}
    ));

    //ADVANCED QUERIES
    //find
    console.log(await books.find({
        in_stock:true,
        published_year:{$gt:2010}
    }
    ).toArray()
  );
    //projection
    console.log(await books.find(
      {},
      {projection: {title:1, author:1, price:1, _id:0}}
    ).toArray()
  );
    //sorting
    console.log(await books.find().sort({price:1}).toArray()); //ascending
    console.log(await books.find().sort({price:-1}).toArray()); //descending
    //pagination
    console.log(await books.find().skip(0).limit(5).toArray());
    console.log(await books.find().skip(5).limit(10).toArray());

    //AGGREGATION PIPELINE
    //avg.price by genre
    console.log(await books.aggregate([
      {
        $group: {
        _id: "$genre",
        averagePrice: {$avg: "$price"}
      }
    },
      {
        $sort: {averagePrice: -1}
      }
    ]).toArray());
    //author with most books
    console.log(await books.aggregate([
      {
        $group: {
        _id: "$author",
        totalBooks: {$sum: 1}
      }
    },
      {
        $sort: {totalBooks: -1}
      },
      {
        $limit: 1
      }
    ]).toArray());
    //books by publication decade
    console.log(await books.aggregate([
      {
        $addFields:{
          decade: {
            $concat:[
              {$toString:{$subtract: [{$multiply: [{$floor:{$divide: ["$published_year",10]}} ,10]} ,0]}},"s"
            ]
          }
        }
      },
      {
        $group: {
          _id: "$decade",
          totalBooks: {$sum: 1}
        }
      },
      {
        $sort: {_id: 1}
      }
    ]).toArray());

    //INDEXING
    //title
    console.log(await books.createIndex(
      {title:1}
    ));
    //compound indexing
    console.log(await books.createIndex(
      {author:1, published_year:1}
    ));
    //explain method
    console.log(await books.find({title:"The 48 laws of power"}).explain("executionStats"));
  
  } 
  //close the database connection when finished or an error occurs
  finally {
    await client.close();
  }
}
run().catch(console.error);