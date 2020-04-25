// init code...
var bodyParser = require('body-parser');
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const initializePassport = require('./passport-config')
initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

const users = []

app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
    secret: "hshisiiufl973",
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

// DATA BASE
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/blog');

var blogSchema = mongoose.Schema({
    name: String,
    content: String
});
var BlogPost = mongoose.model('Person', blogSchema, 'blog');


//get method routers

app.get('/', checkAuthenticated, (req, res) => {
    res.render('home')
})


app.get('/profile', checkAuthenticated, (req, res) => {
    res.render('profile')
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login')
})


app.get('/join', checkNotAuthenticated, (req, res) => {
    res.render('join')
})
app.get('/new', checkAuthenticated, (req, res) => {
    res.render('new')
})

app.get('/blog', checkAuthenticated, (req, res) => {
    BlogPost.find(function (err, response) {

        res.render('blog', {
            blogs: response
        })


    });
})


//post method routers

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
}))

app.post('/join', checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect('/login')
    } catch {
        res.redirect('/join')
    }
})

app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
})


//authentication funcations... 

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }

    res.redirect('/login')
}


function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/profile')
    }
    next()
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.render('/new')
    }
    next()
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.render('/blog')
    }
    next()
}


// Middlwares and party...
app.set('view engine', 'pug');
app.set('views', './views');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



app.post('/new', function (req, res) {
    const blog = req.body;
    if (!blog.btitle || !blog.bbody) {
        res.send("error");
    } else {
        const newBlog = new BlogPost({
            name: blog.btitle,
            content: blog.bbody
        });
        newBlog.save(function (err, result) {
            if (err) {
                res.send("error")
            } else {
                console.log("success !!");
                res.redirect("/blog");
            }
        })
    }
})
app.get('*', function (req, res) {
    res.send("<h1>404 Not Found !!</h1>")
})

app.listen(3000, console.log('server running at 3000'));