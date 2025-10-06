import { config } from 'dotenv';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createPublicClient, http } from 'viem';
import { blockdag } from './chain.js';
import { CallToolRequestSchema, ListToolsRequestSchema, ToolSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { 
  ToolContext, 
  createErrorResponse, 
  createSuccessResponse, 
  createToolResult, 
  handleError, 
  ERROR_CODES 
} from './types.js';

// Load environment variables first
config();

// Define all tools
const tools = [
  {
    name: 'net_info',
    description: 'Get network information including chain ID and latest block number',
    inputSchema: z.object({}),
  },
  {
    name: 'get_balance',
    description: 'Get BDAG balance for a given address in both wei and human-readable format',
    inputSchema: z.object({
      address: z.string().regex(/^0x[0-9a-fA-F]{40}$/, 'Invalid Ethereum address format'),
    }),
  },
  {
    name: 'tx_receipt',
    description: 'Get transaction receipt by hash',
    inputSchema: z.object({
      hash: z.string().regex(/^0x[0-9a-fA-F]{64}$/, 'Invalid transaction hash format'),
    }),
  },
  {
    name: 'get_block',
    description: 'Fetch a block by tag (latest, hex, or decimal)',
    inputSchema: z.object({
      tag: z.string().optional().default('latest'),
    }),
  },
  {
    name: 'get_logs',
    description: 'Retrieve event logs with optional filtering',
    inputSchema: z.object({
      address: z.string().regex(/^0x[0-9a-fA-F]{40}$/, 'Invalid address format').optional(),
      topic0: z.string().regex(/^0x[0-9a-fA-F]{64}$/, 'Invalid topic0 format').optional(),
      fromBlock: z.string().optional().default('0x0'),
      toBlock: z.string().optional().default('latest'),
    }),
  },
  {
    name: 'read_contract',
    description: 'Perform read-only contract calls',
    inputSchema: z.object({
      address: z.string().regex(/^0x[0-9a-fA-F]{40}$/, 'Invalid contract address format'),
      abi: z.string().min(1, 'ABI is required'),
      functionName: z.string().min(1, 'Function name is required'),
      args: z.array(z.any()).optional(),
    }),
  },
  {
    name: 'get_token_balance',
    description: 'Get ERC20 token balance and metadata for an address',
    inputSchema: z.object({
      address: z.string().regex(/^0x[0-9a-fA-F]{40}$/, 'Invalid wallet address format'),
      tokenAddress: z.string().regex(/^0x[0-9a-fA-F]{40}$/, 'Invalid token contract address format'),
    }),
  },
  {
    name: 'get_token_info',
    description: 'Get ERC20 token metadata (name, symbol, decimals, total supply)',
    inputSchema: z.object({
      tokenAddress: z.string().regex(/^0x[0-9a-fA-F]{40}$/, 'Invalid token contract address format'),
    }),
  },
  {
    name: 'get_transaction_history',
    description: 'Get transaction history for an address with pagination support',
    inputSchema: z.object({
      address: z.string().regex(/^0x[0-9a-fA-F]{40}$/, 'Invalid address format'),
      fromBlock: z.string().optional().default('0x0'),
      toBlock: z.string().optional().default('latest'),
      limit: z.number().min(1).max(100).optional().default(10),
      includeTokenTransfers: z.boolean().optional().default(false),
    }),
  },
  {
    name: 'get_network_stats',
    description: 'Get comprehensive network statistics and metrics including gas prices, block times, and network activity',
    inputSchema: z.object({
      blocks: z.number().min(1).max(1000).optional().default(100),
    }),
  },
];

async function main() {
  try {
    console.error('[MCP] Starting BlockDAG MCP server...');
    console.error('[MCP] Version: 0.1.0');
    console.error('[MCP] Environment:', {
      rpcUrl: process.env.BLOCKDAG_RPC_URL ? 'Configured' : 'Missing',
      chainId: process.env.BLOCKDAG_CHAIN_ID || 'Not set'
    });

    // Create viem public client
    const client = createPublicClient({
      chain: blockdag,
      transport: http(),
    });

    // Test connection
    try {
      console.error('[MCP] Testing BlockDAG connection...');
      await client.getBlockNumber();
      console.error('[MCP] BlockDAG connection successful');
    } catch (connectionError) {
      console.error('[MCP] BlockDAG connection failed:', connectionError);
      throw new Error(`Failed to connect to BlockDAG network: ${connectionError instanceof Error ? connectionError.message : 'Unknown error'}`);
    }

    // Initialize MCP server
    const server = new Server({
      name: 'blockdag-mcp',
      version: '0.1.0',
    });

    // Register tools/list handler
    server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: tools.map(tool => ({
          name: tool.name,
          description: tool.description,
          inputSchema: {
            type: 'object',
            properties: tool.inputSchema.shape,
          },
        })),
      };
    });

    // Register tools/call handler
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      try {
        // Log incoming request
        console.error(`[MCP] Tool call: ${name}`, { args: args || {} });
        
        // Find the tool
        const tool = tools.find(t => t.name === name);
        if (!tool) {
          throw new Error(`Tool '${name}' not found`);
        }

        // Validate input
        let validatedArgs;
        try {
          validatedArgs = tool.inputSchema.parse(args || {});
        } catch (validationError) {
          throw new Error(`Validation error: ${validationError instanceof Error ? validationError.message : 'Invalid input'}`);
        }

        // Execute tool based on name
        let result: any;
        
        switch (name) {
          case 'net_info':
            result = await handleNetInfo(client);
            break;
          case 'get_balance':
            result = await handleGetBalance(client, validatedArgs as { address: string });
            break;
          case 'tx_receipt':
            result = await handleTxReceipt(client, validatedArgs as { hash: string });
            break;
          case 'get_block':
            result = await handleGetBlock(client, validatedArgs as { tag: string });
            break;
          case 'get_logs':
            result = await handleGetLogs(client, validatedArgs as { address?: string; topic0?: string; fromBlock?: string; toBlock?: string });
            break;
          case 'read_contract':
            result = await handleReadContract(client, validatedArgs as { address: string; abi: string; functionName: string; args?: any[] });
            break;
          case 'get_token_balance':
            result = await handleGetTokenBalance(client, validatedArgs as { address: string; tokenAddress: string });
            break;
          case 'get_token_info':
            result = await handleGetTokenInfo(client, validatedArgs as { tokenAddress: string });
            break;
          case 'get_transaction_history':
            result = await handleGetTransactionHistory(client, validatedArgs as { address: string; fromBlock?: string; toBlock?: string; limit?: number; includeTokenTransfers?: boolean });
            break;
          case 'get_network_stats':
            result = await handleGetNetworkStats(client, validatedArgs as { blocks?: number });
            break;
          default:
            throw new Error(`Tool '${name}' not implemented`);
        }

        // Log successful response
        console.error(`[MCP] Tool ${name} completed successfully`);
        
        return createToolResult(JSON.stringify(createSuccessResponse(result), null, 2));
      } catch (error) {
        // Enhanced error handling
        const errorResponse = handleError(error, `tool_call:${name}`);
        
        // Log error details
        console.error(`[MCP] Tool ${name} failed:`, {
          error: errorResponse.error.message,
          code: errorResponse.error.code,
          context: errorResponse.error.details?.context
        });
        
        return createToolResult(JSON.stringify(errorResponse, null, 2));
      }
    });

    // Start server with stdio transport
    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.error('BlockDAG MCP server started successfully');
  } catch (error) {
    console.error('Failed to start BlockDAG MCP server:', error);
    process.exit(1);
  }
}

