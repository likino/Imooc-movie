var express = require('express')
var path = require('path')
var mongoose = require('mongoose')
var _ = require('underscore')
var Movie = require('./models/movie')
var User = require('./models/user')
var port = process.env.PORT || 3000
var app = express()
var bodyParser = require('body-parser')

mongoose.connect('mongodb://localhost/imooc')

app.set('views', './views/pages')
app.set('view engine', 'jade')
app.use(bodyParser.urlencoded())
app.use(express.cookieParser())
app.use(express.session({
  secret: 'imooc'
}))
app.use(express.static(path.join(__dirname, 'public')))
app.locals.moment = require('moment')
app.listen(port)

console.log('imooc start on port ' + port)

// index pages
app.get('/', function(req, res) {
  console.log('user in session: ' + req.session.user)
  Movie.fetch(function(err, movies) {
    if (err) {
      console.log(err)
    }

    res.render('index', {
      title: 'imooc 首页',
      movies: movies
    })
  })
})

// signup
app.post('/user/signup', function(req, res) {
  var _user = req.body.user

  console.log(_user)

  User.findOne({name: _user.name}, function(err, user) {
    if (err) {
      console.log(err)
    }

    if (user) {
      return res.redirect('/')
    } else {
      var user = new User(_user)

      user.save(function(err, user) {
        if (err) {
          console.log(err)
        }

        res.redirect('/admin/userlist')
      })
    }
  })
})

// signin
app.post('/user/signin', function(req, res) {
  var _user = req.body.user
  var name = _user.name
  var password = _user.password

  User.findOne({name: name}, function(err, user) {
    if (err) {
      console.log(err)
    }

    if (!user) {
      return res.redirect('/')
    }

    user.comparePassword(password, function(err, isMatch) {
      if (err) {
        console.log(err)
      }

      if (isMatch) {
        req.session.user = user
        console.log('Password is matched')
        return res.redirect('/')
      } else {
        console.log('Password is not matched')
      }
    })
  })
})

// userlist page
app.get('/admin/userlist', function(req, res) {
  User.fetch(function(err, users) {
    if (err) {
      console.log(err)
    }

    res.render('userlist', {
      title: 'imooc 用户列表页',
      users: users
    })
  })
})

// detail page
app.get('/movie/:id', function(req, res) {
  var id = req.params.id

  Movie.findById(id, function(err, movie) {
    res.render('detail', {
      title: 'imooc ' + movie.title,
      movie: movie
    })
  })
})

// admin page
app.get('/admin/movie', function(req, res) {
  res.render('admin', {
    title: 'imooc 后台录入页',
    movie: {
      title: '',
      doctor: '',
      country: '',
      year: '',
      poster: '',
      language: '',
      flash: '',
      summary: ''
    }
  })
})

// admin update movie
app.get('/admin/update/:id', function(req, res) {
  var id = req.params.id

  if (id) {
    Movie.findById(id, function(err, movie) {
      res.render('admin', {
        title: 'imooc 后台更新页',
        movie: movie
      })
    })
  }
})

// admin post movie
app.post('/admin/movie/new', function(req, res) {
  var id = req.body.movie._id
  var movieObj = req.body.movie
  var _movie

  console.log(req.body.movie)

  if (id !== 'undefined') {
    Movie.findById(id, function(err, movie) {
      if (err) {
        console.log(err)
      }

      _movie = _.extend(movie, movieObj)
      _movie.save(function(err, movie) {
        if (err) {
          console.log(err);
        }

        res.redirect('/movie/' + movie._id)
      })
    })
  } else {
    _movie = new Movie({
      title: movieObj.title,
      doctor: movieObj.doctor,
      country: movieObj.country,
      language: movieObj.language,
      poster: movieObj.poster,
      flash: movieObj.flash,
      year: movieObj.year,
      summary: movieObj.summary
    })

    _movie.save(function(err, movie) {
      if (err) {
        console.log(err);
      }

      res.redirect('/movie/' + movie._id)
    })
  }
})

// list page
app.get('/admin/list', function(req, res) {
  Movie.fetch(function(err, movies) {
    if (err) {
      console.log(err)
    }

    res.render('list', {
      title: 'imooc 列表页',
      movies: movies
    })
  })
})

// list delete movie
app.delete('/admin/list', function(req, res) {
  var id = req.query.id

  if(id) {
    Movie.remove({_id: id}, function(err, movie) {
      if (err) {
        console.log(err)
      } else {
        res.json({success: 1})
      }
    })
  }
})
