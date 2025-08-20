export interface JoinRoomDTO {
  chatId: string;
  roomId: string;
  username: string;
}

export interface SendMessageDTO {
  chatId: string;
  roomId: string;
  msgStr: string;
  mode?: "consulter" | "oracle";
}
