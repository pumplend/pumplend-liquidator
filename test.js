const web3 = require("./utils/web3")

async function test() {
    console.log("🚀 Test Launch ")
    console.log(
        await web3.getTransactionDetailsByHash("5DBFP4NeVsQbx5PTMjWoLuyh7wquKdgXVZsmcA17Ck4FdTodSeeix4Ujco7JxNqgy4LpaCfraf4kVB2rY4NRKxai")
    )
    
}

test()