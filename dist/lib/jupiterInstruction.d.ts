import { Market } from '@project-serum/serum';
import { AccountMeta, PublicKey, TransactionInstruction } from '@solana/web3.js';
import BN from 'bn.js';
import type { RaydiumAmm } from './amms';
import { StableSwap } from '@saberhq/stableswap-sdk';
import { PlatformFee } from '@jup-ag/common';
import { AldrinPoolState } from './amms/aldrin/poolState';
import type { TokenSwapState } from './amms/spl-token-swap/tokenSwapLayout';
import type { WrappedToken } from './amms/saber/saberAddDecimalsAmm';
import { CropperPoolState } from './amms/cropper/swapLayout';
import { SenchaPoolState } from './amms/sencha/swapLayout';
import { MercurialSwapLayoutState } from './amms/mercurial/swapLayout';
import { LifinitySwapLayoutState } from './amms/lifinity/swapLayout';
import type { AmmState as LifinityAmmState } from './amms/lifinity/lifinityV2Amm';
import { MarinadeStateResponse } from './amms/marinade/marinade-state.types';
import { SwapLegType } from './jupiterEnums';
import { SwapLegAndAccounts } from './amm';
import { FundState, TokenInfoData } from './amms/symmetry/types';

export declare function createRoutesSwapInstruction(userTransferAuthority: PublicKey, destinationTokenAccount: PublicKey, swapLeg: SwapLegType, accounts: AccountMeta[], amount: BN, quotedOutAmount: BN, slippageBps: number, platformFeeBps: number): TransactionInstruction;

interface CreateSwapInstructionParams {
    sourceMint: PublicKey;
    destinationMint: PublicKey;
    userSourceTokenAccount: PublicKey;
    userDestinationTokenAccount: PublicKey;
    userTransferAuthority: PublicKey;
}

interface CreateSwapExactOutputInstructionParams extends CreateSwapInstructionParams {
    /** inAmount for slippage tolerance */
    inAmount: BN;
    /** outAmount, the exact output */
    outAmount: BN;
    slippageBps: number;
    platformFee?: PlatformFee;
    overflowFeeAccount?: PublicKey;
}

export declare function createMercurialSwapLegAndAccounts({ swapLayout, userSourceTokenAccount, userDestinationTokenAccount, userTransferAuthority, }: {
    swapLayout: MercurialSwapLayoutState;
} & CreateSwapInstructionParams): SwapLegAndAccounts;

export declare function createSerumSwapLegAndAccounts({ market, sourceMint, openOrdersAddress, userSourceTokenAccount, userDestinationTokenAccount, userTransferAuthority, referrer, isOpenbook, }: {
    market: Market;
    openOrdersAddress: PublicKey;
    referrer: PublicKey | undefined;
    isOpenbook: boolean;
} & CreateSwapInstructionParams): SwapLegAndAccounts;

export declare function createTokenSwapLegAndAccounts({ tokenSwapState, sourceMint, userSourceTokenAccount, userDestinationTokenAccount, userTransferAuthority, isStep, }: {
    tokenSwapState: TokenSwapState;
    isStep: boolean;
} & CreateSwapInstructionParams): SwapLegAndAccounts;

export declare function createSenchaSwapLegAndAccounts({ poolState, sourceMint, userSourceTokenAccount, userDestinationTokenAccount, userTransferAuthority, }: {
    poolState: SenchaPoolState;
} & CreateSwapInstructionParams): SwapLegAndAccounts;

export declare function createCropperSwapLegAndAccounts({ poolState, feeAccount, sourceMint, userSourceTokenAccount, userDestinationTokenAccount, userTransferAuthority, }: {
    poolState: CropperPoolState;
    feeAccount: PublicKey;
} & CreateSwapInstructionParams): SwapLegAndAccounts;

export declare function createRaydiumSwapLegAndAccounts({ raydiumAmm, userSourceTokenAccount, userDestinationTokenAccount, userTransferAuthority, }: {
    raydiumAmm: RaydiumAmm;
} & CreateSwapInstructionParams): SwapLegAndAccounts;

