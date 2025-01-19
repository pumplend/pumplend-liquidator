
const { Connection, PublicKey } = require('@solana/web3.js');
require('dotenv').config()
const connection = new Connection(process.env.SOLANA_RPC, 'confirmed'); 
const web3 = require("./utils/web3");
const db = require("./utils/db")
const sdk = require("@pumplend/pumplend-sdk")

async function generateLiquidtionTx(data)
{
    try{
        const p = new sdk.Pumplend(process.env.NETWORK) 
        const userBorrowData = await p.tryGetUserBorrowData(
            connection,data.token,data.user
        )
        return await p.close_pump(
            new PublicKey(data.token),new PublicKey(data.user),userBorrowData.referrer
        )
    }catch(e)
    {
        
    }

}


async function loop ()
{
    const timenow = Math.floor(Date.now()/1000) //Get timestamp in sec
    const pendingOrders = await db.getOrderByDeadline(timenow)

    for(let i = 0 ; i< pendingOrders ; i++)
    {
        //Sign and send exection transaction
        const tx = await generateLiquidtionTx();
        if(tx)
        {
            //Success . go ahead
        }else{
            //Failed . why ? check .
        }
    }
}

async function init() {
    while(true)
    {
      try{
        await loop();
        await sleep(3000000) //30s
      }catch(e){
        console.error(e)
      }
    }
  }
  
  
  loop()