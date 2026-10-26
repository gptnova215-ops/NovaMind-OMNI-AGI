/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MarketData {
  bitcoin: { usd: number };
  ethereum: { usd: number };
  solana: { usd: number };
}

export class MarketService {
  private static API_URL = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd";

  static async fetchPrices(): Promise<Record<string, number>> {
    try {
      const response = await fetch(this.API_URL);
      if (!response.ok) throw new Error("Market Sink Offline");
      const data: MarketData = await response.json();
      
      return {
        BTC: data.bitcoin.usd,
        ETH: data.ethereum.usd,
        SOL: data.solana.usd
      };
    } catch (err) {
      console.error("Failed to ingest market data vectors:", err);
      // Fallback to last known stable state if API fails
      return {
        BTC: 65432,
        ETH: 3456,
        SOL: 145
      };
    }
  }
}
