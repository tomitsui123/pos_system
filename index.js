'use strict';

const Hapi = require('hapi');
const server = new Hapi.Server();
const config = require('./config.js');
const empty = require('is-empty');

server.connection({ port: 3000, host: 'localhost' });

server.register({ // register all your plugins 
  register: require('hapi-postgres-connection'),
  DATABASE_URL: config.pgsqlUrl
}, function (err) {
  if (err) {
    // handle plugin startup error 
  }
});

server.route({
  method: 'POST',
  path: '/receiveOrder',
  handler: function (request, reply) {
  	var para = request.payload;
    var orderDetails = JSON.parse(para['data']);
    var invoiceId = para['invoice_id'];
    var employeeId = para['employee_id'];
  	reply(para['data']);
    let insert = '`INSERT INTO pos_record (employee_id, invoice_id, item, quantity, record_date, others, refer_id, details_id) VALUES';
    orderDetails.forEach((order, i) => {
      if(orderDetails.length-1 === i) {
        insert += ',';
      }
      insert += `(${employeeId}, ${invoiceId}, ${order.item}, ${order.quantity}, '', ${order.others}, '', ${order.details_id})`;
    })
    
    // `INSERT INTO pos_record (employee_id, invoice_id, item, quantity, record_date, others)
    //  VALUES (${employeeId}, ${invoiceId}, ${item}, ${quantity}, '', ))`;

    request.pg.client.query(insert, function(err, result) {
      


      var result = '';
      console.log(err, result);
      if(empty(err)) {
        result = 
        {
          status: 1,
          message: 'Insert success'
        }
      } else {
        result = 
        {
          status: 0,
          message: 'Error occurs'
        }
      }
      return reply(result);

    })
  }
});

server.route({
    method: 'GET',
    path: '/{name}',
    handler: function (request, reply) {
        reply('Hello, ' + encodeURIComponent(request.params.name) + '!');
    }
});

server.start((err) => {

    if (err) {
        throw err;
    }
    console.log(`Server running at: ${server.info.uri}`);
});