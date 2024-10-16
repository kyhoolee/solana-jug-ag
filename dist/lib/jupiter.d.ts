import { AddressLookupTableAccount, BlockhashWithExpiryBlockHeight, Cluster, Connection, FeeCalculator, Keypair, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import { MarketsCache, RouteInfo } from './routes';
import { MarketInfo } from './market';
import { ExecuteParams, getRemoteRouteMap, SwapResult, PlatformFeeAndAccounts, QuoteMintToReferrer, TokenMintAddress } from '@jup-ag/common';
import { TokenRouteSegments } from './types';
import { Amm, SwapMode } from './amm';
import JSBI from 'jsbi';
import { SingleLevelAmmValidator } from './ammValidator';
import { ammFactory } from './ammFactory';
import { AddressLookupTableProvider } from './addressLookupTableProvider';
export type SerumOpenOrdersMap = Map<string, PublicKey>;
export { MarketInfo } from './market';
export { getPlatformFeeAccounts } from './fee';
export * from './types';
export { RouteInfo, getRouteInfoUniqueId, MarketsCache } from './routes';
export { Amm, SwapMode, ammFactory };
export * from './amms';
export * from '@jup-ag/common';

export type JupiterLoadParams = {
    connection: Connection;
    cluster: Cluster;
    user?: PublicKey | Keypair;
    platformFeeAndAccounts?: PlatformFeeAndAccounts;
    /** See {@link Jupiter.quoteMintToReferrer} */
    quoteMintToReferrer?: Map<TokenMintAddress, PublicKey>;
    /** See {@link Jupiter.routeCacheDuration} */
    routeCacheDuration?: number;
    /** See {@link Jupiter.wrapUnwrapSOL} */
    wrapUnwrapSOL?: boolean;
    /** A markets cache, URL to a remote markets cache or a local cached object, defaults to jupiter remote markets cache */
    marketsCache?: {
        url: string;
    } | MarketsCache;
    /**
     * On multi-leg trades, the intermediate tokens is restricted to X top tokens in volume and certain utility tokens (Saber wrapped decimal tokens)
     * This is to reduce the load by having to compute trades through routes that are not so liquid
     */
    restrictIntermediateTokens?: boolean | {
        intermediateTokens: Set<string>;
    };
    /** See {@link Jupiter.shouldLoadSerumOpenOrders}, default to false */
    shouldLoadSerumOpenOrders?: boolean;
    ammsToExclude?: SingleLevelAmmValidator;
    mintsToExclude?: PublicKey[];
    /** Use a preloaded address lookup table cache rather than a lazy cache */
    usePreloadedAddressLookupTableCache?: boolean;
};


export declare class Jupiter {
    private connection;
    private cluster;
    tokenRouteSegments: TokenRouteSegments;
    private feeCalculator;
    private platformFeeAndAccounts;
    /** Referrer account to collect Serum referrer fees for each given quote mint, the referrer fee is 20% of the Serum protocol fee */
    private quoteMintToReferrer;
    /**
     * Controls {@link Jupiter.computeRoutes} accounts caching. The cache is pair dependant. The unit is millisecond
     * - -1, it will not fetch unless shouldFetch === true
     * - 0, it will fetch everytime
     * - duration > 0, the time interval between AMM accounts refetch, recommendation for a UI is 20 seconds
     */
    private routeCacheDuration;
    /** When set to true (default) native SOL is wrapped and wSOL unwrapped in each swap, otherwise it assumes wSOL is funded when it exists */
    private wrapUnwrapSOL;
    private intermediateTokens;
    /** Perform a getProgramAccounts on user's serum open orders. Recomended to turn off if RPC is slow to perform a gPA */
    private shouldLoadSerumOpenOrders;
    private addressLookupTableProvider;
    private serumOpenOrdersPromise;
    private user;
    private routeCache;
    private routeSegmentCache;

    constructor(
        connection: Connection, cluster: Cluster, 
        tokenRouteSegments: TokenRouteSegments, 
        feeCalculator: FeeCalculator, 
        platformFeeAndAccounts: PlatformFeeAndAccounts, 
    /** Referrer account to collect Serum referrer fees for each given quote mint, the referrer fee is 20% of the Serum protocol fee */
    quoteMintToReferrer: QuoteMintToReferrer, 
    /**
     * Controls {@link Jupiter.computeRoutes} accounts caching. The cache is pair dependant. The unit is millisecond
     * - -1, it will not fetch unless shouldFetch === true
     * - 0, it will fetch everytime
     * - duration > 0, the time interval between AMM accounts refetch, recommendation for a UI is 20 seconds
     */
    routeCacheDuration: number, 
    /** When set to true (default) native SOL is wrapped and wSOL unwrapped in each swap, otherwise it assumes wSOL is funded when it exists */
    wrapUnwrapSOL: boolean, intermediateTokens: Set<TokenMintAddress> | undefined, 
    /** Perform a getProgramAccounts on user's serum open orders. Recomended to turn off if RPC is slow to perform a gPA */
    shouldLoadSerumOpenOrders: boolean, addressLookupTableProvider: AddressLookupTableProvider);
    /**
     * load performs the necessary async scaffolding of the Jupiter object
     */
    static load({ connection, cluster, user, platformFeeAndAccounts, quoteMintToReferrer, routeCacheDuration, wrapUnwrapSOL, marketsCache, restrictIntermediateTokens, shouldLoadSerumOpenOrders, ammsToExclude, mintsToExclude, usePreloadedAddressLookupTableCache, }: JupiterLoadParams): Promise<Jupiter>;
    static loadCoreData({ connection, cluster, marketsCache, ammsToExclude, mintsToExclude, usePreloadedAddressLookupTableCache, }: {
        connection: Connection;
        cluster: Cluster;
        marketsCache?: {
            url: string;
        } | MarketsCache;
        ammsToExclude?: SingleLevelAmmValidator;
        mintsToExclude?: PublicKey[];
        usePreloadedAddressLookupTableCache?: boolean;
    }): Promise<{
        tokenRouteSegments: TokenRouteSegments;
        addressLookupTableProvider: AddressLookupTableProvider;
        saberWrapperMints: string[];
    }>;

    getAccountToAmmIdsMap(): Map<string, Set<string>>;

    getAmmIdToAmmMap(): Map<string, Amm>;

    getDepositAndFees: ({ marketInfos, userPublicKey, serumOpenOrdersPromise, }: {
        marketInfos: MarketInfo[];
        userPublicKey: PublicKey;
        serumOpenOrdersPromise?: Promise<SerumOpenOrdersMap> | undefined;
    }) => Promise<import("@jup-ag/common").TransactionFeeInfo>;
    private getDepositAndFeesForUser;

    computeRoutes({ inputMint, outputMint, amount, slippageBps, feeBps, forceFetch, onlyDirectRoutes, swapMode, filterTopNResult, asLegacyTransaction, }: {
        inputMint: PublicKey;
        outputMint: PublicKey;
        amount: JSBI;
        slippageBps: number;
        feeBps?: number;
        /**
         * Forces fetching, invalidates the route cache
         */
        forceFetch?: boolean;
        onlyDirectRoutes?: boolean;
        swapMode?: SwapMode;
        asLegacyTransaction?: boolean;
        /**
         * filter how many top individual route to be used to compared
         */
        filterTopNResult?: number;
    }): Promise<{
        routesInfos: RouteInfo[];
        cached: boolean;
    }>;

    setUserPublicKey(userPublicKey: Keypair | PublicKey): void;

    static fetchAmms(connection: Connection, marketsCache: MarketsCache, ammsToExclude?: SingleLevelAmmValidator, mintsToExclude?: PublicKey[], usePreloadedAddressLookupTableCache?: boolean): Promise<{
        amms: Amm[];
        saberWrapperMints: string[];
        addressLookupTableProvider: AddressLookupTableProvider;
    }>;
    /**
     * This generate a routeMap which represents every possible output token mint for a given input token mint.
     * For example, we have SOL to USDC and this pairs have many routings like
     * SOL => USDT
     * USDT => USDC
     * SOL => USDC
     *
     * From here we know that we can have 2 different routing of SOL => USDC.
     * We do single level routing map but for all coins which result in the route map below:
     * SOL => USDT, USDC
     * USDT => SOL
     * USDC => SOL, USDT
     *
     * From this route map we can map out all possible route from one to another by checking the intersection.
     */
    getRouteMap(onlyDirectRoutes?: boolean, asLegacyTransaction?: boolean): Map<string, string[]>;

    static getRemoteRouteMap: typeof getRemoteRouteMap;
    /**
     * Query existing open order account, this query is slow.
     * We suggest to fetch this in the background.
     */
    static findSerumOpenOrdersForOwner: ({ userPublicKey, cluster, connection, }: {
        userPublicKey: PublicKey;
        cluster: Cluster;
        connection: Connection;
    }) => Promise<SerumOpenOrdersMap>;
    exchange: (params: {
        routeInfo: RouteInfo;
        /**
         * This will overwrite the default Jupiter.setUser, useful for stateless usage like API
         */
        userPublicKey?: PublicKey;
        /**
         * This will overwrite the default fee account, useful for stateless usage like API
         */
        feeAccount?: PublicKey;
        /**
         * This will overwrite the default wrapUnwrapSOL, useful for stateless usage like API
         */
        wrapUnwrapSOL?: boolean;
        /**
         * The transaction will use the blockhash and valid blockheight to create transaction
         */
        blockhashWithExpiryBlockHeight?: BlockhashWithExpiryBlockHeight;
        /**
         * Produces a legacy transaction
         */
        asLegacyTransaction?: boolean;
        /**
         * compute unit price in micro lamports, the swap transaction will cost consumed compute units * computeUnitPriceMicroLamports, see https://docs.solana.com/developing/programming-model/runtime#prioritization-fees
         */
        computeUnitPriceMicroLamports?: number;
    }) => Promise<{
        swapTransaction: Transaction | VersionedTransaction;
        addressLookupTableAccounts: AddressLookupTableAccount[];
        execute: (params?: ExecuteParams) => Promise<SwapResult>;
    }>;
    
    static getIntermediateTokens(saberWrapperMints: string[]): Promise<string[]>;
}
