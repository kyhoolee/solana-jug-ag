/// <reference types="node" />
import { AccountInfo, Connection, PublicKey } from '@solana/web3.js';
import { SwapMode } from './amm';
import { RouteInfo } from './routes';
import { TokenRouteSegments } from './types';
import JSBI from 'jsbi';
import { TransactionFeeInfo } from '@jup-ag/common';
export declare function fetchAccountInfos(connection: Connection, routes: TokenRouteSegments): Promise<void>;

interface GetQuotesParams {
    inputRouteSegment: TokenRouteSegments;
    amount: JSBI;
    inputMint: PublicKey;
    outputMint: PublicKey;
    platformFeeBps: number;
    slippageBps: number;
    filterTopNResult?: number;
    onlyDirectRoutes?: boolean;
    swapMode: SwapMode;
    getDepositAndFeeForRoute: (params: {
        marketInfos: RouteInfo['marketInfos'];
    }) => Promise<TransactionFeeInfo | undefined>;
    intermediateTokens?: string[];
    asLegacyTransaction?: boolean;
}

export declare function processInputRouteSegmentToRoutesInfos(
    { 
        inputRouteSegment, 
        inputMint, outputMint, amount, 
        getDepositAndFeeForRoute, 
        platformFeeBps, slippageBps, 
        filterTopNResult, 
        onlyDirectRoutes, 
        swapMode, 
        asLegacyTransaction, 
    }: GetQuotesParams): Promise<RouteInfo[]>;

export declare function chunkedGetMultipleAccountInfoMap(
    connection: Connection, 
    pks: PublicKey[], 
    chunkSize?: number
): Promise<Map<string, AccountInfo<Buffer> | null>>;

export {};
