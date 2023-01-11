const fs = require("fs");
var express = require('express');
var app = express();
const path = require('path');  
var bodyParser = require('body-parser');
const {parse} = require("csv-parse");
const readline = require('readline');
const exphbs = require('express-handlebars');

const port = process.env.PORT || 3000

app.listen(port);


app.set('views',path.join(__dirname,'views'));
app.engine('.hbs',exphbs.engine({
    extname:'.hbs'
}));

app.set('view engine','.hbs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json())
app.use(express.text());

app.get('/',async (req,res) => {
    var authorsData = await getData(authors);
    var booksData = await getData(books,'book');
    var magazinesData = await getData(magazines,'magazine');
    console.log('authors data',magazinesData);
    console.log('books data',booksData);
    console.log('magazines data',magazinesData);
    console.log('type either book or magazine'+': ')
    res.render('index',{
        authors: authorsData,
        books:booksData,
        magazines: magazinesData
    })
});

app.get('/find',(req,res) => {
    res.render('find');
})

// app.post('/find',async (res,req) => {
//     const isbnOfBook= req.body.Bisbn ? req.body.Bisbn :'';
//     const isbnOfMagazine= req.body.Misbn ? req.body.Misbn :'';
//     const authorOfBook = req.body.Bauthor ? req.body.Bauthor :'';
//     const authorOfMagazine = req.body.Mauthor ? req.body.Mauthor :'';
//     const Id = req.body.id;
//     console.log('Id is',Id)
//     res.send('testing for post..');

//     let isbn;
//     let author;
//     let source;
//     let block;
//     switch(Id){
//         case Id == 'bookisbn':
//             block = 'book'
//             isbn = isbnOfBook;
//             source = await getData(books);
//             break;
//         case Id == 'magazineisbn':
//             block = 'magazine'
//             isbn = isbnOfMagazine;
//             source = await getData(magazines);
//             break;
//         case Id == 'bookauthor':
//             block = 'book'
//             author = authorOfBook;
//             source = await getData(books);
//             break;
//         case Id == 'authorOfMagazine':
//             block = 'magazine'
//             author = authorOfMagazine;
//             source = await getData(magazines);
//             break;
//         default:
//             source = await getData(authors);
//     }
//     const result = await findData(block,source,email,isbn);
//     console.log('result find data is ',result)
//     res.render('/find',{
//         data:result
//     })
// })


// app.post('/find-book-isbn',async (res,req) => {
//     const isbn = req.body.Bisbn;
//     const booksData = await getData(books)
//     findData('book',isbn,booksData,null,isbn);
//     res.render('/find',{
//         book:result
//     })
// })

// app.post('/find-magazine-isbn',async (res,req) => {
//     const isbn  = req.body.Misbn;
//     const magazinesData = await getData(magazines)
//     const result = findData('magazine',magazinesData,null,isbn);
//     res.render('/find',{
//         magazine:result
//     })
// })
// app.post('/find-book-author',async (res,req) => {
//     const id  = req.body.id
//     console.log('re.body.id', id)
//     const email = req.body.Bauthor ? req.body.Bauthor : '';
//     const booksData = await getData(books)
//     findData('book',booksData,email,null);
//     res.render('/find',{
//         book:result
//     })
// })

// app.post('/find-magazine-author',async (res,req) => {
//     const email = req.body.Mauthor
//     const magazinesData = await getData(magazines)
//     findData('magazine',magazinesData,email,null);
//     res.render('/find',{
//         magazine:result
//     })
// })

const authors = "authors.csv"
const books = "books.csv"
const magazines = "magazines.csv"

async function getData(file,block){
    const authors = [];
    return new Promise((resolve,reject) => {
        fs.createReadStream(file, { encoding: "utf-8" })
        .on('error', error => {
            reject(error);
        })
        .pipe(parse({ delimiter: ";", from_line: 1 }))
        .on("data", (data) => {
            authors.push(data);
        })
        .on("end", () => {
            let final = [];
            // console.log(authors);
            for(let i = 1;i <= authors.length - 1;i++){
                let body = {};
                for(let j = 0;j <= authors[0].length - 1;j++){
                    body[authors[0][j]] = authors[i][j]
                }
                final.push(body)
            }
            // console.log('final authors',final);
            findData(block,final);
            resolve(final)
        });
    })
}


//find either book or magazine from email or isbn
  async function findData(block,final,email=null,isbn=null){

      
      const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        }); 
        
        rl.question('type either book or magazine'+': ', (answer) => {
            if(answer == block){
                rl.question('type either email or isbn (in word) : ', (findby) => {
                    if(findby === 'email'){
                        rl.question('enter email : ',(email) => {
                            final.map((data) => {
                            if(data.authors === email){
                                console.log(block+' of '+email+' : ', data);
                            }
                        })
                    })
                }else if(findby == 'isbn'){
                    rl.question('enter isbn', (isbn) => {
                        final.map((data) => {
                            if(data.isbn === isbn){
                                console.log(data)
                            }
                        })
                    })
                }
            })
        }
    }); 
    
    return new Promise((resolve,reject) => {
        final.map((data) => {
            if(data.authors === email){
                resolve(data);
            }else if(data.isbn === isbn){
                resolve(data);
            }
        })
    })

  }