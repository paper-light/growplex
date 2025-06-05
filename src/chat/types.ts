export interface Message {
  content: string;
  incoming?: boolean;
  name?: string;
  timestamp?: DateTime;
  status?: string;
  avatarUrl?: string;
}
