// Fixed absolute estimates for addresses that previously collapsed onto a
// shared street centroid. They remain unverified and never receive UI offsets.
export const rentalCoordinateOverrides = Object.freeze({
  '新竹市公道五路二段293號': { latitude: 24.79592, longitude: 121.01030 },
  '新竹市公道五路二段299號': { latitude: 24.79594, longitude: 121.01050 },
  '新竹市公道五路二段313號': { latitude: 24.79600, longitude: 121.01091 },
  '新竹市公道五路二段425之5號': { latitude: 24.79622, longitude: 121.01220 },
  '新竹市世傑路72號': { latitude: 24.79060, longitude: 121.00790 },
  '新竹市世傑路116號': { latitude: 24.79105, longitude: 121.00835 },
  '臺中市南區學府路3號': { latitude: 24.12850, longitude: 120.67395 },
  '高雄市鼓山區濱海一路88巷16號': { latitude: 22.62030, longitude: 120.27055 },
  '高雄市鼓山區濱海一路88巷20號': { latitude: 22.62036, longitude: 120.27065 },
  '高雄市鼓山區濱海一路88巷22號': { latitude: 22.62039, longitude: 120.27070 },
  '高雄市鼓山區濱海一路88巷26號': { latitude: 22.62045, longitude: 120.27080 },
  '高雄市鼓山區濱海一路88巷28號': { latitude: 22.62048, longitude: 120.27085 },
  '嘉義縣民雄鄉鎮北村圳溝墘19號四樓之三': { latitude: 23.57150, longitude: 120.44818 },
  '嘉義縣民雄鄉鎮北村圳溝墘20號二樓之一': { latitude: 23.57156, longitude: 120.44828 },
  '嘉義縣民雄鄉鎮北村圳溝墘21號三樓之14': { latitude: 23.57162, longitude: 120.44838 },
  '臺北市文山區羅斯福路四段200號': { latitude: 25.01040, longitude: 121.53710 },
  '臺北市文山區羅斯福路四段202號': { latitude: 25.01045, longitude: 121.53718 },
  '臺北市文山區羅斯福路四段210號': { latitude: 25.01060, longitude: 121.53735 },
  '臺北市大安區忠孝東路三段52號': { latitude: 25.04190, longitude: 121.53582 },
  '臺北市大安區忠孝東路三段54號': { latitude: 25.04193, longitude: 121.53606 },
  '臺北市大安區忠孝東路三段88號': { latitude: 25.04198, longitude: 121.53685 },
  '宜蘭縣宜蘭市神農路二段50號': { latitude: 24.74920, longitude: 121.75070 },
  '宜蘭縣宜蘭市神農路二段125號': { latitude: 24.75142, longitude: 121.75094 },
  '宜蘭縣宜蘭市神農路二段127號': { latitude: 24.75149, longitude: 121.75100 },
});

export function fixedAbsoluteCoordinate(address) {
  const coordinate = rentalCoordinateOverrides[address];
  if (!coordinate) return null;
  return { ...coordinate, coordinateSource: 'fixed_absolute_estimate', coordinatesVerified: false };
}