export declare function createRaydiumSwapExactOutputInstruction({ raydiumAmm, userSourceTokenAccount, userDestinationTokenAccount, userTransferAuthority, outAmount, inAmount, slippageBps, platformFee, overflowFeeAccount, }: {
    raydiumAmm: RaydiumAmm;
} & CreateSwapExactOutputInstructionParams): TransactionInstruction;

export declare function createAldrinSwapLegAndAccounts({ poolState, sourceMint, userSourceTokenAccount, userDestinationTokenAccount, userTransferAuthority, }: {
    poolState: AldrinPoolState;
} & CreateSwapInstructionParams): SwapLegAndAccounts;

export declare function createAldrinV2SwapLegAndAccounts({ poolState, sourceMint, userSourceTokenAccount, userDestinationTokenAccount, curve, userTransferAuthority, }: {
    poolState: AldrinPoolState;
    curve: PublicKey;
} & CreateSwapInstructionParams): SwapLegAndAccounts;

export declare function createSaberSwapLegAndAccounts({ stableSwap, sourceMint, userSourceTokenAccount, userDestinationTokenAccount, userTransferAuthority, }: {
    stableSwap: StableSwap;
} & CreateSwapInstructionParams): SwapLegAndAccounts;

export declare function createSaberAddDecimalsSwapLegAndAccounts({ wrapper, wrappedToken, userSourceTokenAccount, userDestinationTokenAccount, userTransferAuthority, deposit, }: {
    wrapper: PublicKey;
    wrappedToken: WrappedToken;
    deposit: boolean;
} & CreateSwapInstructionParams): SwapLegAndAccounts;

export declare function createLifinitySwapLegAndAccounts({ swapState, sourceMint, userSourceTokenAccount, userDestinationTokenAccount, userTransferAuthority, }: {
    swapState: LifinitySwapLayoutState;
} & CreateSwapInstructionParams): SwapLegAndAccounts;

export declare function createLifinityV2SwapLegAndAccounts({ ammState, amm, sourceMint, userSourceTokenAccount, userDestinationTokenAccount, userTransferAuthority, }: {
    ammState: LifinityAmmState;
    amm: PublicKey;
} & CreateSwapInstructionParams): SwapLegAndAccounts;

type CykuraSwapInstructionArgs = {
    poolAddress: PublicKey;
    inputVault: PublicKey;
    outputVault: PublicKey;
    nextObservationState: PublicKey;
    lastObservationState: PublicKey;
    swapAccountMetas: AccountMeta[];
};

export declare function createCykuraSwapLegAndAccounts({ additionalArgs, userSourceTokenAccount, userDestinationTokenAccount, userTransferAuthority, }: {
    additionalArgs: CykuraSwapInstructionArgs;
} & CreateSwapInstructionParams): SwapLegAndAccounts;


type WhirlpoolSwapInstructionArgs = {
    aToB: boolean;
    whirlpool: PublicKey;
    tokenVaultA: PublicKey;
    tokenVaultB: PublicKey;
    tickArray0: PublicKey;
    tickArray1: PublicKey;
    tickArray2: PublicKey;
    oracle: PublicKey;
};

export declare function createWhirlpoolSwapLegAndAccounts({ additionalArgs, userSourceTokenAccount, userDestinationTokenAccount, userTransferAuthority, }: {
    additionalArgs: WhirlpoolSwapInstructionArgs;
} & CreateSwapInstructionParams): SwapLegAndAccounts;

type MarinadeFinanceDepositInstructionArgs = {
    address: PublicKey;
    marinadeStateResponse: MarinadeStateResponse;
    liqPoolSolLegPda: PublicKey;
    liqPoolMsolLegAuthority: PublicKey;
    reservePda: PublicKey;
    msolMintAuthority: PublicKey;
};

export declare function createMarinadeDepositSwapLegAndAccounts({ additionalArgs, userSourceTokenAccount, userDestinationTokenAccount, userTransferAuthority, }: {
    additionalArgs: MarinadeFinanceDepositInstructionArgs;
} & CreateSwapInstructionParams): SwapLegAndAccounts;

type MarinadeFinanceLiquidUnstakeInstructionArgs = {
    address: PublicKey;
    marinadeStateResponse: MarinadeStateResponse;
    liqPoolSolLegPda: PublicKey;
};

