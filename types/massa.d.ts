import type { number } from svelte-i18n;

export interface JsonRPCResponse {
  error?: {
    code: number;
    message: string;
  };
  result?: object;
  id: number;
  jsonrpc: string;
}

export interface JsonRPCResponseNodeStatus extends JsonRPCResponse {
  result?: {
    config: {
      block_reward: string;
      delta_f0: number;
      end_timestamp: number | null;
      genesis_timestamp: number;
      max_block_size: number;
      operation_validity_periods: number;
      periods_per_cycle: number;
      pos_lock_cycles: number;
      pos_lookback_cycles: number;
      roll_price: string;
      t0: number;
      thread_count: number;
    },
    connected_nodes: {
      [key: string]: Array<boolean | string>;
    },
    consensus_stats: {
        clique_count: number;
        end_timespan: number;
        final_block_count: number;
        final_operation_count: number;
        staker_count: number;
        stale_block_count: number;
        start_timespan: number;
    },
    current_cycle: number;
    current_time: number;
    last_slot: {
        period: number;
        thread: number;
    },
    network_stats: {
        active_node_count: number;
        banned_peer_count: number;
        in_connection_count: number;
        known_peer_count: number;
        out_connection_count: number;
    },
    next_slot: {
        period: number;
        thread: number;
    },
    node_id: string;
    node_ip: string;
    pool_stats: {
        endorsement_count: number;
        operation_count: number;
    },
    version: string;
  }
}

export interface JsonRPCResponseNodeStatusAddresses extends JsonRPCResponse {
  result?: {
    address: string;
    block_draws: Array<string>;
    blocks_created: Array<string>;
    candidate_balance_info: string;
    candidate_datastore_keys: Array<string>;
    endorsement_draws: Array<string>;
    final_balance_info: string;
    final_datastore_keys: Array<string>;
    involved_in_endorsements: Array<string>;
    involved_in_operations: Array<string>;
    ledger_info: {
        candidate_ledger_info: {
            balance: string;
        },
        final_ledger_info: {
            balance: string;
        },
        locked_balance: string;
    },
    production_stats: [
        {
            cycle: number;
            is_final: boolean;
            nok_count: number;
            ok_count: number;
        },
        {
            cycle: number;
            is_final: boolean;
            nok_count: number;
            ok_count: number;
        },
        {
            cycle: number;
            is_final: boolean;
            nok_count: number;
            ok_count: number;
        },
        {
            cycle: number;
            is_final: boolean;
            nok_count: number;
            ok_count: number;
        },
        {
            cycle: number;
            is_final: boolean;
            nok_count: number;
            ok_count: number;
        }
    ],
    rolls: {
        active_rolls: number;
        candidate_rolls: number;
        final_rolls: number;
    },
    thread: number;
  }
}


export interface JsonRPCResponseStakers extends JsonRPCResponse {
  result?: Array<[string, number]>;
}
