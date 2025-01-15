const { Connection, PublicKey } = require('@solana/web3.js');
require('dotenv').config()
const connection = new Connection(process.env.SOLANA_RPC, 'confirmed'); 
const programId = new PublicKey(process.env.SOLANA_LISTEN_ADDRESS); 
const web3 = require("./utils/web3");
const monitoredAddress =programId;


async function loop ()
{
    const txs = await web3.getTransactionHistory(monitoredAddress,20);
    if(txs && txs?.length > 0)
        {
            const decode = await web3.getTransactionDetailsByHash(txs[10].signature);
            decode.forEach(e => {
                actions(
                    e
                   )
            });

        }    
}
function actions(data) {
    switch (data.name) {
        case "borrow":
          console.log("Processing 'borrow' instruction...");
       
          break;
        case "borrowLoopPump":
          console.log("Processing 'borrowLoopPump' instruction...");
        
          break;
        case "borrowLoopRaydium":
          console.log("Processing 'borrowLoopRaydium' instruction...");
         
          break;
        case "repay":
          console.log("Processing 'repay' instruction...");
       
          break;
        case "increaseCollateral":
          console.log("Processing 'increaseCollateral' instruction...");
    
          break;
        case "liquidatePump":
          console.log("Processing 'liquidatePump' instruction...");
       
          break;
        case "liquidateRaydium":
          console.log("Processing 'liquidateRaydium' instruction...");
       
          break;     
        default:
          console.log(`Unhandled instruction: ${data}`);
      }
}


const pollingInterval = 30000; //30S
setInterval(async () => {
  await loop()
}, pollingInterval);

