export const CPUs = [
  { id: 'cpu-7800x3d', name: 'AMD Ryzen 7 7800X3D', brand: 'AMD', socket: 'AM5', tier: 'HIGH', cores: 8, threads: 16, baseClock: '4.2 GHz', price: 399 },
  { id: 'cpu-7600x', name: 'AMD Ryzen 5 7600X', brand: 'AMD', socket: 'AM5', tier: 'MID', cores: 6, threads: 12, baseClock: '4.7 GHz', price: 299 },
  { id: 'cpu-5800x3d', name: 'AMD Ryzen 7 5800X3D', brand: 'AMD', socket: 'AM4', tier: 'HIGH', cores: 8, threads: 16, baseClock: '3.4 GHz', price: 349 },
  { id: 'cpu-5600x', name: 'AMD Ryzen 5 5600X', brand: 'AMD', socket: 'AM4', tier: 'MID', cores: 6, threads: 12, baseClock: '3.7 GHz', price: 199 },
  { id: 'cpu-14900k', name: 'Intel Core i9-14900K', brand: 'Intel', socket: 'LGA1700', tier: 'HIGH', cores: 24, threads: 32, baseClock: '3.2 GHz', price: 549 },
  { id: 'cpu-14700k', name: 'Intel Core i7-14700K', brand: 'Intel', socket: 'LGA1700', tier: 'HIGH', cores: 20, threads: 28, baseClock: '3.4 GHz', price: 399 },
  { id: 'cpu-13600k', name: 'Intel Core i5-13600K', brand: 'Intel', socket: 'LGA1700', tier: 'MID', cores: 14, threads: 20, baseClock: '3.5 GHz', price: 299 }
];

export const GPUs = [
  { id: 'gpu-4090', name: 'NVIDIA RTX 4090', brand: 'NVIDIA', tier: 'HIGH', vram: 24, length: 340, minPower: 850, price: 1599 },
  { id: 'gpu-4080s', name: 'NVIDIA RTX 4080 Super', brand: 'NVIDIA', tier: 'HIGH', vram: 16, length: 310, minPower: 750, price: 999 },
  { id: 'gpu-4070s', name: 'NVIDIA RTX 4070 Super', brand: 'NVIDIA', tier: 'MID', vram: 12, length: 267, minPower: 650, price: 599 },
  { id: 'gpu-4060', name: 'NVIDIA RTX 4060', brand: 'NVIDIA', tier: 'LOW', vram: 8, length: 240, minPower: 500, price: 299 },
  { id: 'gpu-7900xtx', name: 'AMD Radeon RX 7900 XTX', brand: 'AMD', tier: 'HIGH', vram: 24, length: 320, minPower: 800, price: 999 },
  { id: 'gpu-7800xt', name: 'AMD Radeon RX 7800 XT', brand: 'AMD', tier: 'MID', vram: 16, length: 280, minPower: 700, price: 499 },
  { id: 'gpu-7600xt', name: 'AMD Radeon RX 7600 XT', brand: 'AMD', tier: 'LOW', vram: 16, length: 250, minPower: 500, price: 329 }
];

export const Motherboards = [
  { id: 'mb-x670e', name: 'ASUS ROG Crosshair X670E', socket: 'AM5', memoryType: 'DDR5', formFactor: 'ATX', storageInterface: 'NVMe/SATA', tier: 'HIGH', price: 499 },
  { id: 'mb-b650', name: 'MSI MAG B650 Tomahawk', socket: 'AM5', memoryType: 'DDR5', formFactor: 'ATX', storageInterface: 'NVMe/SATA', tier: 'MID', price: 199 },
  { id: 'mb-x570', name: 'Gigabyte X570 AORUS MASTER', socket: 'AM4', memoryType: 'DDR4', formFactor: 'ATX', storageInterface: 'NVMe/SATA', tier: 'HIGH', price: 299 },
  { id: 'mb-b550', name: 'ASUS ROG Strix B550-F', socket: 'AM4', memoryType: 'DDR4', formFactor: 'ATX', storageInterface: 'NVMe/SATA', tier: 'MID', price: 149 },
  { id: 'mb-z790', name: 'MSI MPG Z790 Carbon', socket: 'LGA1700', memoryType: 'DDR5', formFactor: 'ATX', storageInterface: 'NVMe/SATA', tier: 'HIGH', price: 349 },
  { id: 'mb-b760', name: 'ASUS TUF Gaming B760M-PLUS', socket: 'LGA1700', memoryType: 'DDR4', formFactor: 'mATX', storageInterface: 'NVMe/SATA', tier: 'MID', price: 159 }
];

