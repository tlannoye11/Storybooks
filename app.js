const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const connectDB = require('./config/db');

// Load config
dotenv.config({ path: './config/config.env' });

// Passport config
require('./config/passport')(passport);

connectDB();

const app = express();

// Body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Method override
app.use(
	methodOverride(function (request, response) {
		if (
			request.body &&
			typeof request.body === 'object' &&
			'_method' in request.body
		) {
			// look in urlencoded POST bodies and delete it
			let method = request.body._method;
			delete request.body._method;
			return method;
		}
	})
);

// Logging
if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}
// Handlebars Helper methods
const {
	formatDate,
	stripTags,
	truncate,
	editIcon,
	select,
} = require('./helpers/hbs');

// Handlebars
app.engine(
	'.hbs',
	exphbs({
		helpers: { formatDate, stripTags, truncate, editIcon, select },
		defaultLayout: 'main',
		extname: '.hbs',
	})
);
app.set('view engine', '.hbs');

// Sessions
app.use(
	session({
		secret: 'goosepoop',
		resave: false,
		saveUninitialized: false,
		store: new MongoStore({ mongooseConnection: mongoose.connection }),
	})
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// SEt global variable for logged-in user.
app.use(function (request, response, next) {
	response.locals.user = request.user || null;
	next();
});

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/stories', require('./routes/stories'));

const PORT = process.env.PORT || 5000;

app.listen(
	PORT,
	console.log(
		`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`
	)
);

// SECTION: Store Sessions in Database 1:10:43
