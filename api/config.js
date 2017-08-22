var pgsql = {
  host: '192.168.1.54:5432',
  user: 'tomi',
  pass: '28987506',
  table: 'business'
};
var pgsqlUrl = `postgres://${pgsql.user}:${pgsql.pass}@${pgsql.host}/${pgsql.table}`;
postgres://tomi:28987506@192.168.1.54/business

module.exports = {
  host: '0.0.0.0',
  port: 3000,
  webPort: 3000,
  pgsql: pgsql,
  pgsqlUrl: pgsqlUrl
};