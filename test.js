const db = require("./utils/db")
async function test() {
    console.log(
        "active positions ::",
        await db.getOrders()
    )

    // console.log(
    //     "zzntY4AtoZhQE8UnfUoiR4HKK2iv8wjW4fHVTCzKnn6 History actives ::",
    //     await db.getActionHistoryByRules(
    //         {
    //             user:"zzntY4AtoZhQE8UnfUoiR4HKK2iv8wjW4fHVTCzKnn6"
    //         }
    //     )
    // )
}

test()