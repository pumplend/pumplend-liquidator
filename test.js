const db = require("./utils/db")
async function test() {
    console.log(
        "active positions ::",
        await db.getOrders()
    )
}

test()