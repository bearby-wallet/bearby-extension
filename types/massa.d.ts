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
    last_slot?: {
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
    minimal_fees: string;
    version: string;
    chain_id: number | null;
  };
}

export interface AddressInfo {
  final_roll_count: number;
  final_balance: string;
  candidate_balance: string;
  candidate_roll_count: number;
}

export interface JsonRPCResponseNodeStatusAddresses extends JsonRPCResponse {
  result?: AddressInfo[];
}

export interface JsonRPCResponseStakers extends JsonRPCResponse {
  result?: Array<[string, number]>;
}

export interface OperationTransaction extends JsonRPCResponse {
  result?: {
    id: string; // Operation id
    in_blocks: string[]; // Block ids
    in_pool: boolean;
    is_operation_final: boolean;
    op_exec_status: boolean;
    operation: {
      content: {
        expire_period: number;// after that period, the operation become invalid forever
        fee: string; // represent an Amount in coins
        op: {
          Transaction?: {
            amount: string; // represent an Amount in coins
            recipient_address: String
          };
          RollBuy?: {
            roll_count: number;
          };
          RollSell?: {
            roll_count: number;
          };
          ExecuteSC?: {
            data: number[]; // vec of bytes to execute
            max_gas: number; // maximum amount of gas that the execution of the contract is allowed to cost.
            coins: string; // represent an Amount in coins that are spent by consensus and are available in the execution context of the contract.
            gas_price: string; // represent an Amount in coins, price per unit of gas that the caller is willing to pay for the execution.
          };
          CallSC?: {
            target_addr: string; // Address
            target_func: string; // Function name
            param: string; // Parameter to pass to the function
            max_gas: number;
            sequential_coins: number; // Amount
            parallel_coins: number; // Amount
            gas_price: number; // Amount
          };
        };
        sender_public_key: string;
      };
      signature: string;
    }
  }[];
}

export interface MassaBlock extends JsonRPCResponse {
  result?: {
    id: string; // BlockId,
    content?: {
      is_final: boolean;
      is_stale: boolean;
      is_in_blockclique: boolean;
      block: {
        header: {
          content: {
            endorsed_block: string; // Block id
            index: number;
            sender_public_key: string;
            slot: { // endorsed block slot: deifferent from block's slot
              period: number;
              thread: Number
            };
          };
          signature: string;
        }
        operation_merkle_root: string; // Hash of all operations
        parents: string[]; // Block ids, as many as thread count
        slot: {
          period: number;
          thread: number;
        };
        signature: string;
      };
      operations: OperationTransaction[];
    };
    is_final: boolean;
    is_in_blockclique: boolean;
    is_stale: boolean;
  }
}

export interface OperationResponse extends JsonRPCResponse {
  result?: string[];
}

export interface ExecuteReadOnlyCallResponse extends JsonRPCResponse {
  result?: {
    result: { Ok: number[] };
  }[];
}

export interface TransactionData {
  signature: string;
  serialized_content: number[];
  creator_public_key: string;
}
