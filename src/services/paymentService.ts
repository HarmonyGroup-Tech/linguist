export const PaymentService = {
    getGooglePayConfig: (amount: string) => ({
        apiVersion: 2 as const,
        apiVersionMinor: 0 as const,
        allowedPaymentMethods: [
            {
                type: 'CARD' as const,
                parameters: {
                    allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                    allowedCardNetworks: ['AMEX', 'DISCOVER', 'INTERAC', 'JCB', 'MASTERCARD', 'VISA'],
                },
                tokenizationSpecification: {
                    type: 'PAYMENT_GATEWAY',
                    parameters: {
                        gateway: 'example',
                        gatewayMerchantId: 'exampleGatewayMerchantId',
                    },
                },
            },
        ],
        merchantInfo: {
            merchantId: '12345678901234567890',
            merchantName: 'Linguist AI',
        },
        transactionInfo: {
            totalPriceStatus: 'FINAL',
            totalPriceLabel: 'Total',
            totalPrice: amount,
            currencyCode: 'USD',
            countryCode: 'US',
        },
    } as any),

    // In a real production app, this would call a backend function to verify the payment token
    verifyTransaction: async (paymentData: any) => {
        console.log('Payment data received:', paymentData);
        // Simulate backend verification delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true };
    }
};
