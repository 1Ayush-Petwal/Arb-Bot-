import { DepthManager } from "./DepthManager"


const solInrMarket = new DepthManager("B-SOL_INR");

const usdtInrMarket = new DepthManager("B-USDT_INR");

const solUsdtMarket = new DepthManager("B-SOL_USDT");

setInterval(() => {
    console.log(solInrMarket.getRelevantDepth());
    console.log(usdtInrMarket.getRelevantDepth());
    console.log(solUsdtMarket.getRelevantDepth());

    // The math to get the arbitrage from the market depth 
    // Sell Sol for INR  -->  BUY USDT using that INR --> BUY SOL using USDT 
    // Since the the spread of the SOL-USDT market is less the ==> Spread = Lowest ASK - Highest Bid
    
    const inrFromSol = solInrMarket.getRelevantDepth().lowestAsk - 0.001;   // In order for the order matching to take place
    const usdtFromInr = inrFromSol / usdtInrMarket.getRelevantDepth().highestBid;
    const solFromUsdt = usdtFromInr / solUsdtMarket.getRelevantDepth().highestBid;
    
    console.log(`You can convert ${1} sol to ${solFromUsdt} sol`)
}, 2000);