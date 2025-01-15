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