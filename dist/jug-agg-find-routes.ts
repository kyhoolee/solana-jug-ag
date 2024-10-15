async function findBestRoute({
    inputRouteSegment: routeMap,
    inputMint: inputTokenMint,
    outputMint: outputTokenMint,
    amount: tradeAmount,
    getDepositAndFeeForRoute: calculateFees,
    platformFeeBps: platformFeeBasisPoints,
    slippageBps: slippageBasisPoints,
    filterTopNResult: topNResults = 1,
    onlyDirectRoutes: directRoutesOnly,
    swapMode: swapMode,
    asLegacyTransaction: useLegacyTransaction,
}) {
    const inputMintStr = inputTokenMint.toBase58(),
        outputMintStr = outputTokenMint.toBase58();

    if (!routeMap.get(inputMintStr)) {
        throw new Error("No routes found for the input and output mints");
    }

    const maxRouteLevel = directRoutesOnly || swapMode === exports.SwapMode.ExactOut ? 1 : useLegacyTransaction ? 2 : 3;
    const quoteMapByRoute = new Map();
    const validRoutes = [];
    const maxOutAmountMap = new Map();

    // Separate exploreRoutes function
    const exploreRoutes = ({ startMint, amount, level = 1, walked = [startMint] }) => {
        const availableRoutes = routeMap.get(startMint);

        if (availableRoutes) {
            availableRoutes.forEach((ammInfo, nextMint) => {
                const routeKey = createRouteKey({ inputMint: startMint, outputMint: nextMint });
                
                const quotesForAmms = getQuotesForAmms({
                    amms: ammInfo,
                    inputMint: startMint,
                    outputMint: nextMint,
                    amount,
                    swapMode,
                });

                const { filteredAmms, quoteMap } = quotesForAmms.reduce(
                    (acc, { amm, quote }) => {
                        if (acc.filteredAmms.length < topNResults) acc.filteredAmms.push(amm);
                        acc.quoteMap.set(createRouteKey({ ammId: amm.id, amount }), quote);
                        return acc;
                    },
                    { filteredAmms: [], quoteMap: new Map() }
                );

                if (level === 1 && nextMint === outputMintStr) {
                    availableRoutes.set(nextMint, ammInfo);
                }

                if (nextMint !== outputMintStr && quoteMap.size && !walked.includes(nextMint) && level < maxRouteLevel) {
                    const outAmount = quoteMap.values().next().value.outAmount;
                    const maxOutAmount = maxOutAmountMap.get(nextMint) || 0;

                    if (outAmount > maxOutAmount) {
                        maxOutAmountMap.set(nextMint, outAmount);
                        exploreRoutes({
                            startMint: nextMint,
                            amount: outAmount,
                            level: level + 1,
                            walked: walked.concat(nextMint),
                        });
                    }
                } else if (nextMint === outputMintStr) {
                    const routeMints = walked.concat(nextMint);
                    const mintPublicKeys = routeMints.map((mint) => new e.PublicKey(mint));

                    const ammsByLeg = routeMints.reduce((legs, mint, i) => {
                        if (i < routeMints.length - 1) {
                            legs.push(routeMap.get(routeMints[i]).get(routeMints[i + 1]));
                        }
                        return legs;
                    }, []);

                    const validCombinations = cartesianProduct(ammsByLeg);

                    for (let amms of validCombinations) {
                        if (amms.length === 1 || validateSplitTransaction(amms, useLegacyTransaction)) {
                            validRoutes.push({ amms, mints: mintPublicKeys });
                        }
                    }
                }

                availableRoutes.set(nextMint, filteredAmms);
                quoteMapByRoute.set(routeKey, quoteMap);
            });
        }
    };

    exploreRoutes({ startMint: inputMintStr, amount: tradeAmount });

    return validRoutes
        .map((route) => {
            const { amms, mints } = route;
            let marketInfos = [];
            let currentAmount = tradeAmount;
            let otherAmountThreshold = 0;

            const numLegs = amms.length;

            for (const [index, amm] of amms.entries()) {
                try {
                    const inputMint = mints[index];
                    const outputMint = mints[index + 1];
                    const routeKey = createRouteKey({ inputMint: inputMint.toBase58(), outputMint: outputMint.toBase58() });

                    const cachedQuote = quoteMapByRoute.get(routeKey)?.get(createRouteKey({ ammId: amm.id, amount: currentAmount }));

                    if (currentAmount === 0) return;

                    const quote = cachedQuote || amm.getQuote({
                        sourceMint: inputMint,
                        destinationMint: outputMint,
                        amount: currentAmount,
                        swapMode,
                    });

                    const platformFee = calculatePlatformFee({
                        quote,
                        sourceMint: inputMint,
                        destinationMint: outputMint,
                        swapMode,
                        legIndex: index,
                        isLastLeg: numLegs - 1 === index,
                        platformFeeBps: platformFeeBasisPoints,
                    });

                    const nextAmount = swapMode === exports.SwapMode.ExactIn ? quote.outAmount : quote.inAmount;

                    let adjustedAmount = swapMode === exports.SwapMode.ExactIn
                        ? nextAmount - platformFee.amount
                        : nextAmount + platformFee.amount;

                    if (adjustedAmount < 0) adjustedAmount = 0;

                    const finalAmount = Math.floor(adjustedAmount * (1 - slippageBasisPoints / 10000));

                    marketInfos.push({
                        amm,
                        inputMint,
                        outputMint,
                        notEnoughLiquidity: quote.notEnoughLiquidity,
                        minInAmount: quote.minInAmount,
                        minOutAmount: quote.minOutAmount,
                        inAmount: swapMode === exports.SwapMode.ExactIn ? quote.inAmount : adjustedAmount,
                        outAmount: swapMode === exports.SwapMode.ExactIn ? adjustedAmount : currentAmount,
                        priceImpactPct: quote.priceImpactPct,
                        lpFee: { amount: quote.feeAmount, mint: quote.feeMint, pct: quote.feePct },
                        platformFee,
                    });

                    currentAmount = swapMode === exports.SwapMode.ExactIn ? adjustedAmount : tradeAmount;
                    otherAmountThreshold = finalAmount;
                } catch (error) {
                    return;
                }
            }

            return {
                marketInfos,
                getDepositAndFee: () => calculateFees({ marketInfos }),
                inAmount: marketInfos[0].inAmount,
                outAmount: currentAmount,
                amount: tradeAmount,
                otherAmountThreshold,
                swapMode,
                slippageBps: slippageBasisPoints,
                priceImpactPct: 1 - marketInfos.reduce((acc, info) => acc * (1 - info.priceImpactPct), 1),
            };
        })
        .filter(Boolean)
        .sort((a, b) => compareQuotes(a, b, swapMode));
}

// Extracted function for getting quotes for AMMs
function getQuotesForAmms({ amms, inputMint, outputMint, amount, swapMode }) {
    return amms
        .map((amm) => {
            try {
                return {
                    quote: amm.getQuote({
                        amount,
                        sourceMint: new e.PublicKey(inputMint),
                        destinationMint: new e.PublicKey(outputMint),
                        swapMode,
                    }),
                    amm,
                };
            } catch (e) {
                return;
            }
        })
        .filter(Boolean)
        .sort((a, b) => compareQuotes(a.quote, b.quote, swapMode));
}
