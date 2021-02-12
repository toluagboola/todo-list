const express = require('express'); 
const app = express();
const mysql = require('mysql');
const bodyParser = require('body-parser');

app.use(bodyParser.json());

//Connect static files in 'public' directory
app.use(express.static(__dirname + '/public'));


//Create database connection
const db = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '$BK2mXz3',
	database: 'todos'
})

db.connect((err) => {
	if (err) {
		response.status(500).send('Error in database operation');
		console.log(err);
		return;
	}
	console.log('Database connected!');
});


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
				res.status(500).send('Todo item not added successfully');
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
				res.status(500).send('Todo item not checked successfully');
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
      res.status(500).send('Todo item not deleted successfully');
      console.log(err);
      return;
    }
		res.send('Todo item deleted successfully');
	})
})


const server = app.listen(7000, () => {
	console.log(`Express running → PORT ${server.address().port}`);
})