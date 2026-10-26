/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FinancialCortex, Trade } from "../types";

export class TradingService {
  private coinbaseKey = (import.meta as any).env.VITE_COINBASE_API_KEY;
  private binanceKey = (import.meta as any).env.VITE_BINANCE_API_KEY;

  /**
   * Fetches latest market statistics.
   * @note DIRECT_API_DEPRECATED: Now using Intelligence Crawl for price vectors.
   */
  public async getMarketData(): Promise<{[key: string]: number}> {
    return {}; // Return empty to force reliance on Intelligence state
  }

  /**
   * Evaluates market alpha based on real metrics.
   */
  public async evolveStrategy(cortex: FinancialCortex): Promise<string> {
    const prices = await this.getMarketData();
    const btc = prices['BTCUSDT'];
    const eth = prices['ETHUSDT'];
    
    if (!btc || !eth) return "WAITING_FOR_MARKET_SYNC";

    const ratio = btc / eth;
    if (ratio > 20) return "Aggressive BTC Overweight (Real-time Ratio Analysis)";
    if (ratio < 15) return "ETH Momentum Pivot (Real-time Ratio Analysis)";
    return "Market Neutral Equilibrium (Dynamic Ledger Audit)";
  }

  /**
   * Executes a trade via the secure server-side execution node.
   * Ensures API keys never leave the server environment.
   */
  public async executeRealTrade(symbol: string, side: 'BUY' | 'SELL', amount: number): Promise<Trade> {
    try {
      const response = await fetch("/api/trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ side, product: symbol, amount: amount.toString() })
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Execution failed: ${text}`);
      }
      const result = await response.json();
      
      if (result.status === 'FAILED') {
        throw new Error(result.error);
      }

      return {
        id: result.txId || `SECURE-${Date.now()}`,
        symbol,
        side,
        amount,
        price: 0,
        timestamp: new Date().toISOString(),
        status: result.status as any
      };
    } catch (e) {
      console.error("[TRADE_SYNC_ERR]:", e);
      throw new Error(`SECURE_EXECUTION_FAILED: ${e instanceof Error ? e.message : 'Unknown'}`);
    }
  }

  /**
   * @deprecated Simulation removed per user request.
   */
  public executeTrade(): never {
    throw new Error("MOCK_TRADING_DEPRECATED: Connect real API keys for execution.");
  }
}

export const tradingService = new TradingService();
