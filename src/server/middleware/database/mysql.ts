import {createPool, IPoolConfig} from 'mysql';

export class MysqlDatabase {

    private databaseConfig: IPoolConfig;

    constructor() {
        this.databaseConfig = {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            database: process.env.DB_DATABASE || 'crypt',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'admin'
        };
    }

    createPool(config?: IPoolConfig) {
        return createPool(config || this.databaseConfig);
    }

    query(){
        // retrofit old code that called query directly to use a pool.
        let sql_args = [];
        let args = arguments;
        let callback = args[args.length - 1]; // last arg is callback
        let pool = this.createPool();
        pool.getConnection((connErr, connection) => {
            if (connErr) {
                return callback(connErr);
            }
            if (args.length > 2) {
                sql_args = args[1];
            }
            connection.query(args[0], sql_args, (err, results) => {
                connection.release(); // always put connection back in pool after last query
                if (err) {
                    return callback(err);
                }
                return callback(null, results);
            });
        });
    }

    getConnection(callback){
        // if we want a temporary pool for multiple queries, we can use this method to create it
        let pool = this.createPool();
        pool.getConnection(function(err, connection) {
            if (err) {
                return callback(err);
            }
            return callback(null, connection);
        });
    }

}
