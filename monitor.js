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
    const txs = await web3.getTransactionHistory(monitoredAddress,10);
    if(txs && txs?.length > 0)
        {
          
          var finalArr = await hashCheck(txs);
          for (let i = finalArr.length-1 ; i > -1 ; i--)
          {
            try{
              console.log(txs[i]?.signature)
              let tx = finalArr[i]
             
              await handleNewTx(tx)

              //Update indexer

              await db.updateIndexer(
                {
                  id:0,
                  hash:tx.signature
                }
              )
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
    console.log(`Tx :: ${hash} ==== ${data.name}`)
    switch (data.name) {
        case "borrow": case "borrowLoopPump": case "borrowLoopRaydium":case "increaseCollateral":
          return await newBorrowLikeAction(hash,data) 
          break;
        case "repay":case "liquidatePump":case "liquidateRaydium":
          return await newRepayLikeAction(hash,data)
          break;
        case "stake" : case "withdraw" :
          return await otherActions(hash,data)
          break;
        default:
          console.log(`Unhandled instruction:`,hash);
          return 0;
      }
}

async function newBorrowLikeAction(hash,data) {
  let signer,token,id,ret;
  switch (data.name) {
    case "borrow": 
      signer = data.address[0];
      token = data.address[7];
      id = data.address[2];


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

  try{
    //Storage active history now 
    const active = {
      hash:hash,
      id:id.toBase58(),
      type:data.name,
      user:signer.toBase58(),
      token:token.toBase58(),
      amount:data.inputData.collateralAmount.toString(),
      blockTime : data.blockTime,
    }
    await db.newActionHistory(active)

    //Get data right now . and storage into the active orders . 
    const borrowData  = await lend.tryGetUserBorrowData(connection,token,signer);
    const liquidtion = lend.pumplend_estimate_interest(borrowData,0.01);
    // console.log(borrowData)
    ret = {
      hash:hash,
      id:id.toBase58(),
      user:signer.toBase58(),
      token:token.toBase58(),
      collateralAmount:borrowData.collateralAmount.toString(),
      depositSolAmount:borrowData.depositSolAmount.toString(),
      borrowedAmount:borrowData.borrowedAmount.toString(),
      referrer:borrowData.referrer.toBase58(),
      blockTime : data.blockTime,
      deadline: liquidtion.liquiteTime,
    }
    // console.log(ret)
    await db.updateOrder(ret)

    return true;
  }catch(e)
  {
    console.log(e)
    //May be position already close . emit account not found , ignore it /
  }

}
async function newRepayLikeAction(hash,data) {
  let liquidator,signer,referrer,token,id,ret;
  switch (data.name) {
    case "repay": 
      liquidator = data.address[0]
      signer = data.address[0];
      referrer = data.address[1]
      token = data.address[8];
      id = data.address[3];
    break;
    case "liquidatePump": 
      liquidator = data.address[0]
      signer = data.address[1];
      referrer = data.address[24]
      token = data.address[8];
      id = data.address[3]
    break;
    case "liquidateRaydium":
      liquidator = data.address[0]
      signer = data.address[1];
      referrer = data.address[24]
      token = data.address[9];
      id = data.address[3]
    break;
    default:
    console.log(`Unhandled instruction: ${data}`);
    return 0;
  }

  try{
    //Storage active history now 
    const active = {
      hash:hash,
      id:id.toBase58(),
      type:data.name,
      liquidator:liquidator.toBase58(),
      user:signer.toBase58(),
      token:token.toBase58(),
      referrer:referrer.toBase58(),
      blockTime : data.blockTime,
    }
    // console.log(active)
    await db.newActionHistory(active)

    await db.closeOrder(id.toBase58())
   
    return true;
  }catch(e)
  {
    console.log(e)
    //May be position already close . emit account not found , ignore it /
  }
}


async function otherActions(hash,data) {
  let active;
  switch (data.name) {
    case "stake": 
      active = {
        hash:hash,
        type:data.name,
        user:data.address[0].toBase58(),
        referrer : data.address[1].toBase58(),
        amount:data.inputData.amount.toString(),
        blockTime : data.blockTime,
      }
    break;
    case "withdraw": 
    active = {
      hash:hash,
      type:data.name,
      user:data.address[0].toBase58(),
      referrer : data.address[1].toBase58(),
      shares:data.inputData.shares.toString(),
      blockTime : data.blockTime,
    }
    break;
    default:
    console.log(`Unhandled instruction: ${data?.name}`);
    return 0;
  }
  // console.log(active)
  await db.newActionHistory(active)

}


function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function init() {
  while(true)
  {
    try{
      await loop();
      await sleep(1000) //30s
    }catch(e){
      console.error(e)
    }
  }
}


// loop()

init()