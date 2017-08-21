var pgsql = {
  host: 'localhost',
  user: 'tomi',
  pass: '28987506',
  table: 'business'
};
var pgsqlUrl = `postgres://${pgsql.user}:${pgsql.pass}@${pgsql.host}/${pgsql.table}`;

module.exports = {
  host: '0.0.0.0',
  port: '80',
  webPort: 3000,
  pgsql: pgsql,
  pgsqlUrl: pgsqlUrl
};