export declare function createMarinadeUnstakeSwapLegAndAccounts({ additionalArgs, userSourceTokenAccount, userDestinationTokenAccount, userTransferAuthority, }: {
    additionalArgs: MarinadeFinanceLiquidUnstakeInstructionArgs;
} & CreateSwapInstructionParams): SwapLegAndAccounts;

type InvariantSwapInstructionArgs = {
    xToY: boolean;
    pool: PublicKey;
    tickmap: PublicKey;
    reserveX: PublicKey;
    reserveY: PublicKey;
    crossedTickAddresses: PublicKey[];
    referrer?: PublicKey;
};

export declare function createInvariantSwapLegAndAccounts({ additionalArgs, userSourceTokenAccount, userDestinationTokenAccount, userTransferAuthority, }: {
    additionalArgs: InvariantSwapInstructionArgs;
} & CreateSwapInstructionParams): SwapLegAndAccounts;

type MeteoraSwapInstructionArgs = {
    pool: PublicKey;
    aVault: PublicKey;
    bVault: PublicKey;
    aTokenVault: PublicKey;
    bTokenVault: PublicKey;
    aVaultLpMint: PublicKey;
    bVaultLpMint: PublicKey;
    aVaultLp: PublicKey;
    bVaultLp: PublicKey;
    adminTokenFee: PublicKey;
    referrer?: PublicKey;
    depeg?: PublicKey;
};

export declare function createMeteoraSwapLegAndAccounts({ additionalArgs, userSourceTokenAccount, userDestinationTokenAccount, userTransferAuthority, }: {
    additionalArgs: MeteoraSwapInstructionArgs;
} & CreateSwapInstructionParams): SwapLegAndAccounts;

type GooseFxSwapInstructionArgs = {
    pair: PublicKey;
    sslIn: PublicKey;
    sslOut: PublicKey;
    liabilityVaultIn: PublicKey;
    swappedLiabilityVaultIn: PublicKey;
    liabilityVaultOut: PublicKey;
    swappedLiabilityVaultOut: PublicKey;
    feeCollectorAta: PublicKey;
    feeCollector: PublicKey;
    oracles: PublicKey[];
    referrer?: PublicKey;
};

export declare function createGooseFxSwapLegAndAccounts({ additionalArgs, userSourceTokenAccount, userDestinationTokenAccount, userTransferAuthority, }: {
    additionalArgs: GooseFxSwapInstructionArgs;
} & CreateSwapInstructionParams): SwapLegAndAccounts;

type DeltaFiSwapInstructionArgs = {
    stable: boolean;
    marketConfig: PublicKey;
    swapInfo: PublicKey;
    swapSourceToken: PublicKey;
    swapDestinationToken: PublicKey;
    adminDestinationToken: PublicKey;
    pythPriceBase: PublicKey;
    pythPriceQuote: PublicKey;
    referrer?: PublicKey;
};

export declare function createDeltaFiSwapLegAndAccounts({ additionalArgs, userSourceTokenAccount, userDestinationTokenAccount, userTransferAuthority, }: {
    additionalArgs: DeltaFiSwapInstructionArgs;
} & CreateSwapInstructionParams): SwapLegAndAccounts;

type BalansolSwapInstructionArgs = {
    pool: PublicKey;
    taxMan: PublicKey;
    treasurer: PublicKey;
    srcTreasury: PublicKey;
    dstTreasury: PublicKey;
    dstTokenAccountTaxman: PublicKey;
    referrer?: PublicKey;
};

export declare function createBalansolSwapLegAndAccounts({ additionalArgs, userSourceTokenAccount, userDestinationTokenAccount, userTransferAuthority, sourceMint, destinationMint, }: {
    additionalArgs: BalansolSwapInstructionArgs;
} & CreateSwapInstructionParams): SwapLegAndAccounts;

type DradexSwapInstructionArgs = {
    pair: PublicKey;
    market: PublicKey;
    eventQueue: PublicKey;
    marketUser: PublicKey;
    bids: PublicKey;
    asks: PublicKey;
    t0: PublicKey;
    t1: PublicKey;
    t0Vault: PublicKey;
    t1Vault: PublicKey;
    referrer?: PublicKey;
};

