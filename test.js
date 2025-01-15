const web3 = require("./utils/web3")

async function test() {
    console.log("🚀 Test Launch ")
    console.log(
        await web3.getTransactionDetails("4SEoSkUF5Yhb6NyZhuzXzcZ6wrwMUw6vFFiCstT7wcT6stPoUcN6LVLRK1rgV9R43zaL2D6y1JRD2mFXXGaXRLnf")
    )
    
}

test()