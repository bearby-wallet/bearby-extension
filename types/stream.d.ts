export interface ReqBody {
  type: string;
  payload?: any;
  domain?: string;
  from?: string;
}

export interface CustomEvent extends Event {
  detail?: string;
}

export interface SendResponseParams {
  resolve?: unknown;
  reject?: unknown;
}

export type StreamResponse = (params: SendResponseParams) => void;
