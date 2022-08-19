export interface ReqBody {
  type: string;
  payload?: any;
  domain?: string;
  from?: string;
}

export interface CustomEvent extends Event {
  detail?: string;
}
