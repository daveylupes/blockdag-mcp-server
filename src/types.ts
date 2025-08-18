import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { PublicClient } from 'viem';
import { CallToolRequestSchema, CallToolResultSchema, ListToolsRequestSchema, ListToolsResultSchema, ToolSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

// Tool registration function type
export interface ToolContext {
  server: Server;
  client: PublicClient;
}

export type ToolRegistration = (context: ToolContext) => void;

// Tool definition interface
export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: z.ZodSchema;
}

// Common error response structure
export interface ErrorResponse {
  error: {
    message: string;
    cause?: string;
  };
}

// Common success response structure
export interface SuccessResponse<T = any> {
  data: T;
}

// Enhanced error types
export interface DetailedErrorResponse extends ErrorResponse {
  error: {
    message: string;
    cause?: string;
    code?: string;
    details?: Record<string, any>;
  };
}

// Helper function to create detailed error response
export function createDetailedErrorResponse(
  message: string, 
  code?: string, 
  cause?: string, 
  details?: Record<string, any>
): DetailedErrorResponse {
  return {
    error: {
      message,
      ...(code && { code }),
      ...(cause && { cause }),
      ...(details && { details }),
    },
  };
}

// Helper function to create error response (backward compatibility)
export function createErrorResponse(message: string, cause?: string): ErrorResponse {
  return createDetailedErrorResponse(message, undefined, cause);
}

// Helper function to create success response
export function createSuccessResponse<T>(data: T): SuccessResponse<T> {
  return { data };
}

// Helper function to create MCP tool result
export function createToolResult(content: string) {
  return {
    content: [
      {
        type: 'text' as const,
        text: content,
      },
    ],
  };
}

// Error codes for better error handling
export const ERROR_CODES = {
  INVALID_INPUT: 'INVALID_INPUT',
  RPC_ERROR: 'RPC_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  CONTRACT_ERROR: 'CONTRACT_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

// Helper function to handle and normalize errors
export function handleError(error: unknown, context: string): DetailedErrorResponse {
  if (error instanceof Error) {
    // Handle specific error types
    if (error.message.includes('Invalid input')) {
      return createDetailedErrorResponse(
        error.message,
        ERROR_CODES.INVALID_INPUT,
        error.stack,
        { context }
      );
    }
    
    if (error.message.includes('RPC') || error.message.includes('network')) {
      return createDetailedErrorResponse(
        `Network error: ${error.message}`,
        ERROR_CODES.RPC_ERROR,
        error.stack,
        { context }
      );
    }
    
    if (error.message.includes('contract') || error.message.includes('ABI')) {
      return createDetailedErrorResponse(
        `Contract error: ${error.message}`,
        ERROR_CODES.CONTRACT_ERROR,
        error.stack,
        { context }
      );
    }
    
    return createDetailedErrorResponse(
      error.message,
      ERROR_CODES.UNKNOWN_ERROR,
      error.stack,
      { context }
    );
  }
  
  return createDetailedErrorResponse(
    'An unexpected error occurred',
    ERROR_CODES.UNKNOWN_ERROR,
    undefined,
    { context, originalError: String(error) }
  );
}
