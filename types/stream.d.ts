export interface ReqBody {
  type: string;
  payload?: any;
  from?: string;
}

export interface CustomEvent extends Event {
  detail?: string;
}

export interface SendResponseParams {
  resolve?: unknown;
  reject?: {
    message: string;
    name: string;
    code?: number;
    stack?: string;
  };
}

export type StreamResponse = (params: SendResponseParams) => void;