export declare function createDradexSwapLegAndAccounts({ additionalArgs, userSourceTokenAccount, userDestinationTokenAccount, userTransferAuthority, sourceMint, }: {
    additionalArgs: DradexSwapInstructionArgs;
} & CreateSwapInstructionParams): SwapLegAndAccounts;

type CremaSwapInstructionArgs = {
    clmmConfig: PublicKey;
    clmmpool: PublicKey;
    tokenA: PublicKey;
    tokenB: PublicKey;
    tokenAVault: PublicKey;
    tokenBVault: PublicKey;
    tickArrayMap: PublicKey;
    remainingAccounts: PublicKey[];
};

export declare function createCremaSwapLegAndAccounts({ additionalArgs, userSourceTokenAccount, userDestinationTokenAccount, userTransferAuthority, sourceMint, }: {
    additionalArgs: CremaSwapInstructionArgs;
} & CreateSwapInstructionParams): SwapLegAndAccounts;

type MarcoPoloSwapInstructionArgs = {
    pool: PublicKey;
    tokenX: PublicKey;
    tokenY: PublicKey;
    poolXAccount: PublicKey;
    poolYAccount: PublicKey;
    referrerXAccount: PublicKey;
    referrerYAccount: PublicKey;
    referrer: PublicKey;
    isBonkSwap: boolean;
};

export declare function createMarcoPoloSwapLegAndAccounts({ additionalArgs, userSourceTokenAccount, userDestinationTokenAccount, userTransferAuthority, sourceMint, }: {
    additionalArgs: MarcoPoloSwapInstructionArgs;
} & CreateSwapInstructionParams): SwapLegAndAccounts;

export declare function createWhirlpoolSwapExactOutputInstruction({ additionalArgs, userSourceTokenAccount, userDestinationTokenAccount, userTransferAuthority, outAmount, inAmount, slippageBps, platformFee, overflowFeeAccount, }: {
    additionalArgs: WhirlpoolSwapInstructionArgs;
} & CreateSwapExactOutputInstructionParams): TransactionInstruction;

type RaydiumClmmInstructionArgs = {
    ammConfig: PublicKey;
    poolState: PublicKey;
    inputVault: PublicKey;
    outputVault: PublicKey;
    observationState: PublicKey;
    tickArray: PublicKey;
    remainingAccounts: PublicKey[];
};

export declare function createRaydiumClmmSwapLegAndAccounts({ additionalArgs, userSourceTokenAccount, userDestinationTokenAccount, userTransferAuthority, }: {
    additionalArgs: RaydiumClmmInstructionArgs;
} & CreateSwapInstructionParams): SwapLegAndAccounts;

type PhoenixInstructionArgs = {
    logAuthority: PublicKey;
    market: PublicKey;
    baseVault: PublicKey;
    quoteVault: PublicKey;
    baseMint: PublicKey;
};

export declare function createPhoenixSwapLegAndAccounts({ additionalArgs, sourceMint, userSourceTokenAccount, userDestinationTokenAccount, userTransferAuthority, }: {
    additionalArgs: PhoenixInstructionArgs;
} & CreateSwapInstructionParams): SwapLegAndAccounts;

type SymmetryInstructionArgs = {
    tokenInfos: TokenInfoData[];
    fundAddress: PublicKey;
    fundState: FundState;
};

export declare function createSymmetrySwapLegAndAccounts({ additionalArgs, sourceMint, destinationMint, userSourceTokenAccount, userDestinationTokenAccount, userTransferAuthority, }: {
    additionalArgs: SymmetryInstructionArgs;
} & CreateSwapInstructionParams): SwapLegAndAccounts;

export declare function createRaydiumClmmSwapExactOutputInstruction({ additionalArgs, userSourceTokenAccount, userDestinationTokenAccount, userTransferAuthority, outAmount, inAmount, slippageBps, platformFee, overflowFeeAccount, }: {
    additionalArgs: RaydiumClmmInstructionArgs;
} & CreateSwapExactOutputInstructionParams): TransactionInstruction;

export declare function createOpenOrdersInstruction(serumMarket: PublicKey, serumProgramId: PublicKey, userTransferAuthority: PublicKey): [PublicKey, TransactionInstruction];
export {};
