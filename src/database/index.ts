import postgres from 'postgres';

const {
  DB_USER = 'postgres',
  DB_PASSWORD = '1234',
  DB_HOST = 'localhost',
  DB_PORT = '5432',
  DB_NAME = 'sistema_nfe',
} = process.env;

if (!DB_USER || !DB_PASSWORD || !DB_HOST || !DB_PORT || !DB_NAME) {
  throw new Error('Configurações do banco de dados não encontradas');
}

export const sql = postgres({
  host: DB_HOST,
  port: parseInt(DB_PORT),
  database: DB_NAME,
  username: DB_USER,
  password: DB_PASSWORD,
  ssl: false,
  connection: {
    options: '-c client_encoding=UTF8'
  },
  transform: {
    undefined: null,
  },
  types: {
    text: {
      to: 1,
      from: [1043], // CHAR, VARCHAR types
      serialize: (x: string) => x,
      parse: (x: string) => x
    }
  }
}); 