import { httpClient } from './http-client';

export interface RegisterNotificationDeviceRequest {
  token: string;
  platform: 'web';
  permission: NotificationPermission;
}

export const registerNotificationDevice = (body: RegisterNotificationDeviceRequest) =>
  httpClient.post('/api/v1/notifications/devices', body);

export const deleteNotificationDevice = (token: string) =>
  httpClient.delete('/api/v1/notifications/devices', { data: { token } });