export const RAMs = [
  { id: 'ram-d5-32', name: 'G.Skill Trident Z5 32GB (2x16GB) 6000MHz', memoryType: 'DDR5', capacity: 32, speed: 6000, price: 120 },
  { id: 'ram-d5-64', name: 'Corsair Dominator 64GB (2x32GB) 6400MHz', memoryType: 'DDR5', capacity: 64, speed: 6400, price: 249 },
  { id: 'ram-d4-16', name: 'Corsair Vengeance LPX 16GB (2x8GB) 3200MHz', memoryType: 'DDR4', capacity: 16, speed: 3200, price: 45 },
  { id: 'ram-d4-32', name: 'G.Skill Ripjaws V 32GB (2x16GB) 3600MHz', memoryType: 'DDR4', capacity: 32, speed: 3600, price: 75 }
];

export const Storages = [
  { id: 'str-nvme-4', name: 'Samsung 990 Pro 4TB NVMe SSD', type: 'NVMe', readSpeed: 7450, tier: 'HIGH', price: 349 },
  { id: 'str-nvme-2', name: 'WD Black SN850X 2TB NVMe SSD', type: 'NVMe', readSpeed: 7300, tier: 'HIGH', price: 149 },
  { id: 'str-nvme-1', name: 'Crucial P3 Plus 1TB NVMe SSD', type: 'NVMe', readSpeed: 5000, tier: 'MID', price: 65 },
  { id: 'str-sata-2', name: 'Samsung 870 EVO 2TB SATA SSD', type: 'SATA', readSpeed: 560, tier: 'MID', price: 129 },
  { id: 'str-hdd-4', name: 'Seagate Barracuda 4TB HDD', type: 'HDD', readSpeed: 190, tier: 'LOW', price: 89 }
];

export const PowerSupplies = [
  { id: 'psu-1000', name: 'Corsair RM1000x 1000W 80+ Gold', wattage: 1000, modular: 'Full', rating: 'Gold', price: 169 },
  { id: 'psu-850', name: 'EVGA SuperNOVA 850 G6 850W', wattage: 850, modular: 'Full', rating: 'Gold', price: 139 },
  { id: 'psu-750', name: 'Seasonic Focus GX-750 750W', wattage: 750, modular: 'Full', rating: 'Gold', price: 109 },
  { id: 'psu-650', name: 'Corsair RM650x 650W', wattage: 650, modular: 'Full', rating: 'Gold', price: 89 },
  { id: 'psu-500', name: 'Thermaltake Smart 500W', wattage: 500, modular: 'Non', rating: 'White', price: 49 }
];

export const Cases = [
  { id: 'case-h9', name: 'NZXT H9 Flow Mid-Tower ATX', formFactor: 'ATX', maxGpuLength: 435, price: 159 },
  { id: 'case-4000d', name: 'Corsair 4000D Airflow ATX', formFactor: 'ATX', maxGpuLength: 360, price: 104 },
  { id: 'case-o11d', name: 'Lian Li O11 Dynamic EVO ATX', formFactor: 'ATX', maxGpuLength: 426, price: 149 },
  { id: 'case-ch370', name: 'Deepcool CH370 Micro-ATX', formFactor: 'mATX', maxGpuLength: 320, price: 65 },
  { id: 'case-ap201', name: 'ASUS Prime AP201 Micro-ATX', formFactor: 'mATX', maxGpuLength: 338, price: 79 }
];
