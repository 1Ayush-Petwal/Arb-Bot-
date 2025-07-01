import { DepthManager } from "./DepthManager"
import { createOrder, cancelAll } from "./order";

const solInrMarket = new DepthManager("B-SOL_INR");
const usdtInrMarket = new DepthManager("B-USDT_INR");
const solUsdtMarket = new DepthManager("B-SOL_USDT");

// Strategy Testing - Calculate potential arbitrage
function calculateArbitrage() {
    const solInrDepth = solInrMarket.getRelevantDepth();
    const usdtInrDepth = usdtInrMarket.getRelevantDepth();
    const solUsdtDepth = solUsdtMarket.getRelevantDepth();
    
    console.log("=== Market Depths ===");
    console.log("SOL/INR:", solInrDepth);
    console.log("USDT/INR:", usdtInrDepth);
    console.log("SOL/USDT:", solUsdtDepth);

    // Calculate arbitrage: Sell SOL for INR → Buy USDT with INR → Buy SOL with USDT
    const startingSol = 1;
    
    // Step 1: Sell SOL for INR (use highest bid to sell)
    const inrFromSol = startingSol * (solInrDepth.highestBid - 0.001);
    
    // Step 2: Buy USDT with INR (use lowest ask to buy)
    const usdtFromInr = inrFromSol / (usdtInrDepth.lowestAsk + 0.001);
    
    // Step 3: Buy SOL with USDT (use lowest ask to buy)
    const finalSol = usdtFromInr / (solUsdtDepth.lowestAsk + 0.001);
    
    console.log(`Arbitrage: ${startingSol} SOL → ${inrFromSol.toFixed(2)} INR → ${usdtFromInr.toFixed(4)} USDT → ${finalSol.toFixed(6)} SOL`);
    console.log(`Profit: ${((finalSol - startingSol) * 100).toFixed(4)}%`);
    
    return {
        profitable: finalSol > startingSol,
        profitPercent: ((finalSol - startingSol) * 100),
        steps: { inrFromSol, usdtFromInr, finalSol }
    };
}

async function executeArbitrage() {
    try {
        console.log("=== Starting Arbitrage Execution ===");
        
        const arbitrageData = calculateArbitrage();
        
        // Only execute if profitable (with minimum threshold)
        if (!arbitrageData.profitable || arbitrageData.profitPercent < 0.1) {
            console.log("No profitable arbitrage opportunity found");
            return;
        }
        
        const solQuantity = 0.01; // Amount of SOL to trade
        
        // Step 1: Sell SOL for INR
        console.log("Step 1: Selling SOL for INR");
        const solInrPrice = (solInrMarket.getRelevantDepth().highestBid - 0.01).toFixed(2);
        await createOrder("sell", "B-SOL_INR", parseFloat(solInrPrice), solQuantity, `arb_sol_${Date.now()}`);
        
        // Wait for order to potentially fill
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Step 2: Buy USDT with INR
        console.log("Step 2: Buying USDT with INR");
        const usdtInrPrice = (usdtInrMarket.getRelevantDepth().lowestAsk + 0.01).toFixed(2);
        const inrAmount = solQuantity * parseFloat(solInrPrice);
        const usdtQuantity = inrAmount / parseFloat(usdtInrPrice);
        await createOrder("buy", "B-USDT_INR", parseFloat(usdtInrPrice), usdtQuantity, `arb_usdt_${Date.now()}`);
        
        // Wait for order to potentially fill
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Step 3: Buy SOL with USDT
        console.log("Step 3: Buying SOL with USDT");
        const solUsdtPrice = (solUsdtMarket.getRelevantDepth().lowestAsk + 0.001).toFixed(4);
        const finalSolQuantity = usdtQuantity / parseFloat(solUsdtPrice);
        await createOrder("buy", "B-SOL_USDT", parseFloat(solUsdtPrice), finalSolQuantity, `arb_sol_final_${Date.now()}`);
        
        console.log("=== Arbitrage Execution Complete ===");
        
        // Cancel any unfilled orders after waiting
        await new Promise(resolve => setTimeout(resolve, 30000));
        await cancelAll("B-SOL_INR");
        await cancelAll("B-USDT_INR");
        await cancelAll("B-SOL_USDT");
        
    } catch (error) {
        console.error("Error in arbitrage execution:", error);
        
        // Clean up orders on error
        try {
            await cancelAll("B-SOL_INR");
            await cancelAll("B-USDT_INR");
            await cancelAll("B-SOL_USDT");
        } catch (cleanupError) {
            console.error("Error cleaning up orders:", cleanupError);
        }
    }
}

// Monitor for arbitrage opportunities
function startArbitrageMonitoring() {
    console.log("Starting arbitrage monitoring...");
    
    setInterval(() => {
        calculateArbitrage();
    }, 5000); // Check every 5 seconds
    
    // Execute arbitrage less frequently to avoid overwhelming the exchange
    // setInterval(async () => {
    //     await executeArbitrage();
    // }, 60000); // Execute every minute if profitable
}

// Start monitoring
startArbitrageMonitoring();