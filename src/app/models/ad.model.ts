export enum ActionType {
  WEB_URL = 'web_url',
  WHATSAPP = 'whatsapp',
  PHONE_CALL = 'phone_call'
}

export interface Ad {
  adId: number;
  imageUrl: string;
  actionType: ActionType;
  actionValue: string;
  companyName: string;
}
