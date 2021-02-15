require('dotenv').config();

// Import dependencies
const express = require('express'); 
const app = express();
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');

app.use(cors());
app.use(bodyParser.json());

//Connect static files in 'public' directory
app.use(express.static(__dirname + '/public'));


//Create database connection
const db = mysql.createPool({
	host: process.env.DATABASE_HOST,
	user: process.env.DATABASE_USER,
	password: process.env.DATABASE_PASSWORD,
	database: process.env.DATABASE_NAME
})


//Connect html file
app.get('/', (req, res) => {
	res.sendFile('./views/index.html', { root:__dirname });
})


//Add todo item to database
app.post('/add-todo', (req, res) => {
	console.log(req.body);
	db.query(`INSERT INTO todo_list(id, name, completed)
		VALUES('${req.body.id}', '${req.body.text}', '${req.body.checked}')`, (err, result) => {
			if (err) {
				res.status(500).send('Failed to add todo item');
      	console.log(err);
      	return;
			}
			res.send('Todo item added successfully');
		});
})


// Mark todo as checked
app.post('/mark-checked', (req, res) => {
	db.query(`UPDATE todo_list SET completed = '${req.body.checked}' WHERE id = ${req.body.id}`, (err, result) => {
			if (err) {
				res.status(500).send('Failed to update todo item');
      	console.log(err);
      	return;
			}
			res.send('Todo item checked successfully');
		})
})


//Delete todo from database
app.post('/delete-todo', (req, res) => {
	db.query(`DELETE FROM todo_list WHERE id = ${req.body.id}`, (err, result) => {
		if (err) {
      res.status(500).send('Failed to delete todo item');
      console.log(err);
      return;
    }
		res.send('Todo item deleted successfully');
	})
})


const server = app.listen(process.env.PORT, () => {
	console.log(`Express running → PORT ${server.address().port}`);
})