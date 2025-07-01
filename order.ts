import axios from "axios";
import crypto from "crypto";
import { key, secret } from "./config";

const baseurl = "https://api.coindcx.com";
const timeStamp = Math.floor(Date.now());

export const createOrder = async (
    side: "buy" | "sell",
    market: string,
    price: number,
    quantity: number,
    clientOrderId: string
) => {
    const body = {
        side, //Toggle between 'buy' or 'sell'.
        order_type: "limit_order", //Toggle between a 'market_order' or 'limit_order'.
        market, //Replace 'SNTBTC' with your desired market.
        price_per_unit: price, //This parameter is only required for a 'limit_order'
        total_quantity: quantity, //Replace this with the quantity you want
        timestamp: timeStamp,
        client_order_id: clientOrderId //Use the passed parameter
    };

    // Fixed: Use Buffer.from() instead of new Buffer()
    const payload = Buffer.from(JSON.stringify(body)).toString();
    const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    try {
        // Fixed: Proper axios.post usage with correct structure
        const response = await axios.post(
            baseurl + "/exchange/v1/orders/create",
            body,
            {
                headers: {
                    'X-AUTH-APIKEY': key,
                    'X-AUTH-SIGNATURE': signature,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data;
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
};


export const cancelAll = async (market: string) => {
    const body = {
        market,
        "timestamp": timeStamp
    }

    const payload = new Buffer(JSON.stringify(body)).toString();
    const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex')


    try {
        const response = await axios.post(
            baseurl + "/exchange/v1/orders/cancel_all",
            body,
            {
                headers: {
                    'X-AUTH-APIKEY': key,
                    'X-AUTH-SIGNATURE': signature,
                    'Content-Type': 'application/json'

                },
            }
        );

        return response.data;
    }
    catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
}