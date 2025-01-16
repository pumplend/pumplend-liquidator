const { Connection, PublicKey } = require('@solana/web3.js');
require('dotenv').config()
const connection = new Connection(process.env.SOLANA_RPC, 'confirmed'); 
const programId = new PublicKey(process.env.SOLANA_LISTEN_ADDRESS); 
const web3 = require("./utils/web3");
const db = require("./utils/db")
const monitoredAddress =programId;


async function loop ()
{
    const txs = await web3.getTransactionHistory(monitoredAddress,100);
    if(txs && txs?.length > 0)
        {
          console.log(txs[0].signature)
          const finalArr = await hashCheck();
          //Handel new order
          for (let i = 0 ; i < finalArr ; i++)
          {
            try{
              let tx = finalArr[i]
              await handleNewTx(tx)
              //Update indexer
              // await db.updateIndexer(
              //   {
              //     id:0,
              //     hash:tx.signature
              //   }
              // )
            }catch(e)
            {
              console.error(e)
            }

          }

        }    
}

async function handleNewTx(tx) {
  const decode = await web3.getTransactionDetailsByHash(tx.signature);
  return actions(decode.name)
}

async function hashCheck(rawData) {
    const latestTxHash = await db.getIndexer();
   
    for(let i = 0 ; i<=rawData.length ;i++)
    {
      //TODO , Add the out of index fetcher
      if(rawData[i].signature == latestTxHash.hash)
      {
        return rawData.slice(0, i);
      }
    }

    return rawData;
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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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