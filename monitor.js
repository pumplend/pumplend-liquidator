const { Connection, PublicKey } = require('@solana/web3.js');
require('dotenv').config()
const connection = new Connection(process.env.SOLANA_RPC, 'confirmed'); 
const programId = new PublicKey(process.env.SOLANA_LISTEN_ADDRESS); 
const web3 = require("./utils/web3");
const db = require("./utils/db")
const monitoredAddress =programId;
const sdk = require("@pumplend/pumplend-sdk")


const lend = new sdk.Pumplend(process.env.NETWORK) 

async function loop ()
{
    const txs = await web3.getTransactionHistory(monitoredAddress,100);
    if(txs && txs?.length > 0)
        {
          console.log(txs[0].signature)
          var finalArr = await hashCheck(txs);
          //Handel new order
          // if(finalArr && finalArr?.length>0)
          // {
          //   finalArr = finalArr.reverse()
          // }
          
          for (let i = finalArr.length ; i > 0 ; i--)
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
  if(tx && tx?.signature )
  {
    const decode = await web3.getTransactionDetailsByHash(tx.signature);
    for( let i = 0 ; i < decode.length;i++)
    {
      await actions(tx.signature,decode[i])
    }
  }
}

async function hashCheck(rawData) {
    const latestTxHash = await db.getIndexer();
   
    for(let i = 0 ; i<=rawData.length ;i++)
    {
      //TODO , Add the out of index fetcher
      if(rawData[i]?.signature == latestTxHash.hash)
      {
        return rawData.slice(0, i);
      }
    }

    return rawData;
}

async function actions(hash,data) {
  //Handle transactions by actions types 
    switch (data.name) {
        case "borrow": case "borrowLoopPump": case "borrowLoopRaydium":case "increaseCollateral":
          //Storage the action history into DB
          const r =  newBorrowLikeAction(hash,data) 
          // await db.newActionHistory(data)
          //Culcuate Liquidtion time using SDK
          // console.log("Processing borrow like actions . overwrite the order");
          break;
        case "repay":case "liquidatePump":case "liquidateRaydium":
          //Storage the action history into DB
          // await db.newActionHistory(data)
          //Cancel listen , the posistion been closed.
          // console.log("Processing repay like actions . del the order");
          break;
        case "stake" :
          break;
        case "withdraw" :
          break;
        default:
          // console.log(`Unhandled instruction:`,data);
          return 0;
      }
}

async function newBorrowLikeAction(hash,data) {
  let signer,token,id,ret;

  switch (data.name) {
    case "borrow": 
      signer = data.address[0];
      token = data.address[7];
      id = data.address[2]
    break;
    case "borrowLoopPump": 
      signer = data.address[0];
      token = data.address[7];
      id = data.address[2]
    break;
    case "borrowLoopRaydium":
      signer = data.address[0];
      token = data.address[7];
      id = data.address[2]
    break;

    case "increaseCollateral":
      signer = data.address[0];
      token = data.address[6];
      id = data.address[3]
    break;
    default:
    console.log(`Unhandled instruction: ${data}`);
    return 0;
  }

  //Get data right now . and storage into the active orders . 
  const borrowData  = lend.tryGetUserBorrowData(connection,token,signer);
  const liquidtion = lend.pumplend_estimate_interest(borrowData);
  ret = {
    id:id.toBase58(),
    hash:hash,
    user:signer.toBase58(),
    token:token.toBase58(),
    deadline: liquidtion.liquiteTime,
  }
  console.log(ret)
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