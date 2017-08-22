'use strict';

const Hapi = require('hapi');
const server = new Hapi.Server();
const config = require('./config.js');
const empty = require('is-empty');

server.connection({ port: config.port, host: 'localhost' });

server.register({
  register: require('hapi-postgres-connection'),
  DATABASE_URL: config.pgsqlUrl
}, function (err) {
  if (err) {
    console.log(err)
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
  	// reply(para['data']);
    let insertStat = 'INSERT INTO pos_record (employee_id, invoice_id, item, quantity, others, refer_id, details_id, record_date) VALUES ';
    orderDetails.forEach((order, i) => {
      if (i !== 0) {
        insertStat += ',';
      }
      insertStat += `(${employeeId}, ${invoiceId}, '${order.item}', ${order.quantity}, '${order.others}', null, ${order.details_id}, now())`;
    })
    console.log(insertStat);
    // `INSERT INTO pos_record (employee_id, invoice_id, item, quantity, record_date, others)
    //  VALUES (${employeeId}, ${invoiceId}, ${item}, ${quantity}, '', ))`;

    request.pg.client.query(insertStat, function(err, result) {
      


      var result = '';
      // console.log(err, result);
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
  method: 'POST',
  path: '/cancelOrder',
  handler: function (request, reply) {
    var para = request.payload;
    var employeeId = para['employee_id'];
    var invoiceId = para['invoice_id'];
    var detailsId = para['details_id'];
    let deleteStat = `UPDATE pos_record SET valid=false where employee_id=${employeeId} AND invoice_id=${invoiceId} and details_id in (${detailsId})`;
    console.log(deleteStat);

    request.pg.client.query(deleteStat, function(err, result) {
      var replyMsg = '';
      if(empty(err)) {
        replyMsg = 
        {
          status: 1,
          message: 'Delete success'
        }
      } else {
        replyMsg = 
        {
          status: 0,
          message: 'Error occurs:' + err
        }
      }
      return reply(replyMsg);

    })
  }
});

server.route({
  method: 'POST',
  path: '/editOrder',
  handler: function (request, reply) {
    var para = request.payload;
    var item = empty(para['item']) ? 'item' : `'${para['item']}'`;
    var quantity = empty(para['quantity']) ? 'quantity' : para['quantity'];
    var others = empty(para['others']) ? 'others' : `'${para['others']}'`;

    var employeeId = para['employee_id'];
    var invoiceId = para['invoice_id'];
    var detailsId = para['details_id'];
    var stat = 
      `with updated as (update pos_record set valid=false where employee_id=${employeeId} and invoice_id=${invoiceId} and details_id= ${detailsId} and valid=true RETURNING id)
      insert into pos_record (employee_id, invoice_id, item, quantity, others, refer_id, details_id, record_date) 
      select ${employeeId}, ${invoiceId}, ${item}, ${quantity}, ${others}, id, ${detailsId}, now()
      from pos_record
      where id in (select id from updated);`;
    console.log(stat);
    return;
    request.pg.client.query(stat, function(err, result) {
      console.log(result);
      var replyMsg = '';
      if(empty(err)) {
        replyMsg = 
        {
          status: 1,
          message: 'Edit success'
        }
      } else {
        replyMsg = 
        {
          status: 0,
          message: 'Error occurs:' + err
        }
      }
      return reply(replyMsg);

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
        console.log(err)
        throw err;
    }
    console.log(`Server running at: ${server.info.uri}`);
});