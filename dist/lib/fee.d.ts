import { Connection, FeeCalculator, PublicKey } from '@solana/web3.js';
import type { SerumOpenOrdersMap } from '..';
import { RouteInfo } from './routes';
import { PlatformFeeAndAccounts, Owner, TransactionFeeInfo } from '@jup-ag/common';

export declare const getDepositAndFeeFromInstructions: (
    { 
        connection, owner, inputMint, marketInfos, feeCalculator, 
        serumOpenOrdersPromise, wrapUnwrapSOL: unwrapSOL, 
    }: {
        connection: Connection;
        owner: Owner;
        inputMint: PublicKey;
        marketInfos: RouteInfo['marketInfos'];
        feeCalculator: FeeCalculator;
        serumOpenOrdersPromise: Promise<SerumOpenOrdersMap>;
        wrapUnwrapSOL: boolean;
    }
) => Promise<TransactionFeeInfo>;

export declare const NO_PLATFORM_FEE: PlatformFeeAndAccounts;

export declare function getPlatformFeeAccounts(
    connection: Connection, feeAccountOwner: PublicKey
): Promise<Map<string, PublicKey>>;
