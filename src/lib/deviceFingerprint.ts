// Device fingerprint generator for unique device identification

export interface DeviceInfo {
  fingerprint: string;
  browser: string;
  os: string;
  device: string;
  screenResolution: string;
  timezone: string;
  language: string;
}

const getBrowserInfo = (): string => {
  const ua = navigator.userAgent;
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('SamsungBrowser')) return 'Samsung Browser';
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
  if (ua.includes('Edge')) return 'Edge';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  return 'Unknown';
};

const getOSInfo = (): string => {
  const ua = navigator.userAgent;
  if (ua.includes('Windows NT 10')) return 'Windows 10';
  if (ua.includes('Windows NT 6.3')) return 'Windows 8.1';
  if (ua.includes('Windows NT 6.2')) return 'Windows 8';
  if (ua.includes('Windows NT 6.1')) return 'Windows 7';
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac OS X')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  return 'Unknown';
};

const getDeviceType = (): string => {
  const ua = navigator.userAgent;
  if (ua.includes('Mobile')) return 'Mobile';
  if (ua.includes('Tablet') || ua.includes('iPad')) return 'Tablet';
  return 'Desktop';
};

const generateFingerprint = (): string => {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || 'unknown',
    navigator.platform,
  ];
  
  // Simple hash function
  let hash = 0;
  const str = components.join('|');
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return 'DEV-' + Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
};

export const getDeviceInfo = (): DeviceInfo => {
  return {
    fingerprint: generateFingerprint(),
    browser: getBrowserInfo(),
    os: getOSInfo(),
    device: getDeviceType(),
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
  };
};

export const getStoredDeviceId = (): string => {
  let deviceId = localStorage.getItem('cfms_device_id');
  if (!deviceId) {
    deviceId = getDeviceInfo().fingerprint + '-' + Date.now().toString(36);
    localStorage.setItem('cfms_device_id', deviceId);
  }
  return deviceId;
};
