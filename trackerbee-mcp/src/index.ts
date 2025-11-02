#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError
} from '@modelcontextprotocol/sdk/types.js';
import { createClient } from '@supabase/supabase-js';

// Environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Error: SUPABASE_URL and SUPABASE_KEY environment variables are required');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Types
interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'new' | 'planned' | 'building' | 'shipped';
  priority: string | null;
  feedback_count: number;
  unique_user_count?: number;
  is_public: boolean;
  created_at: string;
  scores?: {
    traditional_score: number;
    differentiation_score: number;
    gray_area_score: number;
    quick_win_score: number;
    enterprise_score: number;
    viral_score: number;
    ai_insight?: string;
  };
}

interface Feedback {
  id: string;
  cleaned_transcript: string;
  sentiment?: string;
  created_at: string;
  audio_url?: string;
}

// Server setup
const server = new Server(
  {
    name: 'trackerbee',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool: List all tickets in Building status
async function getBuildingTickets(clientId?: string) {
  let query = supabase
    .from('tickets')
    .select('*')
    .eq('status', 'building')
    .order('created_at', { ascending: false });

  if (clientId) {
    query = query.eq('client_id', clientId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as Ticket[];
}

// Tool: Get ticket details with voice feedback
async function getTicketDetails(ticketId: string) {
  const { data: ticket, error: ticketError } = await supabase
    .from('tickets')
    .select(`
      *,
      feedback:feedback(
        id,
        cleaned_transcript,
        sentiment,
        created_at,
        audio_url
      )
    `)
    .eq('id', ticketId)
    .single();

  if (ticketError) throw ticketError;
  return ticket;
}

// Tool: Get next priority ticket
async function getNextPriorityTicket(clientId?: string, framework: string = 'traditional') {
  let query = supabase
    .from('tickets')
    .select('*')
    .in('status', ['new', 'planned'])
    .order('created_at', { ascending: false });

  if (clientId) {
    query = query.eq('client_id', clientId);
  }

  const { data, error } = await query;
  if (error) throw error;

  const tickets = data as Ticket[];
  if (tickets.length === 0) return null;

  // Sort by framework score
  const scoreKey = `${framework}_score` as keyof Ticket['scores'];
  const sorted = tickets.sort((a, b) => {
    const aScore = a.scores?.[scoreKey] || 0;
    const bScore = b.scores?.[scoreKey] || 0;
    return (bScore as number) - (aScore as number);
  });

  return sorted[0];
}

// Tool: List all tickets by status
async function listTicketsByStatus(status: string, clientId?: string) {
  let query = supabase
    .from('tickets')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (clientId) {
    query = query.eq('client_id', clientId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Ticket[];
}

// Tool: Search tickets by keyword
async function searchTickets(keyword: string, clientId?: string) {
  let query = supabase
    .from('tickets')
    .select('*')
    .or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%`)
    .order('created_at', { ascending: false });

  if (clientId) {
    query = query.eq('client_id', clientId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Ticket[];
}

// Tool: Get recent tickets (created in last X hours)
async function getRecentTickets(hoursAgo: number = 24, clientId?: string) {
  const since = new Date();
  since.setHours(since.getHours() - hoursAgo);
  
  let query = supabase
    .from('tickets')
    .select('*')
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false });

  if (clientId) {
    query = query.eq('client_id', clientId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Ticket[];
}

// Tool: Update ticket status
async function updateTicketStatus(ticketId: string, status: string) {
  const { data, error } = await supabase
    .from('tickets')
    .update({ 
      status, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', ticketId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Tool: Mark ticket as shipped
async function markShipped(ticketId: string, notes?: string) {
  const updates: any = {
    status: 'shipped',
    updated_at: new Date().toISOString()
  };

  // Could add a notes field in future
  const { data, error } = await supabase
    .from('tickets')
    .update(updates)
    .eq('id', ticketId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'get_building_tickets',
      description: 'Get all tickets currently in "Building" status. These are the features actively being developed.',
      inputSchema: {
        type: 'object',
        properties: {
          client_id: {
            type: 'string',
            description: 'Optional: Filter by specific client/site ID'
          }
        }
      }
    },
    {
      name: 'get_ticket_details',
      description: 'Get full details for a specific ticket including voice feedback transcripts, AI insights, and user engagement metrics.',
      inputSchema: {
        type: 'object',
        properties: {
          ticket_id: {
            type: 'string',
            description: 'The ID of the ticket to fetch'
          }
        },
        required: ['ticket_id']
      }
    },
    {
      name: 'get_next_priority',
      description: 'Get the next highest priority ticket to work on based on AI scoring framework.',
      inputSchema: {
        type: 'object',
        properties: {
          client_id: {
            type: 'string',
            description: 'Optional: Filter by specific client/site ID'
          },
          framework: {
            type: 'string',
            enum: ['traditional', 'differentiation', 'gray_area', 'quick_win', 'enterprise', 'viral'],
            description: 'The prioritization framework to use (default: traditional)',
            default: 'traditional'
          }
        }
      }
    },
    {
      name: 'list_tickets',
      description: 'List all tickets filtered by status (new, planned, building, shipped).',
      inputSchema: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['new', 'planned', 'building', 'shipped'],
            description: 'Filter tickets by status'
          },
          client_id: {
            type: 'string',
            description: 'Optional: Filter by specific client/site ID'
          }
        },
        required: ['status']
      }
    },
    {
      name: 'search_tickets',
      description: 'Search tickets by keyword in title or description.',
      inputSchema: {
        type: 'object',
        properties: {
          keyword: {
            type: 'string',
            description: 'Search keyword'
          },
          client_id: {
            type: 'string',
            description: 'Optional: Filter by specific client/site ID'
          }
        },
        required: ['keyword']
      }
    },
    {
      name: 'get_recent_tickets',
      description: 'Get tickets created within the last X hours. Perfect for checking "what\'s new" since you last checked.',
      inputSchema: {
        type: 'object',
        properties: {
          hours_ago: {
            type: 'number',
            description: 'How many hours back to look (default: 24). E.g., 1 = last hour, 24 = last day, 168 = last week',
            default: 24
          },
          client_id: {
            type: 'string',
            description: 'Optional: Filter by specific client/site ID'
          }
        }
      }
    },
    {
      name: 'update_ticket_status',
      description: 'Update a ticket\'s status (move between columns: new, planned, building, shipped).',
      inputSchema: {
        type: 'object',
        properties: {
          ticket_id: {
            type: 'string',
            description: 'The ID of the ticket to update'
          },
          status: {
            type: 'string',
            enum: ['new', 'planned', 'building', 'shipped'],
            description: 'New status for the ticket'
          }
        },
        required: ['ticket_id', 'status']
      }
    },
    {
      name: 'mark_shipped',
      description: 'Mark a ticket as shipped (moves to Shipped column). Use this when a feature is deployed.',
      inputSchema: {
        type: 'object',
        properties: {
          ticket_id: {
            type: 'string',
            description: 'The ID of the ticket to mark as shipped'
          },
          notes: {
            type: 'string',
            description: 'Optional: Deployment notes or release info'
          }
        },
        required: ['ticket_id']
      }
    }
  ]
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    switch (name) {
      case 'get_building_tickets': {
        const tickets = await getBuildingTickets(args?.client_id as string);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(tickets, null, 2)
            }
          ]
        };
      }

      case 'get_ticket_details': {
        const ticketId = args?.ticket_id as string;
        if (!ticketId) {
          throw new McpError(ErrorCode.InvalidParams, 'ticket_id is required');
        }
        const ticket = await getTicketDetails(ticketId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(ticket, null, 2)
            }
          ]
        };
      }

      case 'get_next_priority': {
        const ticket = await getNextPriorityTicket(
          args?.client_id as string,
          args?.framework as string || 'traditional'
        );
        return {
          content: [
            {
              type: 'text',
              text: ticket ? JSON.stringify(ticket, null, 2) : 'No tickets found'
            }
          ]
        };
      }

      case 'list_tickets': {
        const status = args?.status as string;
        if (!status) {
          throw new McpError(ErrorCode.InvalidParams, 'status is required');
        }
        const tickets = await listTicketsByStatus(status, args?.client_id as string);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(tickets, null, 2)
            }
          ]
        };
      }

      case 'search_tickets': {
        const keyword = args?.keyword as string;
        if (!keyword) {
          throw new McpError(ErrorCode.InvalidParams, 'keyword is required');
        }
        const tickets = await searchTickets(keyword, args?.client_id as string);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(tickets, null, 2)
            }
          ]
        };
      }

      case 'get_recent_tickets': {
        const hoursAgo = (args?.hours_ago as number) || 24;
        const tickets = await getRecentTickets(hoursAgo, args?.client_id as string);
        const summary = `Found ${tickets.length} ticket(s) created in the last ${hoursAgo} hour(s)`;
        return {
          content: [
            {
              type: 'text',
              text: `${summary}\n\n${JSON.stringify(tickets, null, 2)}`
            }
          ]
        };
      }

      case 'update_ticket_status': {
        const ticketId = args?.ticket_id as string;
        const status = args?.status as string;
        if (!ticketId || !status) {
          throw new McpError(ErrorCode.InvalidParams, 'ticket_id and status are required');
        }
        const ticket = await updateTicketStatus(ticketId, status);
        return {
          content: [
            {
              type: 'text',
              text: `✅ Ticket updated!\n\n${JSON.stringify(ticket, null, 2)}`
            }
          ]
        };
      }

      case 'mark_shipped': {
        const ticketId = args?.ticket_id as string;
        if (!ticketId) {
          throw new McpError(ErrorCode.InvalidParams, 'ticket_id is required');
        }
        const ticket = await markShipped(ticketId, args?.notes as string);
        return {
          content: [
            {
              type: 'text',
              text: `🚀 Ticket marked as shipped!\n\n${JSON.stringify(ticket, null, 2)}`
            }
          ]
        };
      }

      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }
  } catch (error) {
    if (error instanceof McpError) throw error;
    throw new McpError(
      ErrorCode.InternalError,
      `Error executing tool: ${error instanceof Error ? error.message : String(error)}`
    );
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Trackerbee MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});