// Tool handlers
async function handleNetInfo(client: any) {
  try {
    console.error('[MCP] Fetching network information...');
    
    const blockNumber = await client.getBlockNumber();
    const chainIdHex = await client.request({
      method: 'eth_chainId',
    }) as string;
    const chainId = parseInt(chainIdHex, 16).toString();

    console.error('[MCP] Network info retrieved successfully');
    
    return {
      chainId,
      latestBlockNumber: blockNumber.toString(),
    };
  } catch (error) {
    console.error('[MCP] Failed to get network info:', error);
    throw new Error(`Failed to retrieve network information: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleGetBalance(client: any, args: { address: string }) {
  const { address } = args;
  const { formatEther } = await import('viem');
  
  const balanceWei = await client.getBalance({ address: address as `0x${string}` });
  const balanceBdag = formatEther(balanceWei);

  return {
    address,
    wei: balanceWei.toString(),
    bdag: balanceBdag,
  };
}

async function handleTxReceipt(client: any, args: { hash: string }) {
  const { hash } = args;
  const receipt = await client.getTransactionReceipt({ hash: hash as `0x${string}` });
  return receipt;
}

async function handleGetBlock(client: any, args: { tag: string }) {
  const { tag } = args;
  
  let blockTag: string | bigint;
  
  if (tag === 'latest') {
    blockTag = 'latest';
  } else if (tag.startsWith('0x')) {
    blockTag = tag;
  } else {
    const blockNumber = parseInt(tag, 10);
    if (isNaN(blockNumber)) {
      throw new Error('Invalid block tag format. Use "latest", hex (0x...), or decimal number');
    }
    blockTag = BigInt(blockNumber);
  }

  const block = await client.getBlock({ blockTag: blockTag as any });
  return block;
}

async function handleGetLogs(client: any, args: { address?: string; topic0?: string; fromBlock?: string; toBlock?: string }) {
  const { address, topic0, fromBlock, toBlock } = args;

  const filter: any = {
    fromBlock: fromBlock === 'latest' ? 'latest' : BigInt(fromBlock || '0x0'),
    toBlock: toBlock === 'latest' ? 'latest' : BigInt(toBlock || 'latest'),
  };

  if (address) {
    filter.address = address as `0x${string}`;
  }

  if (topic0) {
    filter.topics = [topic0 as `0x${string}`];
  }

  const logs = await client.getLogs(filter);
  return logs;
}

async function handleReadContract(client: any, args: { address: string; abi: string; functionName: string; args?: any[] }) {
  const { address, abi, functionName, args: contractArgs } = args;
  const { parseAbi } = await import('viem');

  let parsedAbi;
  try {
    parsedAbi = parseAbi([abi]);
  } catch (parseError) {
    const parseErrorMessage = parseError instanceof Error ? parseError.message : 'Failed to parse ABI';
    throw new Error(`Invalid ABI format: ${parseErrorMessage}`);
  }

  const result = await client.readContract({
    address: address as `0x${string}`,
    abi: parsedAbi,
    functionName,
    args: contractArgs || [],
  });

  return { result };
}

async function handleGetTokenBalance(client: any, args: { address: string; tokenAddress: string }) {
  const { address, tokenAddress } = args;
  
  try {
    console.error('[MCP] Fetching token balance...');
    
    // Standard ERC20 ABI for balanceOf function
    const erc20BalanceAbi = 'function balanceOf(address) view returns (uint256)';
    const erc20DecimalsAbi = 'function decimals() view returns (uint8)';
    const erc20SymbolAbi = 'function symbol() view returns (string)';
    const erc20NameAbi = 'function name() view returns (string)';
    
    const { parseAbi, formatUnits } = await import('viem');
    
    // Get token balance
    const balanceRaw = await client.readContract({
      address: tokenAddress as `0x${string}`,
      abi: parseAbi([erc20BalanceAbi]),
      functionName: 'balanceOf',
      args: [address],
    });
    
    // Get token decimals
    let decimals = 18; // Default to 18 if decimals() fails
    try {
      decimals = await client.readContract({
        address: tokenAddress as `0x${string}`,
        abi: parseAbi([erc20DecimalsAbi]),
        functionName: 'decimals',
        args: [],
      }) as number;
    } catch {
      console.error('[MCP] Could not fetch decimals, using default 18');
    }
    
    // Get token symbol
    let symbol = 'UNKNOWN';
    try {
      symbol = await client.readContract({
        address: tokenAddress as `0x${string}`,
        abi: parseAbi([erc20SymbolAbi]),
        functionName: 'symbol',
        args: [],
      }) as string;
    } catch {
      console.error('[MCP] Could not fetch symbol');
    }
    
    // Get token name
    let name = 'Unknown Token';
    try {
      name = await client.readContract({
        address: tokenAddress as `0x${string}`,
        abi: parseAbi([erc20NameAbi]),
        functionName: 'name',
        args: [],
      }) as string;
    } catch {
      console.error('[MCP] Could not fetch name');
    }
    
    // Format balance
    const formattedBalance = formatUnits(balanceRaw as bigint, decimals);
    
    console.error('[MCP] Token balance retrieved successfully');
    
    return {
      address,
      tokenAddress,
      tokenName: name,
      tokenSymbol: symbol,
      decimals,
      balanceRaw: (balanceRaw as bigint).toString(),
      balance: formattedBalance,
    };
  } catch (error) {
    console.error('[MCP] Failed to get token balance:', error);
    throw new Error(`Failed to retrieve token balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleGetTokenInfo(client: any, args: { tokenAddress: string }) {
  const { tokenAddress } = args;
  
  try {
    console.error('[MCP] Fetching token information...');
    
    // Standard ERC20 ABI for token info functions
    const erc20DecimalsAbi = 'function decimals() view returns (uint8)';
    const erc20SymbolAbi = 'function symbol() view returns (string)';
    const erc20NameAbi = 'function name() view returns (string)';
    const erc20TotalSupplyAbi = 'function totalSupply() view returns (uint256)';
    
    const { parseAbi, formatUnits } = await import('viem');
    
    // Get token name
    let name = 'Unknown Token';
    try {
      name = await client.readContract({
        address: tokenAddress as `0x${string}`,
        abi: parseAbi([erc20NameAbi]),
        functionName: 'name',
        args: [],
      }) as string;
    } catch {
      console.error('[MCP] Could not fetch name');
    }
    
    // Get token symbol
    let symbol = 'UNKNOWN';
    try {
      symbol = await client.readContract({
        address: tokenAddress as `0x${string}`,
        abi: parseAbi([erc20SymbolAbi]),
        functionName: 'symbol',
        args: [],
      }) as string;
    } catch {
      console.error('[MCP] Could not fetch symbol');
    }
    
    // Get token decimals
    let decimals = 18;
    try {
      decimals = await client.readContract({
        address: tokenAddress as `0x${string}`,
        abi: parseAbi([erc20DecimalsAbi]),
        functionName: 'decimals',
        args: [],
      }) as number;
    } catch {
      console.error('[MCP] Could not fetch decimals, using default 18');
    }
    
    // Get total supply
    let totalSupplyRaw: bigint = BigInt(0);
    let totalSupply = '0';
    try {
      totalSupplyRaw = await client.readContract({
        address: tokenAddress as `0x${string}`,
        abi: parseAbi([erc20TotalSupplyAbi]),
        functionName: 'totalSupply',
        args: [],
      }) as bigint;
      totalSupply = formatUnits(totalSupplyRaw, decimals);
    } catch {
      console.error('[MCP] Could not fetch total supply');
    }
    
    console.error('[MCP] Token information retrieved successfully');
    
    return {
      tokenAddress,
      name,
      symbol,
      decimals,
      totalSupplyRaw: totalSupplyRaw.toString(),
      totalSupply,
    };
  } catch (error) {
    console.error('[MCP] Failed to get token info:', error);
    throw new Error(`Failed to retrieve token information: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleGetTransactionHistory(
  client: any,
  args: { address: string; fromBlock?: string; toBlock?: string; limit?: number; includeTokenTransfers?: boolean }
) {
  const { address, fromBlock, toBlock, limit, includeTokenTransfers } = args;
  
  try {
    console.error('[MCP] Fetching transaction history...');
    
    const { formatEther } = await import('viem');
    
    // Determine block range
    const fromBlockNum = fromBlock === 'latest' ? 'latest' : BigInt(fromBlock || '0x0');
    const toBlockNum = toBlock === 'latest' ? 'latest' : BigInt(toBlock || 'latest');
    
    // Get the latest block number for reference
    const latestBlock = await client.getBlockNumber();
    
    // Calculate actual block range
    const actualToBlock = toBlockNum === 'latest' ? latestBlock : toBlockNum;
    const actualFromBlock = fromBlockNum === 'latest' ? latestBlock : fromBlockNum;
    
    console.error(`[MCP] Scanning blocks ${actualFromBlock} to ${actualToBlock}`);
    
    const transactions: any[] = [];
    const maxLimit = limit || 10;
    
    // Scan blocks for transactions involving this address
    // Note: This is a simplified implementation. In production, you'd use an indexer or block explorer API
    let currentBlock = actualToBlock;
    let scannedBlocks = 0;
    const maxBlocksToScan = 1000; // Prevent infinite loops
    
    while (transactions.length < maxLimit && currentBlock >= actualFromBlock && scannedBlocks < maxBlocksToScan) {
      try {
        const block = await client.getBlock({
          blockNumber: currentBlock,
          includeTransactions: true,
        });
        
        if (block && block.transactions) {
          for (const tx of block.transactions) {
            if (transactions.length >= maxLimit) break;
            
            // Check if transaction involves the address
            if (typeof tx === 'object' && tx !== null) {
              const from = (tx as any).from?.toLowerCase();
              const to = (tx as any).to?.toLowerCase();
              const targetAddress = address.toLowerCase();
              
              if (from === targetAddress || to === targetAddress) {
                const txData = {
                  hash: (tx as any).hash,
                  from: (tx as any).from,
                  to: (tx as any).to,
                  value: (tx as any).value?.toString() || '0',
                  valueInBDAG: formatEther((tx as any).value || BigInt(0)),
                  blockNumber: block.number?.toString(),
                  blockHash: block.hash,
                  timestamp: block.timestamp?.toString(),
                  gasPrice: (tx as any).gasPrice?.toString() || '0',
                  gas: (tx as any).gas?.toString() || '0',
                  nonce: (tx as any).nonce,
                  type: from === targetAddress ? 'sent' : 'received',
                };
                
                transactions.push(txData);
              }
            }
          }
        }
        
        currentBlock = currentBlock - BigInt(1);
        scannedBlocks++;
      } catch (blockError) {
        console.error(`[MCP] Error scanning block ${currentBlock}:`, blockError);
        break;
      }
    }
    
    // Optionally include token transfers
    let tokenTransfers: any[] = [];
    if (includeTokenTransfers) {
      try {
        console.error('[MCP] Fetching token transfers...');
        
        // ERC20 Transfer event signature: Transfer(address,address,uint256)
        const transferEventTopic = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
        
        // Get logs for ERC20 transfers
        // Fix: Use original fromBlock/toBlock values to maintain dynamic behavior with 'latest'
        const logs = await client.getLogs({
          fromBlock: fromBlock || '0x0',
          toBlock: toBlock || 'latest',
          topics: [
            transferEventTopic,
            // Filter for transfers from or to the address
          ],
        });
        
        // Filter logs involving the target address
        for (const log of logs) {
          if (tokenTransfers.length >= maxLimit) break;
          
          const topics = log.topics;
          if (topics && topics.length >= 3) {
            // Extract from and to addresses from topics
            const fromTopic = topics[1]?.toLowerCase();
            const toTopic = topics[2]?.toLowerCase();
            const targetPadded = '0x' + address.slice(2).toLowerCase().padStart(64, '0');
            
            if (fromTopic === targetPadded || toTopic === targetPadded) {
              tokenTransfers.push({
                transactionHash: log.transactionHash,
                address: log.address,
                blockNumber: log.blockNumber?.toString(),
                from: fromTopic,
                to: toTopic,
                value: log.data,
                logIndex: log.logIndex,
              });
            }
          }
        }
        
        console.error(`[MCP] Found ${tokenTransfers.length} token transfers`);
      } catch (tokenError) {
        console.error('[MCP] Error fetching token transfers:', tokenError);
        // Continue without token transfers
      }
    }
    
    console.error(`[MCP] Transaction history retrieved successfully: ${transactions.length} transactions`);
    
    return {
      address,
      fromBlock: actualFromBlock.toString(),
      toBlock: actualToBlock.toString(),
      totalTransactions: transactions.length,
      transactions,
      ...(includeTokenTransfers && { tokenTransfers, totalTokenTransfers: tokenTransfers.length }),
      note: 'This is a simplified implementation. For production use, consider using a block explorer API or indexer for better performance.',
    };
  } catch (error) {
    console.error('[MCP] Failed to get transaction history:', error);
    throw new Error(`Failed to retrieve transaction history: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleGetNetworkStats(client: any, args: { blocks?: number }) {
  const { blocks } = args;
  
  try {
    console.error('[MCP] Fetching network statistics...');
    
    const { formatEther, formatGwei } = await import('viem');
    
    // Get the latest block
    const latestBlock = await client.getBlockNumber();
    const blocksToAnalyze = Math.min(blocks || 100, 1000); // Cap at 1000 blocks
    
    console.error(`[MCP] Analyzing last ${blocksToAnalyze} blocks...`);
    
    // Initialize accumulators
    const blockTimes: number[] = [];
    const gasPrices: bigint[] = [];
    let totalTransactions = 0;
    let totalGasUsed = BigInt(0);
    let totalSize = 0;
    const uniqueAddresses = new Set<string>();
    
    // Get current gas price
    let currentGasPrice = BigInt(0);
    try {
      const gasPriceHex = await client.request({
        method: 'eth_gasPrice',
      }) as string;
      // Fix: Parse hex string to BigInt instead of assuming bigint return type
      currentGasPrice = BigInt(gasPriceHex);
    } catch {
      console.error('[MCP] Could not fetch current gas price');
    }
    
    // Analyze recent blocks
    let previousTimestamp: bigint | undefined;
    
    // Fix: Ensure we don't iterate beyond block 0
    const startBlock = latestBlock - BigInt(blocksToAnalyze - 1);
    const actualStartBlock = startBlock < BigInt(0) ? BigInt(0) : startBlock;
    
    for (let i = 0; i < blocksToAnalyze; i++) {
      try {
        const blockNum = latestBlock - BigInt(i);
        // Fix: Skip if block number would be negative
        if (blockNum < BigInt(0)) break;
        
        const block = await client.getBlock({
          blockNumber: blockNum,
          includeTransactions: true,
        });
        
        if (!block) continue;
        
        // Block time calculation
        if (previousTimestamp && block.timestamp) {
          const timeDiff = Number(previousTimestamp - block.timestamp);
          if (timeDiff > 0) {
            blockTimes.push(timeDiff);
          }
        }
        previousTimestamp = block.timestamp || undefined;
        
        // Transaction count
        const txCount = Array.isArray(block.transactions) ? block.transactions.length : 0;
        totalTransactions += txCount;
        
        // Gas usage
        if (block.gasUsed) {
          totalGasUsed += block.gasUsed;
        }
        
        // Block size
        if (block.size) {
          totalSize += Number(block.size);
        }
        
        // Collect addresses and gas prices from transactions
        if (Array.isArray(block.transactions)) {
          for (const tx of block.transactions) {
            if (typeof tx === 'object' && tx !== null) {
              // Collect unique addresses
              const from = (tx as any).from;
              const to = (tx as any).to;
              if (from) uniqueAddresses.add(from.toLowerCase());
              if (to) uniqueAddresses.add(to.toLowerCase());
              
              // Collect gas prices
              const gasPrice = (tx as any).gasPrice;
              if (gasPrice) {
                gasPrices.push(BigInt(gasPrice));
              }
            }
          }
        }
      } catch (blockError) {
        console.error(`[MCP] Error analyzing block ${latestBlock - BigInt(i)}:`, blockError);
        // Continue with next block
      }
    }
    
    // Calculate statistics
    const avgBlockTime = blockTimes.length > 0 
      ? blockTimes.reduce((a, b) => a + b, 0) / blockTimes.length 
      : 0;
    
    const avgTransactionsPerBlock = blocksToAnalyze > 0 
      ? totalTransactions / blocksToAnalyze 
      : 0;
    
    const avgBlockSize = blocksToAnalyze > 0 
      ? totalSize / blocksToAnalyze 
      : 0;
    
    // Gas price statistics
    let minGasPrice = BigInt(0);
    let maxGasPrice = BigInt(0);
    let avgGasPrice = BigInt(0);
    
    if (gasPrices.length > 0) {
      // Fix: Proper BigInt sorting comparator that handles equality
      gasPrices.sort((a, b) => {
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
      });
      minGasPrice = gasPrices[0] || BigInt(0);
      maxGasPrice = gasPrices[gasPrices.length - 1] || BigInt(0);
      const totalGasPrice = gasPrices.reduce((sum, gp) => sum + gp, BigInt(0));
      // Fix: Safe division with proper BigInt handling
      avgGasPrice = totalGasPrice / BigInt(gasPrices.length);
    }
    
    // Blocks per day estimate
    const blocksPerDay = avgBlockTime > 0 ? Math.floor(86400 / avgBlockTime) : 0;
    
    // Transactions per second estimate
    const tps = avgBlockTime > 0 ? avgTransactionsPerBlock / avgBlockTime : 0;
    
    console.error('[MCP] Network statistics calculated successfully');
    
    return {
      network: {
        chainId: client.chain?.id.toString() || 'unknown',
        latestBlock: latestBlock.toString(),
        blocksAnalyzed: blocksToAnalyze,
      },
      blocks: {
        avgBlockTime: avgBlockTime.toFixed(2) + 's',
        avgBlockTimeSeconds: avgBlockTime,
        blocksPerDay,
        avgBlockSize: `${(avgBlockSize / 1024).toFixed(2)} KB`,
        avgBlockSizeBytes: avgBlockSize,
      },
      transactions: {
        total: totalTransactions,
        avgPerBlock: avgTransactionsPerBlock.toFixed(2),
        estimatedTPS: tps.toFixed(4),
      },
      gas: {
        currentPrice: formatGwei(currentGasPrice) + ' Gwei',
        currentPriceWei: currentGasPrice.toString(),
        avgPrice: formatGwei(avgGasPrice) + ' Gwei',
        avgPriceWei: avgGasPrice.toString(),
        minPrice: formatGwei(minGasPrice) + ' Gwei',
        minPriceWei: minGasPrice.toString(),
        maxPrice: formatGwei(maxGasPrice) + ' Gwei',
        maxPriceWei: maxGasPrice.toString(),
        totalUsed: totalGasUsed.toString(),
      },
      activity: {
        uniqueAddresses: uniqueAddresses.size,
        addressesPerBlock: (uniqueAddresses.size / blocksToAnalyze).toFixed(2),
      },
      timestamp: new Date().toISOString(),
      note: 'Statistics calculated from recent blockchain data. Values are estimates based on sampled blocks.',
    };
  } catch (error) {
    console.error('[MCP] Failed to get network stats:', error);
    throw new Error(`Failed to retrieve network statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.error('Received SIGINT, shutting down gracefully');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

// Start the server
main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
