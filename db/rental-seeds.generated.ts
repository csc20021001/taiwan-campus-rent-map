export type RentalSeed = {
  id: string;
  primaryUniversityId: string;
  universityIds: string[];
  address: string;
  normalizedAddress: string;
  latitude: number | null;
  longitude: number | null;
  source: 'government';
  referenceRent: number | null;
  referenceRentSource: 'government';
  coordinateSource: 'nominatim' | 'fixed_absolute_estimate' | null;
  coordinatesVerified: boolean;
};

export const rentalSeeds: RentalSeed[] = [
  {
    "id": "gov-033ff1ba498d8bfd",
    "primaryUniversityId": "ntu",
    "universityIds": [
      "ntu"
    ],
    "address": "臺北市大安區和平東路二段96巷51號",
    "normalizedAddress": "臺北市大安區和平東路二段96巷51號",
    "referenceRent": 19500,
    "latitude": 25.0232323,
    "longitude": 121.5410608,
    "coordinateSource": "nominatim",
    "coordinatesVerified": false,
    "source": "government",
    "referenceRentSource": "government"
  },
  {
    "id": "gov-777042bc1d0ad716",
    "primaryUniversityId": "ntu",
    "universityIds": [
      "ntu"
    ],
    "address": "臺北市大安區辛亥路二段109號",
    "normalizedAddress": "臺北市大安區辛亥路二段109號",
    "referenceRent": 32000,
    "latitude": 25.0213291,
    "longitude": 121.5433534,
    "coordinateSource": "nominatim",
    "coordinatesVerified": false,
    "source": "government",
    "referenceRentSource": "government"
  },
  {
    "id": "gov-cd0adae4f88dbc94",
    "primaryUniversityId": "ntu",
    "universityIds": [
      "ntu"
    ],
    "address": "臺北市大安區和平東路二段76巷23弄8號",
    "normalizedAddress": "臺北市大安區和平東路二段76巷23弄8號",
    "referenceRent": 30000,
    "latitude": 25.0226511,
    "longitude": 121.5398877,
    "coordinateSource": "nominatim",
    "coordinatesVerified": false,
    "source": "government",
    "referenceRentSource": "government"
  },
  {
    "id": "gov-95f4d148a181c315",
    "primaryUniversityId": "ntu",
    "universityIds": [
      "ntu"
    ],
    "address": "臺北市大安區辛亥路二段171巷9號",
    "normalizedAddress": "臺北市大安區辛亥路二段171巷9號",
    "referenceRent": 55000,
    "latitude": 25.0224401,
    "longitude": 121.5410903,
    "coordinateSource": "nominatim",
    "coordinatesVerified": false,
    "source": "government",
    "referenceRentSource": "government"
  },
  {
    "id": "gov-6571d877e4287467",
    "primaryUniversityId": "ntu",
    "universityIds": [
      "ntu"
    ],
    "address": "臺北市大安區和平東路二段118巷54弄16號",
    "normalizedAddress": "臺北市大安區和平東路二段118巷54弄16號",
    "referenceRent": 30000,
    "latitude": 25.0220113,
    "longitude": 121.5419551,
    "coordinateSource": "nominatim",
    "coordinatesVerified": false,
    "source": "government",
    "referenceRentSource": "government"
  },
  {
    "id": "gov-a8d60303f3213b86",
    "primaryUniversityId": "nthu",
    "universityIds": [
      "nthu",
      "nycu"
    ],
    "address": "新竹市公道五路二段425之5號",
    "normalizedAddress": "新竹市公道五路二段425之5號",
    "referenceRent": 40000,
    "latitude": 24.79622,
    "longitude": 121.0122,
    "coordinateSource": "fixed_absolute_estimate",
    "coordinatesVerified": false,
    "source": "government",
    "referenceRentSource": "government"
  },
  {
    "id": "gov-c7b7e611166571ad",
    "primaryUniversityId": "nthu",
    "universityIds": [
      "nthu",
      "nycu"
    ],
    "address": "新竹市公道五路二段313號",
    "normalizedAddress": "新竹市公道五路二段313號",
    "referenceRent": 50000,
    "latitude": 24.796,
    "longitude": 121.01091,
    "coordinateSource": "fixed_absolute_estimate",
    "coordinatesVerified": false,
    "source": "government",
    "referenceRentSource": "government"
  },
  {
    "id": "gov-73897ec18b99bfda",
    "primaryUniversityId": "nthu",
    "universityIds": [
      "nthu"
    ],
    "address": "新竹市公道五路二段293號",
    "normalizedAddress": "新竹市公道五路二段293號",
    "referenceRent": 34056,
    "latitude": 24.79592,
    "longitude": 121.0103,
    "coordinateSource": "fixed_absolute_estimate",
    "coordinatesVerified": false,
    "source": "government",
    "referenceRentSource": "government"
  },
  {
    "id": "gov-7102d3f9d9b0a585",
    "primaryUniversityId": "nthu",
    "universityIds": [
      "nthu"
    ],
    "address": "新竹市公道五路二段299號",
    "normalizedAddress": "新竹市公道五路二段299號",
    "referenceRent": 61231,
    "latitude": 24.79594,
    "longitude": 121.0105,
    "coordinateSource": "fixed_absolute_estimate",
    "coordinatesVerified": false,
    "source": "government",
    "referenceRentSource": "government"
  },
  {
    "id": "gov-dad833018ee757c6",
    "primaryUniversityId": "nthu",
    "universityIds": [
      "nthu",
      "nycu"
    ],
    "address": "新竹市世傑路288號",
    "normalizedAddress": "新竹市世傑路288號",
    "referenceRent": 74706,
    "latitude": 24.7919624,
    "longitude": 121.0096343,
    "coordinateSource": "nominatim",
    "coordinatesVerified": false,
    "source": "government",
    "referenceRentSource": "government"
  },
  {
    "id": "gov-9fd0e61a542be679",
    "primaryUniversityId": "nycu",
    "universityIds": [
      "nycu"
    ],
    "address": "新竹市世傑路72號",
    "normalizedAddress": "新竹市世傑路72號",
    "referenceRent": 32500,
    "latitude": 24.7906,
    "longitude": 121.0079,
    "coordinateSource": "fixed_absolute_estimate",
    "coordinatesVerified": false,
    "source": "government",
    "referenceRentSource": "government"
  },
  {
    "id": "gov-39cd84e979219bcd",
    "primaryUniversityId": "nycu",
    "universityIds": [
      "nycu"
    ],
    "address": "新竹市世傑路116號",
    "normalizedAddress": "新竹市世傑路116號",
    "referenceRent": 25000,
    "latitude": 24.79105,
    "longitude": 121.00835,
    "coordinateSource": "fixed_absolute_estimate",
    "coordinatesVerified": false,
    "source": "government",
    "referenceRentSource": "government"
  },
  {
    "id": "gov-b79e9cd7b4080a37",
    "primaryUniversityId": "ncu",
    "universityIds": [
      "ncu"
    ],
    "address": "桃園市中壢區51號",
    "normalizedAddress": "桃園市中壢區51號",
    "referenceRent": 18000,
    "latitude": null,
    "longitude": null,
    "coordinateSource": null,
    "coordinatesVerified": false,
    "source": "government",
    "referenceRentSource": "government"
  },
  {
    "id": "gov-4e6f4894946dbca3",
    "primaryUniversityId": "ncu",
    "universityIds": [
      "ncu"
    ],
    "address": "桃園市中壢區61號",
    "normalizedAddress": "桃園市中壢區61號",
    "referenceRent": 12000,
    "latitude": null,
    "longitude": null,
    "coordinateSource": null,
    "coordinatesVerified": false,
    "source": "government",
    "referenceRentSource": "government"
  },
  {
    "id": "gov-52d753c11e29a4b4",
    "primaryUniversityId": "ncu",
    "universityIds": [
      "ncu"
    ],
    "address": "桃園市中壢區101號",
    "normalizedAddress": "桃園市中壢區101號",
    "referenceRent": 26000,
    "latitude": null,
    "longitude": null,
    "coordinateSource": null,
    "coordinatesVerified": false,
    "source": "government",
    "referenceRentSource": "government"
  },
  {
    "id": "gov-99b4c3540807fd47",
    "primaryUniversityId": "ncu",
    "universityIds": [
      "ncu"
    ],
    "address": "桃園市中壢區113號",
    "normalizedAddress": "桃園市中壢區113號",
    "referenceRent": 15000,
    "latitude": null,
    "longitude": null,
    "coordinateSource": null,
    "coordinatesVerified": false,
    "source": "government",
    "referenceRentSource": "government"
  },
  {
    "id": "gov-d2c0d81e5137634c",
    "primaryUniversityId": "ncu",
    "universityIds": [
      "ncu"
    ],
    "address": "桃園市中壢區大享街468號",
    "normalizedAddress": "桃園市中壢區大享街468號",
    "referenceRent": 17000,
    "latitude": 24.9735451,
    "longitude": 121.1929104,
    "coordinateSource": "nominatim",
    "coordinatesVerified": false,
    "source": "government",
    "referenceRentSource": "government"
  },
  {
    "id": "gov-006773df92ee9d96",
    "primaryUniversityId": "nchu",
    "universityIds": [
      "nchu"
    ],
    "address": "臺中市南區學府路3號",
    "normalizedAddress": "臺中市南區學府路3號",
    "referenceRent": 14000,
    "latitude": 24.1285,
    "longitude": 120.67395,
    "coordinateSource": "fixed_absolute_estimate",
    "coordinatesVerified": false,
    "source": "government",
    "referenceRentSource": "government"
  },
  {
    "id": "gov-3211a8774b5f7dda",
    "primaryUniversityId": "nchu",
    "universityIds": [
      "nchu"
    ],
    "address": "臺中市南區興大路200號",
    "normalizedAddress": "臺中市南區興大路200號",
    "referenceRent": 17000,
    "latitude": 24.1239979,
    "longitude": 120.6729573,
    "coordinateSource": "nominatim",
    "coordinatesVerified": false,
    "source": "government",
    "referenceRentSource": "government"
  },
  {
    "id": "gov-02d4f09e64b87a43",
    "primaryUniversityId": "nchu",
    "universityIds": [
      "nchu"
    ],
    "address": "臺中市南區學府路21號",
    "normalizedAddress": "臺中市南區學府路21號",
    "referenceRent": 8300,
    "latitude": 24.1288776,
    "longitude": 120.6741113,
    "coordinateSource": "nominatim",
    "coordinatesVerified": false,
    "source": "government",
    "referenceRentSource": "government"
  },
  {
    "id": "gov-fc56fb1af29ba02f",
    "primaryUniversityId": "nchu",
    "universityIds": [
      "nchu"
    ],
    "address": "臺中市南區復新街55號",
    "normalizedAddress": "臺中市南區復新街55號",
    "referenceRent": 6000,
    "latitude": 24.1246948,
    "longitude": 120.6756745,
    "coordinateSource": "nominatim",
    "coordinatesVerified": false,
    "source": "government",
    "referenceRentSource": "government"
  },
  {
    "id": "gov-df4b078163d5c25c",
    "primaryUniversityId": "nchu",
    "universityIds": [
      "nchu"
    ],
    "address": "臺中市南區永東街42號",
    "normalizedAddress": "臺中市南區永東街42號",
    "referenceRent": 11400,
    "latitude": 24.1245014,
    "longitude": 120.6726337,
    "coordinateSource": "nominatim",
    "coordinatesVerified": false,
    "source": "government",
    "referenceRentSource": "government"
  },
  {
    "id": "gov-8bc9393d0e77f40e",
    "primaryUniversityId": "nsysu",
    "universityIds": [
      "nsysu"
    ],
    "address": "高雄市鼓山區濱海一路88巷16號",
    "normalizedAddress": "高雄市鼓山區濱海一路88巷16號",
    "referenceRent": null,
    "latitude": 22.6203,
    "longitude": 120.27055,
    "coordinateSource": "fixed_absolute_estimate",
    "coordinatesVerified": false,
    "source": "government",
    "referenceRentSource": "government"
  },
  {
    "id": "gov-fe4b096efbdf14df",
    "primaryUniversityId": "nsysu",
    "universityIds": [
      "nsysu"
    ],
    "address": "高雄市鼓山區濱海一路88巷26號",
    "normalizedAddress": "高雄市鼓山區濱海一路88巷26號",
    "referenceRent": null,
    "latitude": 22.62045,
    "longitude": 120.2708,
    "coordinateSource": "fixed_absolute_estimate",
    "coordinatesVerified": false,
    "source": "government",
    "referenceRentSource": "government"
  },
  {
    "id": "gov-190f966b819ecd0b",
    "primaryUniversityId": "nsysu",
    "universityIds": [
      "nsysu"
    ],
    "address": "高雄市鼓山區濱海一路88巷28號",
    "normalizedAddress": "高雄市鼓山區濱海一路88巷28號",
    "referenceRent": null,
    "latitude": 22.62048,
    "longitude": 120.27085,
    "coordinateSource": "fixed_absolute_estimate",
    "coordinatesVerified": false,
    "source": "government",
    "referenceRentSource": "government"
  },
  {
    "id": "gov-d3766154e172ebc8",
    "primaryUniversityId": "nsysu",
    "universityIds": [
      "nsysu"
    ],
    "address": "高雄市鼓山區濱海一路88巷22號",
    "normalizedAddress": "高雄市鼓山區濱海一路88巷22號",
    "referenceRent": null,
    "latitude": 22.62039,
    "longitude": 120.2707,
    "coordinateSource": "fixed_absolute_estimate",
    "coordinatesVerified": false,
    "source": "government",
    "referenceRentSource": "government"
  },
  {
    "id": "gov-f6b691648fc0267d",
    "primaryUniversityId": "nsysu",
    "universityIds": [
      "nsysu"
    ],
    "address": "高雄市鼓山區濱海一路88巷20號",
    "normalizedAddress": "高雄市鼓山區濱海一路88巷20號",
    "referenceRent": null,
    "latitude": 22.62036,
    "longitude": 120.27065,
    "coordinateSource": "fixed_absolute_estimate",
    "coordinatesVerified": false,
    "source": "government",
    "referenceRentSource": "government"
  },
  {
    "id": "gov-3569c94826a5eafb",
    "primaryUniversityId": "ccu",
    "universityIds": [
      "ccu"
    ],
    "address": "嘉義縣民雄鄉三興路119號",
    "normalizedAddress": "嘉義縣民雄鄉三興路119號",
    "referenceRent": 3200,
    "latitude": null,
    "longitude": null,
    "coordinateSource": null,
    "coordinatesVerified": false,
    "source": "government",
    "referenceRentSource": "government"
  },
  {
    "id": "gov-f83a732106e30fa0",
    "primaryUniversityId": "ccu",
    "universityIds": [
      "ccu"
    ],
    "address": "嘉義縣民雄鄉鴨母坔61之71號五樓五",
    "normalizedAddress": "嘉義縣民雄鄉鴨母坔61之71號五樓五",
    "referenceRent": 4000,
    "latitude": 23.5319532,
    "longitude": 120.4347818,
    "coordinateSource": "nominatim",
    "coordinatesVerified": false,
    "source": "government",
    "referenceRentSource": "government"
  },
  {
    "id": "gov-264f3ac40989a580",
    "primaryUniversityId": "ccu",
    "universityIds": [
      "ccu"
    ],
    "address": "嘉義縣民雄鄉鎮北村圳溝墘21號三樓之14",
    "normalizedAddress": "嘉義縣民雄鄉鎮北村圳溝墘21號三樓之14",
    "referenceRent": 4700,
    "latitude": 23.57162,
    "longitude": 120.44838,
    "coordinateSource": "fixed_absolute_estimate",
    "coordinatesVerified": false,
    "source": "government",
    "referenceRentSource": "government"
  },
  {
    "id": "gov-221e3373cda29b1b",
    "primaryUniversityId": "ccu",
    "universityIds": [
      "ccu"
    ],
    "address": "嘉義縣民雄鄉鎮北村圳溝墘20號二樓之一",
    "normalizedAddress": "嘉義縣民雄鄉鎮北村圳溝墘20號二樓之一",
    "referenceRent": 5000,
    "latitude": 23.57156,
    "longitude": 120.44828,
    "coordinateSource": "fixed_absolute_estimate",
    "coordinatesVerified": false,
    "source": "government",
    "referenceRentSource": "government"
  },
  {
    "id": "gov-ee599ba0dd231ae1",
    "primaryUniversityId": "ccu",
    "universityIds": [
      "ccu"
    ],
    "address": "嘉義縣民雄鄉鎮北村圳溝墘19號四樓之三",
    "normalizedAddress": "嘉義縣民雄鄉鎮北村圳溝墘19號四樓之三",
    "referenceRent": 4300,
    "latitude": 23.5715,
    "longitude": 120.44818,
    "coordinateSource": "fixed_absolute_estimate",
    "coordinatesVerified": false,
    "source": "government",
    "referenceRentSource": "government"
  },
  {
    "id": "gov-a11814c967cc43bd",
    "primaryUniversityId": "ntust",
    "universityIds": [
      "ntust"
    ],
    "address": "臺北市大安區羅斯福路四段119巷38號",
    "normalizedAddress": "臺北市大安區羅斯福路四段119巷38號",
    "referenceRent": 23000,
    "latitude": 25.0112287,
    "longitude": 121.5376979,
    "coordinateSource": "nominatim",
    "coordinatesVerified": false,
    "source": "government",
    "referenceRentSource": "government"
  },
  {
    "id": "gov-ff27001d5d0b5443",
    "primaryUniversityId": "ntust",
    "universityIds": [
      "ntust"
    ],
    "address": "臺北市中正區羅斯福路四段162號",
    "normalizedAddress": "臺北市中正區羅斯福路四段162號",
    "referenceRent": 18500,
    "latitude": 25.0121146,
    "longitude": 121.5365269,
    "coordinateSource": "nominatim",
    "coordinatesVerified": false,
    "source": "government",
    "referenceRentSource": "government"
  },
  {
    "id": "gov-73fbabc950d74cd3",
    "primaryUniversityId": "ntust",
    "universityIds": [
      "ntust"
    ],
    "address": "臺北市文山區羅斯福路四段210號",
    "normalizedAddress": "臺北市文山區羅斯福路四段210號",
    "referenceRent": 19000,
    "latitude": 25.0106,
    "longitude": 121.53735,
    "coordinateSource": "fixed_absolute_estimate",
    "coordinatesVerified": false,
    "source": "government",
    "referenceRentSource": "government"
  },
  {
    "id": "gov-8c0a5e1877fc1cff",
    "primaryUniversityId": "ntust",
    "universityIds": [
      "ntust"
    ],
    "address": "臺北市文山區羅斯福路四段202號",
    "normalizedAddress": "臺北市文山區羅斯福路四段202號",
    "referenceRent": 30483,
    "latitude": 25.01045,
    "longitude": 121.53718,
    "coordinateSource": "fixed_absolute_estimate",
    "coordinatesVerified": false,
    "source": "government",
    "referenceRentSource": "government"
  },
  {
    "id": "gov-702ad5ab5175f77e",
    "primaryUniversityId": "ntust",
    "universityIds": [
      "ntust"
    ],
    "address": "臺北市文山區羅斯福路四段200號",
    "normalizedAddress": "臺北市文山區羅斯福路四段200號",
    "referenceRent": 18000,
    "latitude": 25.0104,
    "longitude": 121.5371,
    "coordinateSource": "fixed_absolute_estimate",
    "coordinatesVerified": false,
    "source": "government",
    "referenceRentSource": "government"
  },
  {
    "id": "gov-053762df951e69f8",
    "primaryUniversityId": "ntut",
    "universityIds": [
      "ntut"
    ],
    "address": "臺北市大安區忠孝東路三段52號",
    "normalizedAddress": "臺北市大安區忠孝東路三段52號",
    "referenceRent": 47550,
    "latitude": 25.0419,
    "longitude": 121.53582,
    "coordinateSource": "fixed_absolute_estimate",
    "coordinatesVerified": false,
    "source": "government",
    "referenceRentSource": "government"
  },
  {
    "id": "gov-6512b0c9eb183f74",
    "primaryUniversityId": "ntut",
    "universityIds": [
      "ntut"
    ],
    "address": "臺北市大安區忠孝東路三段54號",
    "normalizedAddress": "臺北市大安區忠孝東路三段54號",
    "referenceRent": 45000,
    "latitude": 25.04193,
    "longitude": 121.53606,
    "coordinateSource": "fixed_absolute_estimate",
    "coordinatesVerified": false,
    "source": "government",
    "referenceRentSource": "government"
  },
  {
    "id": "gov-8994b2e45ba4b4a7",
    "primaryUniversityId": "ntut",
    "universityIds": [
      "ntut"
    ],
    "address": "臺北市大安區忠孝東路三段88號",
    "normalizedAddress": "臺北市大安區忠孝東路三段88號",
    "referenceRent": 35000,
    "latitude": 25.04198,
    "longitude": 121.53685,
    "coordinateSource": "fixed_absolute_estimate",
    "coordinatesVerified": false,
    "source": "government",
    "referenceRentSource": "government"
  },
  {
    "id": "gov-48289558b38d8464",
    "primaryUniversityId": "ntut",
    "universityIds": [
      "ntut"
    ],
    "address": "臺北市大安區新生南路一段97巷3號",
    "normalizedAddress": "臺北市大安區新生南路一段97巷3號",
    "referenceRent": 151000,
    "latitude": 25.0411399,
    "longitude": 121.5350061,
    "coordinateSource": "nominatim",
    "coordinatesVerified": false,
    "source": "government",
    "referenceRentSource": "government"
  },
  {
    "id": "gov-a3d67ea316c71d98",
    "primaryUniversityId": "ntut",
    "universityIds": [
      "ntut"
    ],
    "address": "臺北市大安區建國南路一段42號",
    "normalizedAddress": "臺北市大安區建國南路一段42號",
    "referenceRent": 30000,
    "latitude": 25.0432799,
    "longitude": 121.5363961,
    "coordinateSource": "nominatim",
    "coordinatesVerified": false,
    "source": "government",
    "referenceRentSource": "government"
  },
  {
    "id": "gov-45eb52bbba9644a0",
    "primaryUniversityId": "niu",
    "universityIds": [
      "niu"
    ],
    "address": "宜蘭縣宜蘭市神農路二段127號",
    "normalizedAddress": "宜蘭縣宜蘭市神農路二段127號",
    "referenceRent": null,
    "latitude": 24.75149,
    "longitude": 121.751,
    "coordinateSource": "fixed_absolute_estimate",
    "coordinatesVerified": false,
    "source": "government",
    "referenceRentSource": "government"
  },
  {
    "id": "gov-40e46090723eb129",
    "primaryUniversityId": "niu",
    "universityIds": [
      "niu"
    ],
    "address": "宜蘭縣宜蘭市神農路二段125號",
    "normalizedAddress": "宜蘭縣宜蘭市神農路二段125號",
    "referenceRent": null,
    "latitude": 24.75142,
    "longitude": 121.75094,
    "coordinateSource": "fixed_absolute_estimate",
    "coordinatesVerified": false,
    "source": "government",
    "referenceRentSource": "government"
  },
  {
    "id": "gov-9092f9670229e108",
    "primaryUniversityId": "niu",
    "universityIds": [
      "niu"
    ],
    "address": "宜蘭縣宜蘭市神農路二段57巷23號",
    "normalizedAddress": "宜蘭縣宜蘭市神農路二段57巷23號",
    "referenceRent": null,
    "latitude": 24.7521128,
    "longitude": 121.7504278,
    "coordinateSource": "nominatim",
    "coordinatesVerified": false,
    "source": "government",
    "referenceRentSource": "government"
  },
  {
    "id": "gov-d7b13d4e2f205595",
    "primaryUniversityId": "niu",
    "universityIds": [
      "niu"
    ],
    "address": "宜蘭縣宜蘭市神農路二段50號",
    "normalizedAddress": "宜蘭縣宜蘭市神農路二段50號",
    "referenceRent": null,
    "latitude": 24.7492,
    "longitude": 121.7507,
    "coordinateSource": "fixed_absolute_estimate",
    "coordinatesVerified": false,
    "source": "government",
    "referenceRentSource": "government"
  },
  {
    "id": "gov-8036b3e4085b4f7a",
    "primaryUniversityId": "niu",
    "universityIds": [
      "niu"
    ],
    "address": "宜蘭縣宜蘭市復興路一段74之2號",
    "normalizedAddress": "宜蘭縣宜蘭市復興路一段74之2號",
    "referenceRent": null,
    "latitude": 24.7488613,
    "longitude": 121.7514521,
    "coordinateSource": "nominatim",
    "coordinatesVerified": false,
    "source": "government",
    "referenceRentSource": "government"
  }
];
