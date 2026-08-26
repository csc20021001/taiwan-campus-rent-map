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

export type Listing = {
  id: string;
  universityId: string;
  title: string;
  address: string;
  monthlyRent: number;
  roomType: string;
  areaPing: number;
  walkMinutes: number;
  latitude: number;
  longitude: number;
  rating: number;
  reviewCount: number;
  highlights: string[];
  featured?: boolean;
};

export const universities: University[] = [
  { id: 'ntu', name: '國立臺灣大學', shortName: '臺大', city: '臺北市', district: '大安區', latitude: 25.0173, longitude: 121.5398, address: '臺北市大安區羅斯福路四段1號' },
  { id: 'nthu', name: '國立清華大學', shortName: '清大', city: '新竹市', district: '東區', latitude: 24.7961, longitude: 120.9967, address: '新竹市東區光復路二段101號' },
  { id: 'nycu', name: '國立陽明交通大學', shortName: '陽明交大', city: '新竹市', district: '東區', latitude: 24.7868, longitude: 120.9971, address: '新竹市東區大學路1001號' },
  { id: 'ncku', name: '國立成功大學', shortName: '成大', city: '臺南市', district: '東區', latitude: 22.9997, longitude: 120.2195, address: '臺南市東區大學路1號' },
  { id: 'ncu', name: '國立中央大學', shortName: '中央', city: '桃園市', district: '中壢區', latitude: 24.9681, longitude: 121.1953, address: '桃園市中壢區中大路300號' },
  { id: 'nchu', name: '國立中興大學', shortName: '中興', city: '臺中市', district: '南區', latitude: 24.1236, longitude: 120.6753, address: '臺中市南區興大路145號' },
  { id: 'ccu', name: '國立中正大學', shortName: '中正', city: '嘉義縣', district: '民雄鄉', latitude: 23.5614, longitude: 120.4756, address: '嘉義縣民雄鄉大學路一段168號' },
  { id: 'nsysu', name: '國立中山大學', shortName: '中山', city: '高雄市', district: '鼓山區', latitude: 22.6275, longitude: 120.2647, address: '高雄市鼓山區蓮海路70號' },
  { id: 'ntust', name: '國立臺灣科技大學', shortName: '臺科', city: '臺北市', district: '大安區', latitude: 25.0137, longitude: 121.5407, address: '臺北市大安區基隆路四段43號' },
  { id: 'ntut', name: '國立臺北科技大學', shortName: '北科', city: '臺北市', district: '大安區', latitude: 25.0422, longitude: 121.5355, address: '臺北市大安區忠孝東路三段1號' },
  { id: 'niu', name: '國立宜蘭大學', shortName: '宜大', city: '宜蘭縣', district: '宜蘭市', latitude: 24.7462, longitude: 121.7463, address: '宜蘭縣宜蘭市神農路一段1號' },
];

export const previewListings: Listing[] = [
  { id: 'ntu-01', universityId: 'ntu', title: '溫州街・採光獨立套房', address: '大安區溫州街', monthlyRent: 12800, roomType: '獨立套房', areaPing: 7.5, walkMinutes: 6, latitude: 25.0191, longitude: 121.5339, rating: 4.8, reviewCount: 23, highlights: ['可開伙', '垃圾代收'], featured: true },
  { id: 'ntu-02', universityId: 'ntu', title: '公館靜巷・女生雅房', address: '中正區汀州路三段', monthlyRent: 8200, roomType: '分租雅房', areaPing: 5.5, walkMinutes: 9, latitude: 25.0149, longitude: 121.5349, rating: 4.5, reviewCount: 17, highlights: ['近捷運', '水費含租'] },
  { id: 'ntu-03', universityId: 'ntu', title: '臺大後門・電梯套房', address: '大安區辛亥路二段', monthlyRent: 15500, roomType: '獨立套房', areaPing: 8.2, walkMinutes: 4, latitude: 25.0213, longitude: 121.5422, rating: 4.6, reviewCount: 31, highlights: ['有電梯', '獨立洗衣機'] },
  { id: 'nthu-01', universityId: 'nthu', title: '清大夜市・陽台套房', address: '東區建功一路', monthlyRent: 9200, roomType: '獨立套房', areaPing: 7, walkMinutes: 8, latitude: 24.7985, longitude: 120.999, rating: 4.7, reviewCount: 18, highlights: ['獨立陽台', '機車位'] },
  { id: 'nycu-01', universityId: 'nycu', title: '大學路・學生合租公寓', address: '東區大學路', monthlyRent: 6800, roomType: '合租雅房', areaPing: 6, walkMinutes: 5, latitude: 24.789, longitude: 120.9945, rating: 4.4, reviewCount: 12, highlights: ['可短租', '公共客廳'] },
  { id: 'ncku-01', universityId: 'ncku', title: '育樂街・全新套房', address: '東區育樂街', monthlyRent: 7600, roomType: '獨立套房', areaPing: 7.2, walkMinutes: 4, latitude: 22.9981, longitude: 120.2146, rating: 4.9, reviewCount: 27, highlights: ['新裝潢', '包網路'] },
  { id: 'ncu-01', universityId: 'ncu', title: '中大路・景觀套房', address: '中壢區中大路', monthlyRent: 7000, roomType: '獨立套房', areaPing: 8, walkMinutes: 7, latitude: 24.9657, longitude: 121.1917, rating: 4.6, reviewCount: 15, highlights: ['採光佳', '可養貓'] },
  { id: 'nchu-01', universityId: 'nchu', title: '興大商圈・機能套房', address: '南區學府路', monthlyRent: 7500, roomType: '獨立套房', areaPing: 7.1, walkMinutes: 6, latitude: 24.1261, longitude: 120.6742, rating: 4.5, reviewCount: 20, highlights: ['近市場', '子母車'] },
  { id: 'ccu-01', universityId: 'ccu', title: '大學路・安靜雅房', address: '民雄鄉大學路一段', monthlyRent: 4800, roomType: '分租雅房', areaPing: 6.5, walkMinutes: 9, latitude: 23.5587, longitude: 120.4719, rating: 4.3, reviewCount: 9, highlights: ['機車位', '含水網'] },
  { id: 'nsysu-01', universityId: 'nsysu', title: '哈瑪星・海景雅房', address: '鼓山區鼓元街', monthlyRent: 7800, roomType: '分租雅房', areaPing: 6, walkMinutes: 10, latitude: 22.6229, longitude: 120.2706, rating: 4.7, reviewCount: 16, highlights: ['近輕軌', '看海陽台'] },
  { id: 'ntust-01', universityId: 'ntust', title: '基隆路・共居雅房', address: '大安區基隆路四段', monthlyRent: 9000, roomType: '合租雅房', areaPing: 5.8, walkMinutes: 5, latitude: 25.0116, longitude: 121.5374, rating: 4.4, reviewCount: 11, highlights: ['公共廚房', '定期清潔'] },
  { id: 'ntut-01', universityId: 'ntut', title: '光華商圈・電梯套房', address: '中正區八德路一段', monthlyRent: 13800, roomType: '獨立套房', areaPing: 7, walkMinutes: 6, latitude: 25.0441, longitude: 121.5321, rating: 4.6, reviewCount: 19, highlights: ['有電梯', '近捷運'] },
  { id: 'niu-01', universityId: 'niu', title: '神農商圈・明亮套房', address: '宜蘭市女中路二段', monthlyRent: 6500, roomType: '獨立套房', areaPing: 7.6, walkMinutes: 7, latitude: 24.7487, longitude: 121.744, rating: 4.8, reviewCount: 14, highlights: ['獨立陽台', '可開伙'] },
];
