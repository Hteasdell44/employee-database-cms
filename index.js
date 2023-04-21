const inquirer = require('inquirer');
const mysql = require('mysql2');
const util = require('util');
const cTable = require('console.table');
require('dotenv').config();

let roleStatement = [];
let employeeStatement = [];

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

async function cont() {

    let answer = await inquirer.prompt([{
    
        name: 'contMenu',
        message: 'Would you like to make more changes to the database?',
        type: 'confirm'
    }]);

    if (answer.contMenu == true) {

        console.clear();
        init();

    } else {
        console.log(`Okay, press Ctrl + C to exit the database.`)
    }
};

async function init() {

    let answer = await inquirer.prompt([{
    
        name: 'mainMenu',
        message: 'Welcome! What would you like to do?',
        type: 'list',
        choices: ['View All Departments', 'View All Roles', 'View All Employees', 'Add A Department', 'Add A Role', 'Add An Employee', 'Update Employee Role']
    }]);
        
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
                
        case 'View All Employees':
            
            db.query('SELECT * FROM employee', function (err, result, fields) {

                if (err) throw err;
                buildEmployeeTable(result);
            });

            break;
                    
        case 'Add A Department':

            addDepartment();
            break;
        
        case 'Add A Role':
            
            addRole();
            break;
        
        case 'Add An Employee':
            
            addEmployee();
            break;
        
        case 'Update Employee Role':

            updateEmployee();
            break;
    }
};
// Function To "View All Departments"

function buildDepartmentTable(result) {

    let statement = [];

    for (let i = 0; i < result.length; i++) {
        
        statement[i] = {Department: result[i].name, 'Department Id': result[i].id};
    }

    const table = cTable.getTable(statement);
    console.log(table);
    cont();
};

// Functions To Build & Assemble "View All Roles" 

function getNameFromRole(result) {

    for (let i = 0; i < result.length; i++) {
        
        db.query(`SELECT name FROM department WHERE id = ${result[i].department_id};`, function (err, res, fields) {

            if (err) throw err;
            assembleRole(res[0].name, result, i);
        });
    }
};

function assembleRole(name, result, i) {
    
    roleStatement[i] = {'Job Title': result[i].title, 'Role Id': result[i].id, Department: name, Salary: result[i].salary};

    if (i == result.length - 1) {

        const table = cTable.getTable(roleStatement);
        console.log(table);
        cont();
    }
};

// Functions To Build & Assemble "View All Employees" 

function buildEmployeeTable(result) {

    for (let i = 0; i < result.length; i++) {

        db.query(`SELECT title, department_id FROM role WHERE id = ${result[i].role_id};`, function (err, res, fields) {

            db.query(`SELECT name FROM department where id = ${res[0].department_id};`, function (err, output, fields) {

                const jobTitle = res[0].title;

                assembleEmployee(jobTitle, output, result, i);
            })
        });  
    }
};

function assembleEmployee(jobTitle, output, result, i) {

    employeeStatement[i] = {'Employee Id': result[i].id, 'First Name': result[i].first_name, 'Last Name': result[i].last_name, 'Job Title': jobTitle, 'Role Id': result[i].role_id, 'Department': output[0].name, 'Manager Id': result[i].manager_id};

    if (i == result.length - 1) {

        const table = cTable.getTable(employeeStatement);
        console.log(table);
        cont();
    }
};

function addDepartment() {
    
    inquirer.prompt([
        
        {
            name: 'deptName',
            message: 'What is the name of the department?',
            type: 'input'

        }])

        .then(function(answer) {

            db.query(`INSERT INTO department (name) VALUES ('${answer.deptName}');`, function (err, res, fields) {

                if (err) throw err;
                console.log(`Added the ${answer.deptName} Department to the database.`);
                cont();
            })
        });

};

