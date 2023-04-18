const inquirer = require('inquirer');
const mysql = require('mysql2');
const util = require('util');
const cTable = require('console.table');
require('dotenv').config();

let roleStatement = [];

const db = mysql.createConnection(

    {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    },

    console.log(`Connected to the employee_db database.`)
);

db.query = util.promisify(db.query).bind(db);

// Runtime Code

init();


// Functions

function init() {

    inquirer.prompt([{
    
        name: 'mainMenu',
        message: 'Welcome! What would you like to do?',
        type: 'list',
        choices: ['View All Departments', 'View All Roles', 'View All Employees', 'Add A Department', 'Add A Role', 'Add An Employee', 'Update Employee Role']
    }])
    
    .then(function(answer) {
        
        switch(answer.mainMenu) {
            
            case 'View All Departments':
    
                db.query(`SELECT * FROM department;`, function (err, result, fields) {

                    if (err) throw err;
                    buildDepartmentTable(result);
                });

                break;
    
            case 'View All Roles':
    
                db.query("SELECT * FROM role;", function (err, result, fields) {

                    if (err) throw err;
                    getNameFromRole(result);
                });

                break;

                // WHEN I choose to view all roles
                // THEN I am presented with the job title, role id, the department that role belongs to, and the salary for that role
                    
            case 'View All Employees':
                console.log('3');
                break;
                        
            case 'Add A Department':
                console.log('4');
                break;
            
            case 'Add A Role':
                console.log('5');
                break;
            
            case 'Add An Employee':
                console.log('6');
                break;
            
            case 'Update Employee Role':
                console.log('7');
                break;
        }
    });
}

function buildDepartmentTable(result) {

    let statement = [];

    for (let i = 0; i < result.length; i++) {
        
        statement[i] = {Department: result[i].name, 'Department Id': result[i].id};
    }

    const table = cTable.getTable(statement);
    console.log(table);
}

function getNameFromRole(result) {

    for (let i = 0; i < result.length; i++) {
        
        db.query(`SELECT name FROM department WHERE id = ${result[i].department_id};`, function (err, res, fields) {

            if (err) throw err;
            assembleRole(res[0].name, result, i);
        });
    }
}

function assembleRole(name, result, i) {
    
    roleStatement[i] = {'Job Title': result[i].title, 'Role Id': result[i].id, Department: name, Salary: result[i].salary};

    if (i == result.length - 1) {

        const table = cTable.getTable(roleStatement);
        console.log(table);
    }
};