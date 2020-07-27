CREATE DATABASE employeeData;

USE employeeData;

DROP TABLE department;
DROP TABLE role;
DROP TABLE employee;

CREATE TABLE department (
id INTEGER AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(30)
);

CREATE TABLE role (
id INTEGER AUTO_INCREMENT PRIMARY KEY,
title VARCHAR(30),
salary DECIMAL,
department_id INTEGER
);

CREATE TABLE employee (
id INTEGER AUTO_INCREMENT PRIMARY KEY,
first_name VARCHAR(30),
last_name VARCHAR(30),
role_id INTEGER,
manager_id INTEGER
);