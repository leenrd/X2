interface incomingFriendRequest {
  senderId: string;
  senderName: string | null | undefined;
  senderEmail: string | null | undefined;
  senderImage?: string | null | undefined;
}
