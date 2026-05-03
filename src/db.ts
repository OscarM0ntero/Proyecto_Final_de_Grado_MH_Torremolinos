import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Configuracion de la conexion con la DB tomando los datos del .env
export const pool = mysql.createPool({
	host: process.env['DB_HOST'] || 'localhost',
	port: parseInt(process.env['DB_PORT'] || '3306'),
	user: process.env['DB_USER'] || 'root',
	password: process.env['DB_PASSWORD'] || '',
	database: process.env['DB_NAME'] || '',
	waitForConnections: true,
	connectionLimit: 10,
});

export const secret = process.env['SECRET'];