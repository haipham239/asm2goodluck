const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const app = express();
const MongoClient = require('mongodb').MongoClient;
var router = express.Router();
fs = require('fs-extra');
app.use(bodyParser.urlencoded({extended: true}));

ObjectId = require('mongodb').ObjectId;

const url ="mongodb+srv://haipham:duchai01@cluster0-c6tx5.azure.mongodb.net/test";

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
    }
});

var upload = multer({storage: storage});

MongoClient.connect(url, (err, client) => {
    if (err) return console.log(err);
    db = client.db('ATN_DB')
});


router.get('/', async (req, res) => {
    let client = await MongoClient.connect(url);
    let dbo = client.db("ATN");
    let results = await dbo.collection("Product").find({}).toArray();
    res.render('AllProduct', { product: results });
});




//delete 
router.get('/delete', async (req, res) => {
    let client = await MongoClient.connect(url);
    let id = req.query.id;
    var ObjectID = require('mongodb').ObjectID;
    let dbo = client.db("ATN");
    let condition = { "_id": ObjectID(id) };
    await dbo.collection("Product").deleteOne(condition);
    let results = await dbo.collection("Product").find({}).toArray();
    res.render('AllProduct', { product: results });
})

//Update product (GET method)
router.get('/edit', async (req, res) => {
    let id = req.query.id;
    var ObjectID = require('mongodb').ObjectID;

    let client = await MongoClient.connect(url);
    let dbo = client.db("ATN");
    let result = await dbo.collection("Product").findOne({ "_id": ObjectID(id) });
    res.render('update', { product: result });
})
//update product (POST method)
router.post('/edit',upload.single('picture'), async(req, res)=>{
    //var img = fs.readFileSync(req.file.path);
    //var encode_image = img.toString('base64');
    let id = req.body._id;
    let name = req.body.name;
    let category = req.body.category;
    let price = req.body.price;
    //let type = req.file.mimetype;
    //let picture = new Buffer(encode_image, 'base64');
let newValues = { $set: { ProductName: name, Category: category, Price: price, /*contentType: type, image:picture*/}};
    var ObjectID = require('mongodb').ObjectID;
    let condition = { "_id": ObjectID(id) };
    let client = await MongoClient.connect(url);
    let dbo = client.db("ATN");
    await dbo.collection("Product").updateOne(condition, newValues, (err, result)=>{
        console.log(result)
        if (err) return console.log(err)
        console.log('saved to database')
    });
    let result = await dbo.collection("Product").find({}).toArray();
    res.render('AllProduct', {product: result});
})

//insert
router.get('/insert', async (req, res) => {
        res.render('insert');
    });

router.post('/insert', async (req, res) => {
    var insertProducts = {
        _id: req.body._id,
        ProductName: req.body.productName,
        Category: req.body.Category,
        Price: req.body.Price,
        //contentType: req.file.mimetype,
        //image: new Buffer(encode_image, 'base64')
    };
    let client = await MongoClient.connect(url);
    let dbo = client.db("ATN");
    await dbo.collection("Product").insertOne(insertProducts, (err, result)=>{
        console.log(result)
        if (err) return console.log(err)
        console.log('saved to database')
    });
    let result = await dbo.collection("Product").find({}).toArray();
    res.render('AllProduct', {product: result});
});

/*router.get('/photos/:id', (req, res) => {
    var filename = req.params.id;
    db.collection('Product').findOne({'_id': ObjectId(filename)}, (err, result) => {
        if (err) return console.log(err);
        res.contentType('image/jpeg');
        res.send(result.image.buffer);
    })
});*/

module.exports = router;