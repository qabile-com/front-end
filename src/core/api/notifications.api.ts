export interface RegisterNotificationDeviceRequest {
  token: string;
  platform: 'web';
  deviceId: string;
}

export { deleteMyPushToken as deleteNotificationDevice } from './users.api';

export { registerMyPushToken as registerNotificationDevice } from './users.api';
