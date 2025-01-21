
const { Connection, PublicKey } = require('@solana/web3.js');
require('dotenv').config()
const connection = new Connection(process.env.SOLANA_RPC, 'confirmed'); 
const web3 = require("./utils/web3");
const db = require("./utils/db")
const sdk = require("@pumplend/pumplend-sdk")

const pk = web3.getLocalPublicKey();

async function generateLiquidtionTx(data)
{
    try{
        // console.log(data)
        const p = new sdk.Pumplend(process.env.NETWORK) 
        const userBorrowData = await p.tryGetUserBorrowData(
            connection,
            new PublicKey(data.token),
            new PublicKey(data.user)
        )
        
        return await p.close_pump(
            new PublicKey(data.token),new PublicKey(data.user),userBorrowData.referrer,pk
        )
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
        // console.log(pendingOrders[i])
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