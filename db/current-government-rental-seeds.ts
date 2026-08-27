export type CurrentGovernmentRentalSeed = {
  id: string;
  universityId: string;
  address: string;
  normalizedAddress: string;
  latitude: number;
  longitude: number;
  referenceRent: number;
  referenceRentSource: string;
  coordinateSource: string;
  publishedAt: string;
  createdAt: string;
};

export const currentGovernmentRentalSeeds: CurrentGovernmentRentalSeed[] = [
  {
    id: 'moe-current-niu-minquan-47-11-4',
    universityId: 'niu',
    address: '宜蘭縣宜蘭市民權新路47巷6弄11-4號5樓',
    normalizedAddress: '宜蘭縣宜蘭市民權新路47巷6弄11之4號5樓',
    latitude: 24.749533,
    longitude: 121.7512315,
    referenceRent: 5250,
    referenceRentSource: '教育部雲端租屋生活網｜https://house.nfu.edu.tw/NIU｜2026-08-21 待租｜刊登租金 NT$4,500–6,000',
    coordinateSource: 'openstreetmap_street_centroid',
    publishedAt: '2026-08-21T00:00:00.000Z',
    createdAt: '2026-08-27T03:00:00.000Z',
  },
  {
    id: 'moe-current-niu-fuxing-15-10-1',
    universityId: 'niu',
    address: '宜蘭縣宜蘭市復興路2段15巷10之1號2樓',
    normalizedAddress: '宜蘭縣宜蘭市復興路2段15巷10之1號2樓',
    latitude: 24.7481526,
    longitude: 121.749356,
    referenceRent: 4250,
    referenceRentSource: '教育部雲端租屋生活網｜https://house.nfu.edu.tw/NIU｜2026-08-06 待租｜刊登租金 NT$4,000–4,500',
    coordinateSource: 'openstreetmap_street_centroid',
    publishedAt: '2026-08-06T00:00:00.000Z',
    createdAt: '2026-08-27T02:00:00.000Z',
  },
  {
    id: 'moe-current-niu-nuzhong-71',
    universityId: 'niu',
    address: '宜蘭縣宜蘭市女中路3段71號',
    normalizedAddress: '宜蘭縣宜蘭市女中路3段71號',
    latitude: 24.7449114,
    longitude: 121.7455514,
    referenceRent: 4500,
    referenceRentSource: '教育部雲端租屋生活網｜https://house.nfu.edu.tw/NIU｜2026-07-22 待租｜刊登租金 NT$3,000–6,000',
    coordinateSource: 'openstreetmap_street_centroid',
    publishedAt: '2026-07-22T00:00:00.000Z',
    createdAt: '2026-08-27T01:00:00.000Z',
  },
];
