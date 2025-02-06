
const { Connection, PublicKey } = require('@solana/web3.js');
require('dotenv').config()
const connection = new Connection(process.env.SOLANA_RPC, 'confirmed'); 
const web3 = require("./utils/web3");
const db = require("./utils/db")
const sdk = require("@pumplend/pumplend-sdk")
const ray = require("@pumplend/raydium-js-sdk")

const pk = web3.getLocalPublicKey();

const lend = new sdk.Pumplend(process.env.NETWORK) 
async function generateLiquidtionTx(data)
{
    try{
        // console.log(data)
        const p = new sdk.Pumplend(process.env.NETWORK,new PublicKey("41LsHyCYgo6VPuiFkk8q4n7VxJCkcuEBEX99hnCpt8Tk"),null,new PublicKey("6QJnyDfQHu1mfCpMiyamBhshbjsAQm9T8baSpHPyrtNe")) 
        const userBorrowData = await p.tryGetUserBorrowData(
            connection,
            new PublicKey(data.token),
            new PublicKey(data.user)
        )
        const curve = await p.tryGetPumpTokenCurveData(connection,new PublicKey(data.token))
        if(curve && curve.complete == BigInt(1))
        {
            const pools = await ray.getPoolsForToken(new PublicKey(data.token))
            if(pools && pools.length>0)
            {
                const pool = pools[0];
                console.log("Try close it in raydium ::",pool)
                return await p.close_raydium(
                    connection,new PublicKey(data.token),pool,new PublicKey(data.user),userBorrowData.referrer,pk
                )
            }
        }else{
            return await p.close_pump(
                new PublicKey(data.token),new PublicKey(data.user),userBorrowData.referrer,pk
            )
        }

    }catch(e)
    {
        console.error(e)
    }

}


async function loop ()
{
    const timenow = Math.floor(Date.now()/1000) //Get timestamp in sec
    const pendingOrders = await db.getOrderByDeadline(timenow)
    
    for(let i = 0 ; i< pendingOrders.length ; i++)
    {
        //Sign and send exection transaction
        const tx = await generateLiquidtionTx(pendingOrders[i]);
        // const userBorrowData = await lend.tryGetUserBorrowData(
        //     connection,
        //     new PublicKey(pendingOrders[i].token),
        //     new PublicKey(pendingOrders[i].user),
           
        // )
        // console.log(pendingOrders[i])
        // console.log(
        //     "User borrow data : : ",
        //     userBorrowData,
        //     "\n Estimate interest ::",lend.pumplend_estimate_interest(
        //         userBorrowData,
        //         10
        //     ),
        //     "\n Max sol ::",lend.pumplend_culcuate_max_borrow_rate({},userBorrowData.collateralAmount,0.8)
        // )

        // console.log(tx)
        if(tx)
        {
            //Success . go ahead
            try{
                const ret = await web3.localSendTx(tx)
                console.log("new liquidtion :: ",ret)
            }catch(e)
            {
                console.error(e)
            }

        }else{
            //Failed . why ? check . Email ? Telegram Bot ? or SMS . info me 
        }
    }
}
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  
async function init() {
    while(true)
    {
      try{
        await loop();
        await sleep(30000) //30s
      }catch(e){
        console.error(e)
      }
    }
  }
  
  
//   loop()
init()