const dbPool = require('./connection-pool-eco')();


function dbExecute(_sql, values) {
    console.log("_sql dbExecute :  ", _sql);

    return new Promise((resolve, reject) => {
            dbPool.execute( {
                rowsAsArray: true,
                sql: _sql 
                }
                , 
                [values],
                 function(err, rows, fields){
                    if (err) reject(err);
                    resolve({rows, fields})               
                }
            );
    })
}

function dbQuery(_sql, values) {
    // console.log("_sql :  ", _sql);

    return new Promise((resolve, reject) => {
            dbPool.query( {
                rowsAsArray: true,
                sql: _sql 
                }
                , 
                [values],
                 function(err, rows, fields){
                     
                    if (err) { reject(err) ; console.log('dbQuery  error', [values], err.message)};
                    resolve({rows, fields})               
                }
            );
    })
}

module.exports = { dbQuery: dbQuery,
    dbExecute: dbExecute 
};
