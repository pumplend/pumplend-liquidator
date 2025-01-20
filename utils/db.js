/**
 * This file including data storage and reocrd generate 
 * Including :
 * - New order record
 * - New order history
 */
var MongoClient = require('mongodb').MongoClient;
require('dotenv').config()
const mainConnection = process.env.DB_HOST;
const mainDB = process.env.DB_NAME
/**
 * Public sheet
 */
const sIndex = "indexer";
const sOrder = "orders";
const sOrderHistory = "order_history";
const sActionHistory = "actions_history";
const sMission = "missions"

/**
 * Public functions
 */
async function connect()
{
    const pool =  await MongoClient.connect(mainConnection);
    const db =  pool.db(mainDB);
    return{
        pool,
        db,
        close:async ()=>{
            await pool.close()
        }
    }
}

async function updateIndexer(data) {
    const db = await connect()
    const query = { id: data.id }; 
    const ret = await db.db.collection(sIndex).replaceOne(query, data, { upsert: true });
    await db.close();
    return ret;
}

async function getIndexer(id) {
    const db = await connect()
    var ret = await db.db.collection(sIndex).find({
       
    }).project({_id:0}).toArray();
    await db.close();
    if(!ret || ret?.length ==0)
    {
        return {
            id:0,
            hash:""
        }
    }
    return ret[0];
}

async function updateOrder(data) {
    const db = await connect()
    const query = { id: data.id }; 
    const ret = await db.db.collection(sOrder).replaceOne(query, data, { upsert: true });
    await db.close();
    return ret;
}

async function closeOrder(id) {
    const db = await connect()
    console.log("del ::",id)
    const ret = await db.db.collection(sOrder).deleteMany({ id: id });
    await db.close();
    return ret;
}

async function getOrderById(id) {
    const db = await connect()
    var ret = await db.db.collection(sOrder).find({
        id: id
    }).project({_id:0}).toArray();
    await db.close();
    return ret;
}
async function getOrderByHash(hash) {
    const db = await connect()
    var ret = await db.db.collection(sOrder).find({
        hash: hash
    }).project({}).toArray();
    await db.close();
    return ret;
}
async function getOrderByDeadline(deadline) {
    const db = await connect()
    var ret = await db.db.collection(sOrder).find({
        liquidtionTime: { $lt: deadline }
    }).project({}).toArray();
    await db.close();
    return ret;
}
async function getOrders() {
    const db = await connect()
    var ret = await db.db.collection(sOrder).find({
    }).project({_id:0}).toArray();
    await db.close();
    return ret;
}

async function newActionHistory(data) {
    const db = await connect()
    var ret = await db.db.collection(sActionHistory).insertOne(data);
    await db.close();
    return ret;
}

async function getActionHistoryById(id) {
    const db = await connect()
    var ret = await db.db.collection(sActionHistory).find({
        id: id
    }).project({}).toArray();
    await db.close();
    return ret;
}

async function getActionHistory() {
    const db = await connect()
    var ret = await db.db.collection(sActionHistory).find({
    }).project({}).toArray();
    await db.close();
    return ret;
}

module.exports = {
    updateOrder,
    closeOrder,
    getOrderById,
    getOrderByHash,
    updateIndexer,
    getIndexer,
    newActionHistory,
    getActionHistory,
    getActionHistoryById,
    getOrderByDeadline,
    getOrders
}