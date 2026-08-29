export type University = {
  id: string;
  name: string;
  shortName: string;
  city: string;
  district: string;
  latitude: number;
  longitude: number;
  address: string;
};

export const universities: University[] = [
  { id: 'ntu', name: '國立臺灣大學', shortName: '臺大', city: '臺北市', district: '大安區', latitude: 25.0173, longitude: 121.5398, address: '臺北市大安區羅斯福路四段1號' },
  { id: 'nthu', name: '國立清華大學', shortName: '清大', city: '新竹市', district: '東區', latitude: 24.7961, longitude: 120.9967, address: '新竹市東區光復路二段101號' },
  { id: 'nycu', name: '國立陽明交通大學', shortName: '陽明交大', city: '新竹市', district: '東區', latitude: 24.7868, longitude: 120.9971, address: '新竹市東區大學路1001號' },
  { id: 'ncu', name: '國立中央大學', shortName: '中央', city: '桃園市', district: '中壢區', latitude: 24.9681, longitude: 121.1953, address: '桃園市中壢區中大路300號' },
  { id: 'nchu', name: '國立中興大學', shortName: '中興', city: '臺中市', district: '南區', latitude: 24.1236, longitude: 120.6753, address: '臺中市南區興大路145號' },
  { id: 'ccu', name: '國立中正大學', shortName: '中正', city: '嘉義縣', district: '民雄鄉', latitude: 23.5614, longitude: 120.4756, address: '嘉義縣民雄鄉大學路一段168號' },
  { id: 'nsysu', name: '國立中山大學', shortName: '中山', city: '高雄市', district: '鼓山區', latitude: 22.6275, longitude: 120.2647, address: '高雄市鼓山區蓮海路70號' },
  { id: 'ntust', name: '國立臺灣科技大學', shortName: '臺科', city: '臺北市', district: '大安區', latitude: 25.0137, longitude: 121.5407, address: '臺北市大安區基隆路四段43號' },
  { id: 'ntut', name: '國立臺北科技大學', shortName: '北科', city: '臺北市', district: '大安區', latitude: 25.0422, longitude: 121.5355, address: '臺北市大安區忠孝東路三段1號' },
  { id: 'niu', name: '國立宜蘭大學', shortName: '宜大', city: '宜蘭縣', district: '宜蘭市', latitude: 24.7462, longitude: 121.7463, address: '宜蘭縣宜蘭市神農路一段1號' },
  { id: 'cycu', name: '中原大學', shortName: '中原', city: '桃園市', district: '中壢區', latitude: 24.9576, longitude: 121.2407, address: '桃園市中壢區中北路200號' },
  { id: 'tku', name: '淡江大學', shortName: '淡江', city: '新北市', district: '淡水區', latitude: 25.1754, longitude: 121.4500, address: '新北市淡水區英專路151號' },
  { id: 'yzu', name: '元智大學', shortName: '元智', city: '桃園市', district: '中壢區', latitude: 24.9704, longitude: 121.2635, address: '桃園市中壢區遠東路135號' },
  { id: 'fcu', name: '逢甲大學', shortName: '逢甲', city: '臺中市', district: '西屯區', latitude: 24.1788, longitude: 120.6466, address: '臺中市西屯區文華路100號' },
];
