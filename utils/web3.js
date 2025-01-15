/**
 * This file is about solan-web3.js 
 * 
 * Provide base functios & instructions , including :
 * 1. solana sign verifiy
 * 2. solana get transactions by contract address 
 * 3. solana decode and analyze transaction details.
 * 4. solana base network states fetch
 */

const { Connection, PublicKey ,Keypair} = require("@solana/web3.js");
const { Program, AnchorProvider } = require("@project-serum/anchor");
const nacl = require('tweetnacl');
const idl = require("../idl/pumplend.json")
require('dotenv').config()
const connection = new Connection(process.env.SOLANA_RPC, 'confirmed'); 
const programId = new PublicKey('6m6ixFjRGq7HYAPsu8YtyEauJm8EE8pzA3mqESt5cGYf'); 
async function loadProgram() {
  return new Program(idl, programId, connection);
}

async function processInstruction(program, ix ,adds) {
  if (adds[ix.programIdIndex].toBase58() != program.programId.toBase58()) {
    return;
  }
  const decodedIx = program.coder.instruction.decode(ix.data,"base58");
  if (!decodedIx) {
    console.log("Unable to decode the instruction.");
    return;
  }
  console.log("Decoded Instruction Name:", decodedIx.name);
  console.log("Decoded Instruction Data:", decodedIx.data);

  return{
        name:decodedIx.name,
        inputData : decodedIx.data,
        address:adds
    }
  switch (decodedIx.name) {
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
      console.log(`Unhandled instruction: ${decodedIx.name}`);
  }
}
async function parseTransaction(txHash, program) {
  const transaction = await connection.getTransaction(txHash, { commitment: "confirmed" });
  if (!transaction) {
    console.error("Transaction not found.");
    return;
  }
  const instructions = transaction.transaction.message.instructions;
  let ret = [];
  for (const ix of instructions) {
    const tmp = await processInstruction(program, ix,transaction.transaction.message.accountKeys);
    if(tmp)
    {
        ret.push(
            tmp
        )
    }

  }
  return ret;
}



function verifySolanaSignature(message, signature, publicKey) {
    try {
      const pubKey = new PublicKey(publicKey);
      return nacl.sign.detached.verify(message, signature, pubKey.toBytes());
    } catch (error) {
      console.error('sign verfiy err ::', error);
      return false;
    }
}


async function getTransactionDetails(txHash) {  
    try {
        const program = await loadProgram();
        return await parseTransaction(txHash, program);
    } catch (error) {
      console.error('Error getting transaction:', error);
      return false;
    }
  }

module.exports= {
    verifySolanaSignature,
    getTransactionDetails
}