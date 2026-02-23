const { createClient } = require('@libsql/client');

const url = 'libsql://project-links-onlymatt43.aws-us-east-2.turso.io';
const authToken = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NzE2MzQwNjksImlkIjoiYzM5NWE3MTUtYzE4YS00ZTIzLTliNjEtYWMzZjFmNWFkNTUyIiwicmlkIjoiMTJhOGUxMTQtZTM3OC00ZGM4LTk4ZGMtNDgxNjY4MzM4NTJlIn0.1Li34jGV4vUWt8TaR83lP3oRsuU9fUEfXD91J8uBxtKvTcPDdOxoPJJ2cjqO86V9vdg-LjSWfJmRBaTLrFenAg';

console.log('Testing Turso connection...');
console.log('URL:', url);
console.log('Token length:', authToken.length, 'chars');

const client = createClient({
  url,
  authToken,
});

(async () => {
  try {
    const result = await client.execute('SELECT 1 as test');
    console.log('✅ SUCCESS - Connection works!');
    console.log('Result:', result.rows);
  } catch (error) {
    console.log('❌ ERROR - Connection failed!');
    console.log('Error:', error.message);
    console.log('Full error:', error);
  }
})();
