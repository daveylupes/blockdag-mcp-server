import { defineChain } from 'viem';

// Load environment variables
const rpcUrl = process.env.BLOCKDAG_RPC_URL;
const chainId = process.env.BLOCKDAG_CHAIN_ID;

// Validate required environment variables
if (!rpcUrl) {
  throw new Error('BLOCKDAG_RPC_URL environment variable is required');
}

if (!chainId) {
  throw new Error('BLOCKDAG_CHAIN_ID environment variable is required');
}

const chainIdNumber = parseInt(chainId, 10);
if (isNaN(chainIdNumber)) {
  throw new Error('BLOCKDAG_CHAIN_ID must be a valid number');
}

// Define the BlockDAG chain configuration
export const blockdag = defineChain({
  id: chainIdNumber,
  name: 'BlockDAG',
  nativeCurrency: {
    name: 'BDAG',
    symbol: 'BDAG',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [rpcUrl],
    },
    public: {
      http: [rpcUrl],
    },
  },
});

export { rpcUrl, chainIdNumber };
