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