function addRole() {

    db.query(`Select * from department;`, function(err, res, fields) {

        let deptArr = [];

        for (let i = 0; i < res.length; i++) {

            deptArr[i] = res[i].name;
        }

        inquirer.prompt([
            
            {
                name: 'roleName',
                message: 'What is the name of the role?',
                type: 'input'
            },
            {
                name: 'roleSalary',
                message: 'What is the salary of the role?',
                type: 'number'
            },
            {
                name: 'roleDepartment',
                message: 'What department does the role belong to?',
                type: 'list',
                choices: deptArr
            }
        ])

        .then(function(answer) {

            db.query(`SELECT id FROM department WHERE name = '${answer.roleDepartment}';`, function(err, res, fields) {

                db.query(`INSERT INTO role (title, salary, department_id) VALUES ('${answer.roleName}', ${answer.roleSalary}, ${res[0].id});`, function (err, output, fields) {

                    if (err) throw err;
                    console.log(`Added the ${answer.roleName} Role to the database.`)
                    cont();
                })
            })
        });
    })
};

function addEmployee() {


    db.query(`SELECT * from employee;`, function (err, employeeRes, fields) {

        let employeeArr = ["No"];

        for (let j = 1; j - 1 < employeeRes.length; j++) {

            employeeArr[j] = `${employeeRes[j - 1].first_name} ${employeeRes[j - 1].last_name}`;
        }

        db.query(`SELECT * from role;`, function (err, roleRes, fields) {

            let roleArr = [];

            for (let i = 0; i < roleRes.length; i++) {

                roleArr[i] = roleRes[i].title;
            }

            inquirer.prompt([
                
                {
                    name: 'employeeFirstName',
                    message: 'What is the first name of the employee?',
                    type: 'input'
                },
                {
                    name: 'employeeLastName',
                    message: 'What is the last name of the employee?',
                    type: 'input'
                },
                {
                    name: 'employeeRole',
                    message: 'What is the role of the employee?',
                    type: 'list',
                    choices: roleArr
                },
                {
                    name: 'employeeHasManager',
                    message: 'Does this employee report to a manager?',
                    type: 'list',
                    choices: employeeArr
                }
            ])

            .then(function(answer) {

                db.query(`SELECT id FROM role WHERE title = '${answer.employeeRole}';`, function(err, res, fields) {

                    if (answer.employeeHasManager == 'No') {
                        
                        db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('${answer.employeeFirstName}', '${answer.employeeLastName}', ${res[0].id}, null);`, function (err, output, fields) {
            
                            if (err) throw err;
                            console.log(`Added ${answer.employeeFirstName} ${answer.employeeLastName} to the database.`);
                            cont();
                        })
           
                    } else {

                        const names = answer.employeeHasManager.split(' ');

                        db.query(`SELECT id FROM employee WHERE first_name = '${names[0]}' AND last_name = '${names[1]}'`, function(err, data, fields) {
                        
                            db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('${answer.employeeFirstName}', '${answer.employeeLastName}', ${res[0].id}, ${data[0].id});`, function (err, output, fields) {
        
                                if (err) throw err;
                                console.log(`Added ${answer.employeeFirstName} ${answer.employeeLastName} to the database.`);
                                cont();
                            })
                        })   
                    }
                })

                
            });  
        })
    })
};

function updateEmployee() {

    db.query(`SELECT * from employee;`, function (err, employeeRes, fields) {

        db.query(`SELECT * from role;`, function (err, roleRes, fields) {

            let employeeArr = [];

            for (let i = 0; i < employeeRes.length; i++) {

                employeeArr[i] = `${employeeRes[i].first_name} ${employeeRes[i].last_name}`;
            }

            let roleArr = [];

            for (let j = 0; j < roleRes.length; j++) {

                roleArr[j] = roleRes[j].title;
            }

            inquirer.prompt([
                    
                {
                    name: 'updateEmployee',
                    message: `What employee's role would you like to update?`,
                    type: 'list',
                    choices: employeeArr
                },
                {
                    name: 'newRole',
                    message: 'Which role would you like to assign the selected employee?',
                    type: 'list',
                    choices: roleArr
                }
            ])

            .then(function (answer) {

                const names = answer.updateEmployee.split(' ');

                db.query(`SELECT id FROM role WHERE title = '${answer.newRole}';`, function(err, res, fields) {

                    db.query(`UPDATE employee SET role_id = ${res[0].id} WHERE first_name = ${names[0]}, last_name = ${names[1]};`, function (err, upRes, fields) {

                        console.log(`Successfully updated employee's role to ${answer.newRole}`);
                        cont();
                    })
                })

            })

        })
    })
};