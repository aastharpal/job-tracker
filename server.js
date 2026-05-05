const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors()); 
app.use(express.json()); 

// 1. Connect to MySQL 
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: 'Your_password', // REPLACE THIS
    database: 'job_tracker'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL Database!');
});

// GET all jobs
app.get('/jobs', (req, res) => {
    const sql = "SELECT * FROM applications ORDER BY date_applied DESC";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

// POST a new job
app.post('/jobs', (req, res) => {
    const { company_name, job_title, application_status } = req.body;
    const date_applied = new Date().toISOString().split('T')[0]; 

    const sql = "INSERT INTO applications (company_name, job_title, application_status, date_applied) VALUES (?, ?, ?, ?)";
    db.query(sql, [company_name, job_title, application_status, date_applied], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Job added successfully!', id: result.insertId });
    });
});

// ADDED: UPDATE an existing job (PUT)
app.put('/jobs/:id', (req, res) => {
    const { company_name, job_title, application_status } = req.body;
    const sql = "UPDATE applications SET company_name = ?, job_title = ?, application_status = ? WHERE id = ?";
    
    db.query(sql, [company_name, job_title, application_status, req.params.id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Job updated successfully!' });
    });
});

// ADDED: DELETE a job
app.delete('/jobs/:id', (req, res) => {
    const sql = "DELETE FROM applications WHERE id = ?";
    db.query(sql, [req.params.id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Job deleted successfully!' });
    });
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
