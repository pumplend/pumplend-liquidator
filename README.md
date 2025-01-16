# Pumplend liquidator

Pumplend liquidator is a montor local bots to listen all the ongoing positions (including borrow/long)

And trigger the liquidation by off-chain records .

Feel free to clone the repo and build your own liquidator to help pumplend being better ! 

## FAQ

- Why should i run the liquidator ? 
    - It's up to you . The one who trigger liquidtion will recive `0.5%` SOL amount of the position as Gas/Reward . 

- What if i trigger the liquidtion to the contract before it actually over ? 
    - Nothing gonna happened . Contract including the time check logic 

- When will the position being liquidated ?
    - Well , pumplend is not a price sensitive protocol . so the only liquidated trigger is the interest fee of user . When the interest fee higger than user's collateral , clean it .

## How to run this project  ?

Simple . Install the node.js env , and fill all the env-config as `.env.example` require . 

```
cp .env.example .env
npm install
```

And run 

```
npm run serve
```

## Path Struct

The whole liquidator including 2 standalong part : 

- **Monitor**
    - Listen on-chain actives , and analyze every transaction to contract . 
    - Storage it into local DB with readable format . 

- **Executor**
    - Loop all the orders in DB
    - Place runtime mission with culcuated liquidtion timestamp

## More Feature 

The monitor will take lots network resource and multithreading . Same as the exectutor . So it's better to use golang rebuild .

Anyway. currently build with nodejs , to make sure it worn't takes too long time to release .


## Base Logic (Write for myself . incase i forget how it works lol)

#### Monitor :

1. Loop fetch contract recently transactions (100x txns)

2. Check last index hash form db . And get all the new txn `finalArr`

3. Map the `finalArr` and fetch/decode txn by hash . And storage it into `action_history` db

4. Decode , fliter all txn into different kinds by function name :
    
    Borrow / LoopBorrowPump / LoopBorrowRaydium / IncressInterest : 
    - Generate Order Index : `Token-mint + Signer-address`
    - Fetch onchain `UserBorrowData`
    - Re-culcuate liquidtion time
    - Storage it into `orders` db (overwrite) 

    Repay / ClosePump / CloseRaydium
    - Del record form `orders` db by order index

5. Next Loop

#### Executor :

1. Get all timeout order from `orders` db fliter by liquition time .

2. Generate the liquition transaction via SDK

3. Sign and send transaction via local keypair