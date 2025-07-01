import axios from "axios";

export class DepthManager {
    //To monitor a specific market as per provided 

    private market: string;
    // mappings to store the bids & asks

    private bids: {
        [key: string]: string
    };
    private asks: {
        [key: string]: string
    };

    constructor(_market: string) {
        this.market = _market;
        this.bids = {}
        this.asks = {}
        setInterval(() => {
            this.pollMarket();
        }, 3000);
    }

    async pollMarket() {
        // Poll the specific market 
        const depth = await axios.get(`https://public.coindcx.com/market_data/orderbook?pair=${this.market}`);


        this.bids = depth.data.bids;
        this.asks = depth.data.asks;

    }

    getRelevantDepth() {
        let highestBid = -100;
        let lowestAsk = 10000000

        Object.keys(this.bids).map(x => {
            if (parseFloat(x) > highestBid) {
                highestBid = parseFloat(x);
            }
        })
        Object.keys(this.asks).map(x => {
            if (parseFloat(x) < lowestAsk) {
                lowestAsk = parseFloat(x);
            }
        })
        return {
            highestBid,
            lowestAsk
        }
    }
}