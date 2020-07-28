require('dotenv').config()

const mysql = require("mysql");
const inquirer = require("inquirer");

class Database {
  constructor( config ) {
      this.connection = mysql.createConnection( config );
  }
  query( sql, args ) {
      return new Promise( ( resolve, reject ) => {
          this.connection.query( sql, args, ( err, rows ) => {
              if ( err )
                  return reject( err );
              resolve( rows );
          } );
      } );
  }
  close() {
      return new Promise( ( resolve, reject ) => {
          this.connection.end( err => {
              if ( err )
                  return reject( err );
              resolve();
          } );
      } );
  }
}

const db = new Database({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "Avinash711",
  database: "employeeData",
  insecureAuth : true
});

let response
let role, department

async function mainApp(){
    response = await inquirer.prompt([
        { message: "What would you like to do?", type: "list", name: "action",
        choices: [
            {name: "Manage Departments", value: "department"},
            {name: "Manage Roles", value: "role"},
            {name: "Manage Employees", value: "employee"}
        ]}
    ])

    if( response.action=="employee"){
        let employeeList = await db.query(
            "SELECT e.id," + 
            "CONCAT(e.first_name,' ',e.last_name) AS employeeName,"+
            "CONCAT(m.first_name,' ',m.last_name) AS managerName,r.title,r.salary "+
            "FROM employee AS e "+
            "LEFT JOIN employee AS m ON(e.manager_id=m.id) "+
            "LEFT JOIN role AS r ON(e.role_id=r.id)" )

        console.table( employeeList )

        response = await inquirer.prompt([
            {   message: "What do you want to do now?", type: "list", name: "action", 
                choices: [
                    { name: "Update Employee Role", value: "update" }, 
                    { name: "Add Employee", value: "add" },
                    { name: "Remove Employee", value: "remove" },
                    { name: "Return to the main menu", value: "return" } 
                ] 
            }
        ])        

        if( response.action=="add" ){
            const dbRole = await db.query( "SELECT * FROM role")
            role = []
            dbRole.forEach( function( item ){
                role.push( { name: item.title, value: item.id } )
            })
                        
            response = await inquirer.prompt([
                {   message: "What's their first name?", type: "input", name: "first_name" },
                {   message: "What's their last name?", type: "input", name: "last_name" },
                {   message: "What role do they have?", type: "list", name: "role",
                    choices: role },
                {   message: "Who is their manager?", type: "list", name: "department",
                    choices: [ "no one"] }                    
            ]) 

            let saveResult = await db.query( "INSERT INTO employee VALUES( ?,?,?,?,? ) ", 
                [ 0, response.first_name, response.last_name, response.role, 1 ] )
            console.log( `Employee ${response.first_name + response.last_name} has been added to the database.` )
            mainApp()

        }
        if( response.action=="update"){
            let employeeNames = []
            employeeList.forEach( (item) =>{
                employeeNames.push( { name:item.employeeName, value:item.id } )
            })

            const dbRole = await db.query( "SELECT * FROM role")
            role = []
            dbRole.forEach( (item) => {
                role.push( { name: item.title, value: item.id } )
            })

            response = await inquirer.prompt([
                { message: "Which employee do you want to modify?", type:"list", name:"modifyEmployee",
                    choices: employeeNames },
                { message: "What is his/her new role?", type:"list", name:"newRole",
                    choices: role }
            ])
            // console.log( `UPDATE employee SET role_id=${response.newRole} WHERE id=${response.modifyEmployee} `)

            let updateRole = await db.query( `UPDATE employee SET role_id=${response.newRole} WHERE id=${response.modifyEmployee} `)
            console.log( `Update successful.`)
            mainApp()
        }
       
        if( response.action=="remove"){
            let employeeNames = []
            employeeList.forEach( (item) =>{
                employeeNames.push( { name:item.employeeName, value:item.id } )
            })

            response = await inquirer.prompt([
                { message: "Which employee do you want to remove?", type:"list", name:"deleteEmployee",
                    choices: employeeNames }
            ])

            let deleteRole = await db.query( `DELETE FROM employee WHERE id='${response.deleteEmployee}'` )
           
            console.log( `Employee has been removed.`)
            mainApp()
        }

        if( response.action=="return" ){
            console.log( `Returning to the main menu...`)
            mainApp()
        }
    }

    if( response.action=="department" ){
        //Display department list
        let departmentList = await db.query( "SELECT * FROM department" )
        console.table( departmentList )

        //Prompt user for further action for department info
        response = await inquirer.prompt([
            { message:"What do you want to do now?", type:"list", name:"action", 
            choices:[
                { name: "Add a department", value: "add" },
                { name: "Remove a department", value: "remove" },
                { name: "Return to main menu", value: "return" }
            ]}
        ])

        //Add new department to database
        if( response.action == "add" ){
            response = await inquirer.prompt([
                { message: "What is the name of new department?", type:"input", name:"createDep" }
            ])
        
            let newDep = await db.query( "INSERT INTO department VALUES( ?,? ) ", 
            [ 0, response.createDep ] )
            
            console.log( `Department ${response.createDep} has been added to database.`)
            mainApp()
        }

        //Remove department from database
        if( response.action == "remove" ){
            response = await inquirer.prompt([
                { message: "Which department you want remove?", type:"input", name:"deleteDep" }
            ])

            let deleteDep = await db.query( `DELETE FROM department WHERE name='${response.deleteDep}'` )
           
            console.log( `Department ${response.deleteDep} has been removed.`)
            mainApp()
        }

        if( response.action=="return" ){
            console.log( `Returning to the main menu...`)
            mainApp()
        }
    }
    
    if( response.action=="role"){
        //Display role list
        let roleList = await db.query( "SELECT * FROM role" )
        console.table( roleList )

        //Prompt user for further action for role info
        response = await inquirer.prompt([
            { message:"What do you want to do now?", type:"list", name:"action", 
            choices:[
                { name: "Add a role", value: "add" },
                { name: "Remove a role", value: "remove" },
                { name: "Return to main menu", value: "return" }
            ]}
        ])
        //Add new role to database
        if( response.action == "add" ){
            const dbDepartment = await db.query( "SELECT * FROM department")
            department = []
            dbDepartment.forEach( (item) => {
                department.push( { name: item.name, value: item.id } )
            })

            response = await inquirer.prompt([
                { message: "What is the name of new role?", type:"input", name:"name" },
                { message: "What is the salary of new role?", type:"input", name:"salary" },//validate
                { message: "Which department does the new role belong to?", type:"list", name:"department",
                    choices: department },
            ])
        
            let newRole = await db.query( "INSERT INTO role VALUES( ?, ?, ?, ?)", 
            [ 0, response.name, response.salary, response.department ] )
            
            console.log( `Role ${response.name} has been added to database.`)
            mainApp()
        }
        //Remove role from database
        if( response.action == "remove" ){
            const dbRole = await db.query( "SELECT * FROM role")
            role = []
            dbRole.forEach( (item) => {
                role.push( { name: item.title, value: item.title } )
            })

            response = await inquirer.prompt([
                { message: "Which role you want remove?", type:"list", name:"deleteRole",
                    choices: role }
            ])

            let deleteRole = await db.query( `DELETE FROM role WHERE title='${response.deleteRole}'` )
           
            console.log( `Role ${response.deleteRole} has been removed.`)
            mainApp()
        }

        if( response.action=="return" ){
            console.log( `Returning to the main menu...`)
            mainApp()
        }
    }


}
mainApp()