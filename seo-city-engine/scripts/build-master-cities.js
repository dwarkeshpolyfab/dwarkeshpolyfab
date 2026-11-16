const fs = require('fs');
const path = require('path');

// State metadata
const STATE_META = {
  "Gujarat": { code: "GJ", baseRate: 0.8, baseDays: "1 to 2 Days", corridor: "NH-27 / NH-48 / State Expressways" },
  "Rajasthan": { code: "RJ", baseRate: 2.2, baseDays: "2 to 3 Days", corridor: "NH-27 / NH-62 / NH-58" },
  "Maharashtra": { code: "MH", baseRate: 2.8, baseDays: "2 to 3 Days", corridor: "NH-48 via Vadodara / Surat" },
  "Madhya Pradesh": { code: "MP", baseRate: 2.6, baseDays: "2 to 3 Days", corridor: "NH-47 / Indore-Ahmedabad Corridor" },
  "Haryana": { code: "HR", baseRate: 3.5, baseDays: "3 to 4 Days", corridor: "NH-48 / Western Dedicated Corridor" },
  "Punjab": { code: "PB", baseRate: 3.8, baseDays: "3 to 5 Days", corridor: "NH-54 / Amritsar-Jamnagar Corridor" },
  "Uttar Pradesh": { code: "UP", baseRate: 4.2, baseDays: "3 to 5 Days", corridor: "NH-27 / East-West Corridor" },
  "Uttarakhand": { code: "UK", baseRate: 4.8, baseDays: "4 to 6 Days", corridor: "NH-334 / Delhi-Dehradun Highway" },
  "Himachal Pradesh": { code: "HP", baseRate: 5.2, baseDays: "4 to 6 Days", corridor: "NH-105 / Baddi Industrial Highway" },
  "Chhattisgarh": { code: "CG", baseRate: 4.0, baseDays: "3 to 5 Days", corridor: "NH-53 / Surat-Kolkata Corridor" },
  "Bihar": { code: "BR", baseRate: 5.0, baseDays: "4 to 6 Days", corridor: "NH-27 via Gorakhpur / Muzaffarpur" },
  "Jharkhand": { code: "JH", baseRate: 4.8, baseDays: "4 to 6 Days", corridor: "NH-19 / Grand Trunk Road" },
  "West Bengal": { code: "WB", baseRate: 5.5, baseDays: "5 to 7 Days", corridor: "NH-19 / Kolkata Freight Corridor" },
  "Odisha": { code: "OD", baseRate: 5.2, baseDays: "4 to 6 Days", corridor: "NH-53 / Raipur-Sambalpur Highway" },
  "Telangana": { code: "TS", baseRate: 4.0, baseDays: "3 to 4 Days", corridor: "NH-65 / Hyderabad Freight Highway" },
  "Andhra Pradesh": { code: "AP", baseRate: 4.5, baseDays: "3 to 5 Days", corridor: "NH-16 / Coastal Corridor" },
  "Karnataka": { code: "KA", baseRate: 4.2, baseDays: "3 to 5 Days", corridor: "NH-48 / Pune-Bengaluru Highway" },
  "Tamil Nadu": { code: "TN", baseRate: 5.0, baseDays: "4 to 6 Days", corridor: "NH-44 / Chennai-Bengaluru Highway" },
  "Kerala": { code: "KL", baseRate: 5.5, baseDays: "5 to 7 Days", corridor: "NH-544 / Salem-Kochi Highway" },
  "Assam": { code: "AS", baseRate: 7.2, baseDays: "7 to 10 Days", corridor: "NH-27 / Siliguri Corridor" },
  "Meghalaya": { code: "ML", baseRate: 7.8, baseDays: "8 to 11 Days", corridor: "NH-6 / Guwahati-Shillong Highway" },
  "Tripura": { code: "TR", baseRate: 8.5, baseDays: "9 to 12 Days", corridor: "NH-8 / Agartala Highway" },
  "Nagaland": { code: "NL", baseRate: 8.8, baseDays: "9 to 12 Days", corridor: "NH-29 / Dimapur Highway" },
  "Manipur": { code: "MN", baseRate: 9.2, baseDays: "10 to 14 Days", corridor: "NH-37 / Imphal Highway" },
  "Mizoram": { code: "MZ", baseRate: 9.5, baseDays: "10 to 14 Days", corridor: "NH-306 / Aizawl Highway" },
  "Sikkim": { code: "SK", baseRate: 8.0, baseDays: "8 to 11 Days", corridor: "NH-10 / Siliguri-Gangtok Highway" },
  "Arunachal Pradesh": { code: "AR", baseRate: 9.5, baseDays: "10 to 14 Days", corridor: "NH-415 / Itanagar Highway" }
};

// Known specialized industrial hubs and profiles
const INDUSTRIAL_PROFILES = {
  // Gujarat
  "Morbi": { dist: 0, hub: "Morbi-Halwad Road / Ceramic Zone", ind: ["Ceramic Tiles", "Wall Putty", "Tile Adhesives", "Sanitaryware"], prod: ["tile-adhesive-bopp-bags", "bopp-laminated-bags", "cement-bags", "pp-woven-bags"] },
  "Rajkot": { dist: 65, hub: "Aji GIDC / Shapar-Veraval Industrial Area", ind: ["Agro Machinery", "Groundnut Oil Mills", "Engineering", "Pumps"], prod: ["pp-woven-bags", "bopp-laminated-bags", "ldpe-liner-bags"] },
  "Wankaner": { dist: 28, hub: "Wankaner Ceramic Zone / Jinning Mills", ind: ["Ceramic Clays", "Cotton Ginning", "Agro Commodities"], prod: ["pp-woven-bags", "bopp-laminated-bags"] },
  "Tankara": { dist: 22, hub: "Tankara Ginning Hub / APMC", ind: ["Cotton Ginning", "Groundnut Processing", "Agro Seeds"], prod: ["pp-woven-bags", "leno-bags"] },
  "Paddhari": { dist: 45, hub: "Paddhari Industrial Belt / NH-27", ind: ["Agro Processing", "Engineering Ancillaries"], prod: ["pp-woven-bags", "leno-bags"] },
  "Gondal": { dist: 105, hub: "Gondal APMC Yard (Chilli & Groundnut Hub)", ind: ["Chilli Processing", "Spices", "Groundnut Oil", "APMC Grain"], prod: ["leno-bags", "pp-woven-bags", "ldpe-liner-bags"] },
  "Jetpur": { dist: 135, hub: "Jetpur Dyeing & Printing Cluster", ind: ["Textile Processing", "Screen Printing", "Dyeing Auxiliaries"], prod: ["bopp-laminated-bags", "pp-woven-bags"] },
  "Dhoraji": { dist: 145, hub: "Dhoraji Plastic & Agro Hub", ind: ["Plastic Reprocessing", "Edible Oil", "Cotton Seeds"], prod: ["pp-woven-bags", "jumbo-bags"] },
  "Upleta": { dist: 155, hub: "Upleta Ginning & Oil Processing Zone", ind: ["Cottonseed Oil", "Groundnut Cake", "Grains"], prod: ["pp-woven-bags", "ldpe-liner-bags"] },
  "Ahmedabad": { dist: 195, hub: "Aslali Logistics Park / Naroda GIDC / Changodar", ind: ["Chemicals", "Textiles", "Food Processing", "Pharma"], prod: ["ldpe-liner-bags", "bopp-laminated-bags", "anti-slip-bags", "pp-woven-bags"] },
  "Sanand": { dist: 180, hub: "Sanand GIDC / Automobile & Engineering Zone", ind: ["Automobile Parts", "Heavy Engineering", "FMCG Packaging"], prod: ["bopp-laminated-bags", "anti-slip-bags"] },
  "Bavla": { dist: 185, hub: "Bavla Rice Milling Cluster / Grain Mandi", ind: ["Paddy Milling", "Rice Processing", "Animal Feed"], prod: ["rice-packaging-bags", "bopp-laminated-bags", "pp-woven-bags"] },
  "Changodar": { dist: 185, hub: "Changodar Industrial Park / Sarkhej Corridor", ind: ["Pharmaceuticals", "Packaging Units", "Logistics"], prod: ["bopp-laminated-bags", "ldpe-liner-bags"] },
  "Dholka": { dist: 210, hub: "Dholka GIDC / Pharma & Agro Zone", ind: ["Pharma Formulations", "Agro Seed Packaging", "Chemicals"], prod: ["ldpe-liner-bags", "pp-woven-bags"] },
  "Gandhinagar": { dist: 215, hub: "Gandhinagar Electronics SEZ / Kalol Corridor", ind: ["Electronics", "IT Hardware Packaging", "Agro Mills"], prod: ["anti-slip-bags", "pp-woven-bags"] },
  "Kalol": { dist: 210, hub: "Kalol GIDC / IFFCO Fertilizer Zone", ind: ["Chemical Fertilizers", "Industrial Minerals", "Engineering"], prod: ["fertilizer-bags", "ldpe-liner-bags", "jumbo-bags"] },
  "Kadi": { dist: 190, hub: "Kadi Cotton & Ceramic GIDC", ind: ["Cotton Ginning", "Ceramic Vitrified Tiles", "Agro Seeds"], prod: ["pp-woven-bags", "tile-adhesive-bopp-bags"] },
  "Nadiad": { dist: 245, hub: "Nadiad GIDC / Tobacco & Spices Hub", ind: ["Tobacco Processing", "Agro Seeds", "Spices Packaging"], prod: ["bopp-laminated-bags", "pp-woven-bags"] },
  "Anand": { dist: 260, hub: "Vitthal Udyognagar GIDC / Dairy Processing Hub", ind: ["Dairy Powder", "Food Processing", "Engineering"], prod: ["ldpe-liner-bags", "bopp-laminated-bags"] },
  "Kheda": { dist: 230, hub: "Kheda Industrial Belt / Agro Processing", ind: ["Paddy Mills", "Wheat Flour", "Agro Commodities"], prod: ["rice-packaging-bags", "pp-woven-bags"] },
  "Bhavnagar": { dist: 210, hub: "Chitra GIDC / Alang Ancillary Logistics", ind: ["Dehydrated Onion & Garlic", "Chemical Minerals", "Ship Recycling Ancillary"], prod: ["leno-bags", "ldpe-liner-bags", "jumbo-bags"] },
  "Mahuva": { dist: 265, hub: "Mahuva Onion Dehydration Cluster / APMC Yard", ind: ["Onion Dehydration", "Garlic Flakes", "Groundnut Mandi"], prod: ["leno-bags", "pp-woven-bags", "ldpe-liner-bags"] },
  "Amreli": { dist: 175, hub: "Amreli APMC Yard / Agro Processing Zone", ind: ["Sesame Processing", "Groundnut Mills", "Cotton Baling"], prod: ["pp-woven-bags", "leno-bags"] },
  "Babra": { dist: 140, hub: "Babra Agro & Ginning Market", ind: ["Cotton Ginning", "Castor Seed Processing", "Agro Trading"], prod: ["pp-woven-bags", "leno-bags"] },
  "Junagadh": { dist: 170, hub: "Junagadh GIDC / Groundnut Oil & Mango Cluster", ind: ["Groundnut Oil", "Mango Pulp Processing", "Agro Seeds"], prod: ["pp-woven-bags", "leno-bags", "bopp-laminated-bags"] },
  "Veraval": { dist: 240, hub: "Veraval Fisheries & Chemical GIDC", ind: ["Seafood Export Packaging", "Chemicals", "Soda Ash Units"], prod: ["ldpe-liner-bags", "pp-woven-bags", "jumbo-bags"] },
  "Jamnagar": { dist: 95, hub: "Jamnagar Brass Parts GIDC / Reliance DTA Corridor", ind: ["Brass Components", "Petrochemicals", "Salt Works"], prod: ["pp-woven-bags", "jumbo-bags", "ldpe-liner-bags"] },
  "Dhrol": { dist: 50, hub: "Dhrol Agro & Small Scale Engineering", ind: ["Groundnut Sorting", "Agro Seeds", "Fertilizer Trading"], prod: ["pp-woven-bags", "leno-bags"] },
  "Kalavad": { dist: 80, hub: "Kalavad Ginning & Cotton Seed Zone", ind: ["Cotton Ginning", "Castor Seeds", "Agro Products"], prod: ["pp-woven-bags", "leno-bags"] },
  "Surendranagar": { dist: 110, hub: "Wadhwan GIDC / Cotton & Salt Hub", ind: ["Cotton Jinning", "Salt Refineries", "Ceramic Clays"], prod: ["pp-woven-bags", "jumbo-bags"] },
  "Wadhwan": { dist: 112, hub: "Wadhwan Industrial Estate", ind: ["Foundry Products", "Ceramics", "Cotton Baling"], prod: ["pp-woven-bags", "bopp-laminated-bags"] },
  "Dhrangadhra": { dist: 75, hub: "Dhrangadhra Chemical Works / Salt Zone", ind: ["Soda Ash", "Industrial Salt", "Mineral Packaging"], prod: ["ldpe-liner-bags", "jumbo-bags"] },
  "Halvad": { dist: 45, hub: "Halvad APMC Yard / Cotton Ginning Belt", ind: ["Cotton Ginning", "Sesame & Spices", "Mineral Clays"], prod: ["pp-woven-bags", "leno-bags"] },
  "Bhuj": { dist: 180, hub: "Bhuj Industrial Belt / Minerals Hub", ind: ["Bentonite Clay", "Bauxite Processing", "Handicrafts"], prod: ["jumbo-bags", "pp-woven-bags", "bopp-laminated-bags"] },
  "Gandhidham": { dist: 130, hub: "Gandhidham Transport Nagar / Cargo Hub", ind: ["Timber Processing", "Salt Refineries", "Port Logistics"], prod: ["pp-woven-bags", "jumbo-bags", "ldpe-liner-bags"] },
  "Adipur": { dist: 135, hub: "Adipur Industrial Estate / Warehousing", ind: ["Logistics Warehousing", "Chemical Storage", "Packaging"], prod: ["pp-woven-bags", "bopp-laminated-bags"] },
  "Anjar": { dist: 145, hub: "Anjar Welspun City / Mega Industrial Zone", ind: ["Textiles & Pipe Manufacturing", "Chemical Processing", "Heavy Engineering"], prod: ["bopp-laminated-bags", "anti-slip-bags", "jumbo-bags"] },
  "Bhachau": { dist: 95, hub: "Bhachau Highway Corridor / Logistics Hub", ind: ["Edible Oil Packaging", "Salt Processing", "Transshipment"], prod: ["pp-woven-bags", "ldpe-liner-bags"] },
  "Rapar": { dist: 120, hub: "Rapar Mineral & Agro Hub", ind: ["Castor Seeds", "Bentonite Minerals", "Fodder Packaging"], prod: ["pp-woven-bags", "jumbo-bags"] },
  "Mundra": { dist: 175, hub: "Mundra Port SEZ / Adani Logistics Zone", ind: ["Port Export Packaging", "Coal Transshipment", "Edible Oil Refineries"], prod: ["jumbo-bags", "ldpe-liner-bags", "bopp-laminated-bags"] },
  "Kandla": { dist: 140, hub: "Deendayal Port Trust Cargo Complex / SEZ", ind: ["Fertilizer Import Bulk Handling", "Grain Exports", "Liquid Chemicals"], prod: ["fertilizer-bags", "jumbo-bags", "pp-woven-bags"] },
  "Mandvi": { dist: 215, hub: "Mandvi Coastal & Agro Processing Zone", ind: ["Pomegranate Packaging", "Date Palm Processing", "Fisheries"], prod: ["leno-bags", "pp-woven-bags"] },
  "Deesa": { dist: 290, hub: "Deesa Potato Cold Storage & Agro Mandi", ind: ["Potato Cold Storage", "Mustard Seed Processing", "Agro Seeds"], prod: ["leno-bags", "pp-woven-bags", "bopp-laminated-bags"] },
  "Palanpur": { dist: 295, hub: "Palanpur GIDC / Dairy & Diamond Ancillary", ind: ["Banas Dairy Animal Feed", "Flour Mills", "Marble Powder"], prod: ["pp-woven-bags", "ldpe-liner-bags", "bopp-laminated-bags"] },
  "Unjha": { dist: 240, hub: "Unjha Spices APMC Yard (Asia's Largest)", ind: ["Cumin (Jeera) Processing", "Fennel (Saunf)", "Isabgol (Psyllium Husk)"], prod: ["bopp-laminated-bags", "pp-woven-bags", "ldpe-liner-bags"] },
  "Mehsana": { dist: 230, hub: "Mehsana GIDC / Dudhsagar Dairy Feed Hub", ind: ["Cattle Feed Formulators", "Oil Mills", "Chemical Processing"], prod: ["pp-woven-bags", "bopp-laminated-bags"] },
  "Patan": { dist: 235, hub: "Patan Agro & Solar Industrial Belt", ind: ["Cotton Ginning", "Castor Oil", "Spices Milling"], prod: ["pp-woven-bags", "leno-bags"] },
  "Surat": { dist: 440, hub: "Pandesara GIDC / Sachin Industrial Estate / Kadodara", ind: ["Textile Processing", "Synthetic Yarn", "Chemical Auxiliaries", "Sugar Mills"], prod: ["bopp-laminated-bags", "ldpe-liner-bags", "anti-slip-bags"] },
  "Bardoli": { dist: 460, hub: "Bardoli Sugar Factory Belt / Agro Hub", ind: ["Sugar Packaging", "Papaya & Banana Processing", "Paper Mills"], prod: ["pp-woven-bags", "ldpe-liner-bags", "leno-bags"] },
  "Palsana": { dist: 445, hub: "Palsana Textile Processing GIDC", ind: ["Textile Dyeing Chemicals", "Polyester Fabric Wrapping", "Industrial Plastic"], prod: ["bopp-laminated-bags", "pp-woven-bags"] },
  "Vapi": { dist: 530, hub: "Vapi GIDC / First Phase Chemical Belt", ind: ["Specialty Chemicals", "Dyes & Pigments", "Paper Packaging", "Paints"], prod: ["ldpe-liner-bags", "bopp-laminated-bags", "anti-slip-bags"] },
  "Valsad": { dist: 505, hub: "Gundlav GIDC / Chemical & Mango Processing", ind: ["Chemicals", "Mango Pulp", "Textile Machinery Ancillaries"], prod: ["ldpe-liner-bags", "pp-woven-bags"] },
  "Ankleshwar": { dist: 380, hub: "Ankleshwar GIDC (Chemical Capital)", ind: ["Pesticides & Agrochemicals", "Bulk Drugs (API)", "Pigments & Dyes"], prod: ["ldpe-liner-bags", "anti-slip-bags", "jumbo-bags", "bopp-laminated-bags"] },
  "Bharuch": { dist: 360, hub: "Narmada GIDC / Dahej Expressway Hub", ind: ["Fertilizers (GNFC)", "Chemical Intermediates", "Synthetic Fibers"], prod: ["fertilizer-bags", "ldpe-liner-bags", "jumbo-bags"] },
  "Dahej": { dist: 395, hub: "Dahej Petroleum, Chemicals & Petrochemicals SEZ", ind: ["Petrochemical Resins", "Caustic Soda", "Heavy Industrial Chemicals"], prod: ["jumbo-bags", "ldpe-liner-bags", "anti-slip-bags"] },
  "Vadodara": { dist: 300, hub: "Makarpura GIDC / Waghodia / Ranoli Chemical Zone", ind: ["Heavy Chemicals", "Fertilizers (GSFC)", "Petrochemicals", "Engineering"], prod: ["fertilizer-bags", "ldpe-liner-bags", "pp-woven-bags", "jumbo-bags"] },
  "Halol": { dist: 335, hub: "Halol GIDC / Automobile & Rubber Zone", ind: ["Automobile Plastics", "Rubber Formulations", "Industrial Adhesives"], prod: ["bopp-laminated-bags", "tile-adhesive-bopp-bags"] },
  "Godhra": { dist: 350, hub: "Godhra GIDC / Mineral Grinding Mills", ind: ["Dolomite & Calcite Powder", "Quartz Minerals", "Agro Seeds"], prod: ["pp-woven-bags", "jumbo-bags"] },
  "Dahod": { dist: 410, hub: "Dahod Railway Ancillary & Agro Hub", ind: ["Railway Locomotives", "Grain Trading", "Pulses Milling"], prod: ["pp-woven-bags", "rice-packaging-bags"] },
  "Himmatnagar": { dist: 255, hub: "Motipura GIDC / Ceramic Tiles Belt", ind: ["Ceramic Sanitaryware", "Tile Adhesives", "Wall Putty", "Groundnut Mills"], prod: ["tile-adhesive-bopp-bags", "cement-bags", "pp-woven-bags"] },
  "Modasa": { dist: 275, hub: "Modasa APMC / Agro Processing Zone", ind: ["Cotton Ginning", "Castor Seed", "Wheat & Maize Processing"], prod: ["pp-woven-bags", "leno-bags"] },
  "Botad": { dist: 160, hub: "Botad Cotton Market / Diamond Ancillary", ind: ["Cotton Baling", "Oil Mills", "Groundnut Packaging"], prod: ["pp-woven-bags", "leno-bags"] },
  "Rajula": { dist: 245, hub: "Pipavav Port Logistics Corridor", ind: ["Port Logistics Cargo", "Mineral Gypsum", "Cement Manufacturing"], prod: ["cement-bags", "jumbo-bags", "pp-woven-bags"] },
  "Savarkundla": { dist: 205, hub: "Savarkundla Weighing Scale & Iron Industry", ind: ["Weighing Scales", "Cotton Jinning", "Agro Commodity Packaging"], prod: ["pp-woven-bags", "bopp-laminated-bags"] },

  // Maharashtra Key
  "Mumbai": { dist: 710, hub: "Bhiwandi Logistics Hub / Kalamboli / Vashi APMC", ind: ["Commercial Exports", "FMCG Wholesale", "Chemical Distribution", "Plastics"], prod: ["bopp-laminated-bags", "anti-slip-bags", "ldpe-liner-bags"] },
  "Navi Mumbai": { dist: 725, hub: "Taloja MIDC / Vashi Grain Mandi / JNPT Corridor", ind: ["Port Cargo (JNPT)", "Grain Wholesalers", "Chemicals"], prod: ["rice-packaging-bags", "jumbo-bags", "ldpe-liner-bags"] },
  "Thane": { dist: 690, hub: "Wagle Industrial Estate / Kolshet Road", ind: ["Chemicals", "Paints", "Specialty Plastics"], prod: ["bopp-laminated-bags", "ldpe-liner-bags"] },
  "Bhiwandi": { dist: 685, hub: "Bhiwandi Warehousing Hub (India's Largest 3PL Park)", ind: ["E-Commerce Fulfilment", "Textile Sizing", "3PL Logistics Packaging"], prod: ["pp-woven-bags", "bopp-laminated-bags", "anti-slip-bags"] },
  "Pune": { dist: 780, hub: "Bhosari MIDC / Chakan / Hadapsar Logistics Park", ind: ["Automotive Components", "Food & Sugar Processing", "Heavy Engineering"], prod: ["bopp-laminated-bags", "anti-slip-bags", "jumbo-bags"] },
  "Pimpri-Chinchwad": { dist: 770, hub: "Pimpri MIDC / Akurdi Auto Cluster", ind: ["Automobile Parts Packaging", "Forgings", "Industrial Polymers"], prod: ["anti-slip-bags", "pp-woven-bags"] },
  "Chakan": { dist: 760, hub: "Chakan Industrial Area (Phase 1-4 Auto SEZ)", ind: ["Heavy Vehicle Spares", "Precision Engineering", "Industrial Export Bags"], prod: ["anti-slip-bags", "jumbo-bags"] },
  "Talegaon": { dist: 745, hub: "Talegaon MIDC / Floriculture & Engineering Zone", ind: ["Floriculture Agro Cargo", "Auto Assembly", "Packaging Warehouses"], prod: ["leno-bags", "pp-woven-bags"] },
  "Ranjangaon": { dist: 815, hub: "Ranjangaon MIDC (Five Star Industrial Area)", ind: ["Home Appliances", "Electronic Hardware", "Food Processing"], prod: ["bopp-laminated-bags", "anti-slip-bags"] },
  "Nashik": { dist: 630, hub: "Ambad MIDC / Satpur MIDC / Ozar Onion Belt", ind: ["Onion Lasalgaon Mandi", "Wine & Grape Processing", "Electrical Engineering"], prod: ["leno-bags", "bopp-laminated-bags", "pp-woven-bags"] },
  "Sinnar": { dist: 655, hub: "Malegaon MIDC Sinnar / Textile & Paper Zone", ind: ["Paper Mills", "Engineering", "Pharmaceuticals"], prod: ["pp-woven-bags", "ldpe-liner-bags"] },
  "Ahmednagar": { dist: 760, hub: "Nagapur MIDC / Sugar Belt Transport Hub", ind: ["Sugar Factories", "Dairy Processing", "Auto Forgings"], prod: ["pp-woven-bags", "ldpe-liner-bags"] },
  "Sangli": { dist: 890, hub: "Kupwad MIDC / Turmeric & Raisin APMC Hub", ind: ["Turmeric Processing", "Raisins (Kishmish)", "Sugar Mills"], prod: ["bopp-laminated-bags", "pp-woven-bags", "leno-bags"] },
  "Miraj": { dist: 895, hub: "Miraj MIDC / Pharmaceutical & Agro Corridor", ind: ["Pharma Packaging", "Sugar Ancillaries", "Jaggery (Gud) Packaging"], prod: ["ldpe-liner-bags", "pp-woven-bags"] },
  "Kolhapur": { dist: 915, hub: "Shiroli MIDC / Gokul Shirgaon / Foundry Cluster", ind: ["Sugar Factories", "Foundry & Castings", "Cattle Feed (Gokul Dairy)"], prod: ["pp-woven-bags", "bopp-laminated-bags", "jumbo-bags"] },
  "Satara": { dist: 835, hub: "Satara MIDC / Food Processing & Forging Hub", ind: ["Sugar Co-operatives", "Fruit Packaging (Strawberries)", "Heavy Engineering"], prod: ["pp-woven-bags", "leno-bags"] },
  "Karad": { dist: 875, hub: "Karad Industrial Estate / Agro Machinery", ind: ["Sugarcane Mills", "Pumps & Motors", "Fertilizer Trading"], prod: ["pp-woven-bags", "fertilizer-bags"] },
  "Solapur": { dist: 870, hub: "Chincholi MIDC / Textile & Sugar Hub", ind: ["Terry Towel & Chaddar Mills", "Sugar Co-operatives", "Pomegranate Mandi"], prod: ["pp-woven-bags", "bopp-laminated-bags", "leno-bags"] },
  "Chhatrapati Sambhajinagar": { dist: 680, hub: "Waluj MIDC / Shendra DMIC / Chikalthana", ind: ["Automobile Assembly", "Beer & Beverages", "Pharmaceuticals"], prod: ["bopp-laminated-bags", "anti-slip-bags", "ldpe-liner-bags"] },
  "Jalna": { dist: 720, hub: "Jalna Steel & Hybrid Seeds Hub", ind: ["Steel TMT Bars", "Hybrid Agricultural Seeds (Mahyco)", "Pulses Milling"], prod: ["bopp-laminated-bags", "pp-woven-bags"] },
  "Nagpur": { dist: 980, hub: "Butibori MIDC / MIHAN SEZ / Hingna Industrial Area", ind: ["Oranges Cold Chain", "Thermal Power Fly Ash", "Chemicals & Mining"], prod: ["leno-bags", "cement-bags", "jumbo-bags"] },

  // Punjab Key
  "Ludhiana": { dist: 1180, hub: "Transport Nagar Ludhiana / Focal Point Industrial Area", ind: ["Rice Mills (Basmati)", "Wheat Flour (Atta)", "Bicycle & Engineering", "Hosiery Yarn"], prod: ["rice-packaging-bags", "bopp-laminated-bags", "pp-woven-bags"] },
  "Jalandhar": { dist: 1210, hub: "Leather Complex / Sports Goods Industrial Area", ind: ["Sports Equipment", "Rubber Goods", "Agricultural Implements"], prod: ["pp-woven-bags", "bopp-laminated-bags"] },
  "Amritsar": { dist: 1260, hub: "Focal Point Mehta Road / Border Agro Hub", ind: ["Basmati Rice Export Mills", "Textile Dyeing", "Food Processing"], prod: ["rice-packaging-bags", "bopp-laminated-bags"] },
  "Bathinda": { dist: 1040, hub: "Bathinda Cotton & Refinery Hub / Guru Gobind Singh Refinery", ind: ["Cotton Ginning", "Fertilizers (NFL)", "Petrochemical Polymers"], prod: ["pp-woven-bags", "fertilizer-bags", "jumbo-bags"] },
  "Panipat": { dist: 1110, hub: "Panipat Handloom Cluster / Refinery Zone", ind: ["Yarn Spinning", "Shoddy Wool Blankets", "Petrochemical Chemicals"], prod: ["pp-woven-bags", "bopp-laminated-bags"] },
  "Karnal": { dist: 1130, hub: "Karnal Basmati Rice Hub / NDRI Dairy Zone", ind: ["Basmati Rice Milling", "Dairy Feeds", "Agro Machinery"], prod: ["rice-packaging-bags", "bopp-laminated-bags"] },

  // Rajasthan Key
  "Jaipur": { dist: 780, hub: "VKI Industrial Area / Sitapura Industrial Area / Bagru", ind: ["Minerals Processing", "Garments Packaging", "Ceramic Tiles Trading", "Spices"], prod: ["bopp-laminated-bags", "tile-adhesive-bopp-bags", "pp-woven-bags"] },
  "Udaipur": { dist: 460, hub: "Madri Industrial Area / Sukher Marble Belt", ind: ["Marble & Granite Slurry", "Zinc Smelting (HZL)", "Mineral Powders"], prod: ["jumbo-bags", "tile-adhesive-bopp-bags", "pp-woven-bags"] },
  "Kishangarh": { dist: 680, hub: "Kishangarh Marble Market (Asia's Largest)", ind: ["Marble & Granite Tile Slurry", "Wall Putty", "Textile Processing"], prod: ["tile-adhesive-bopp-bags", "cement-bags", "jumbo-bags"] },
  "Kota": { dist: 690, hub: "Indraprastha Industrial Area Kota / Fertilizer Belt", ind: ["Fertilizers (CFCL)", "Kota Stone Slabs", "Soybean Oil Refineries"], prod: ["fertilizer-bags", "pp-woven-bags", "jumbo-bags"] },
  "Bhilwara": { dist: 580, hub: "Bhilwara Textile City / Mineral Processing", ind: ["Suiting Fabric Packaging", "Feldspar & Quartz Minerals", "Mica Processing"], prod: ["bopp-laminated-bags", "jumbo-bags", "pp-woven-bags"] },

  // MP Key
  "Indore": { dist: 560, hub: "Pithampur Auto & Pharma SEZ / Sanwer Road Industrial Area", ind: ["Soybean Crushing & Meal", "Pharma Formulations", "Confectionery & Snacks"], prod: ["pp-woven-bags", "bopp-laminated-bags", "ldpe-liner-bags"] },
  "Pithampur": { dist: 535, hub: "Pithampur Sector 1-3 MIDC", ind: ["Automobile Forgings", "Bulk Chemicals", "Pharma Formulations"], prod: ["anti-slip-bags", "ldpe-liner-bags"] },

  // South Key
  "Hyderabad": { dist: 1040, hub: "Patancheru Industrial Area / Jeedimetla / Cherlapally", ind: ["Bulk Pharmaceuticals (API)", "Seeds & Agro Formulations", "Pesticides", "Plastics"], prod: ["ldpe-liner-bags", "bopp-laminated-bags", "pp-woven-bags"] },
  "Bengaluru": { dist: 1320, hub: "Peenya Industrial Area / Electronic City / Hoskote Logistics", ind: ["Electronics Packaging", "Coffee & Spices Exports", "Light Engineering"], prod: ["anti-slip-bags", "bopp-laminated-bags"] },
  "Chennai": { dist: 1620, hub: "Ambattur Industrial Estate / Sriperumbudur / Ennore Port", ind: ["Automobile Assembly", "Chemical Formulations", "Port Cargo Packaging"], prod: ["anti-slip-bags", "jumbo-bags"] },
  "Coimbatore": { dist: 1540, hub: "SIDCO Industrial Estate / Kurichi / Peelamedu", ind: ["Textile Yarn Mills", "Submersible Pumps", "Poultry Feeds"], prod: ["pp-woven-bags", "bopp-laminated-bags"] },
  "Guntur": { dist: 1290, hub: "Guntur Mirchi Yard / Tobacco Board Logistics", ind: ["Dry Red Chilli Packaging", "Tobacco Leaves Export", "Cotton Ginning"], prod: ["leno-bags", "pp-woven-bags", "bopp-laminated-bags"] }
};

// Function to generate smart slug
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

// Read raw cities list from parse-cities.js
const parseScript = fs.readFileSync(path.join(__dirname, 'parse-cities.js'), 'utf8');
const match = parseScript.match(/const rawData = (\[[\s\S]*?\]);/);
if (!match) {
  console.error("Could not find rawData in parse-cities.js");
  process.exit(1);
}
const rawCities = eval(match[1]);

// Deduplicate
const uniqueCities = [];
const seen = new Set();
for (const item of rawCities) {
  const key = `${item.city.toLowerCase()}|${item.state.toLowerCase()}`;
  if (!seen.has(key)) {
    seen.add(key);
    uniqueCities.push(item);
  }
}

console.log(`Processing ${uniqueCities.length} unique cities...`);

// State approximate distances from Morbi center if city not in custom profile
const STATE_AVG_DIST = {
  "Gujarat": 220,
  "Rajasthan": 650,
  "Maharashtra": 780,
  "Madhya Pradesh": 650,
  "Haryana": 1050,
  "Punjab": 1150,
  "Uttar Pradesh": 1250,
  "Uttarakhand": 1350,
  "Himachal Pradesh": 1400,
  "Chhattisgarh": 1100,
  "Bihar": 1600,
  "Jharkhand": 1550,
  "West Bengal": 1850,
  "Odisha": 1600,
  "Telangana": 1050,
  "Andhra Pradesh": 1350,
  "Karnataka": 1250,
  "Tamil Nadu": 1650,
  "Kerala": 1750,
  "Assam": 2300,
  "Meghalaya": 2400,
  "Tripura": 2600,
  "Nagaland": 2700,
  "Manipur": 2800,
  "Mizoram": 2850,
  "Sikkim": 2100,
  "Arunachal Pradesh": 2900
};

const masterCities = uniqueCities.map(item => {
  const cityName = item.city;
  const stateName = item.state;
  const stateInfo = STATE_META[stateName] || { code: "IN", baseRate: 4.0, baseDays: "3 to 5 Days", corridor: "National Highway Network" };
  const prof = INDUSTRIAL_PROFILES[cityName];

  const citySlug = slugify(cityName);
  const cityId = `${stateInfo.code.toLowerCase()}-${citySlug}`;

  let approxDist = prof ? prof.dist : (STATE_AVG_DIST[stateName] || 800);
  // Slight deterministic variance for generic cities so every city has realistic unique distance
  if (!prof) {
    let hash = 0;
    for (let i = 0; i < cityName.length; i++) hash = (hash * 31 + cityName.charCodeAt(i)) % 150;
    approxDist = approxDist + hash - 75;
    if (approxDist < 50) approxDist = 120;
  }

  // Freight calculation: base rate + distance scaling
  let freightRate = 0;
  if (approxDist === 0) {
    freightRate = 0.50; // Local plant pickup / delivery
  } else if (approxDist <= 100) {
    freightRate = 0.90;
  } else if (approxDist <= 250) {
    freightRate = 1.40 + (approxDist - 100) * 0.003;
  } else if (approxDist <= 500) {
    freightRate = 1.80 + (approxDist - 250) * 0.003;
  } else if (approxDist <= 800) {
    freightRate = 2.60 + (approxDist - 500) * 0.0025;
  } else if (approxDist <= 1200) {
    freightRate = 3.40 + (approxDist - 800) * 0.002;
  } else if (approxDist <= 1600) {
    freightRate = 4.20 + (approxDist - 1200) * 0.002;
  } else {
    freightRate = 5.00 + (approxDist - 1600) * 0.002;
  }
  freightRate = Math.round(freightRate * 100) / 100;

  // Transit days
  let transitDays = stateInfo.baseDays;
  if (approxDist <= 80) transitDays = "Same Day / 1 Day";
  else if (approxDist <= 250) transitDays = "1 Day";
  else if (approxDist <= 500) transitDays = "1 to 2 Days";
  else if (approxDist <= 850) transitDays = "2 to 3 Days";
  else if (approxDist <= 1300) transitDays = "3 to 4 Days";
  else if (approxDist <= 1800) transitDays = "4 to 6 Days";
  else transitDays = "7 to 10 Days";

  // Transport hub
  const transportHub = prof
    ? prof.hub
    : `${cityName} Transport Nagar / Industrial Area / APMC Logistics Hub`;

  // Key local industries
  const localIndustries = prof
    ? prof.ind
    : [`Agro Commodity Packaging`, `Grains & Flour Milling`, `Local Manufacturing Units`, `Fertilizer & Chemical Trading`];

  // Recommended products
  const recProducts = prof
    ? prof.prod
    : ["pp-woven-bags", "bopp-laminated-bags", "leno-bags", "ldpe-liner-bags"];

  return {
    city_id: cityId,
    city_name: cityName,
    city_slug: citySlug,
    state: stateName,
    state_code: stateInfo.code,
    region: item.region,
    approx_distance_from_morbi_km: approxDist,
    primary_transport_hub: transportHub,
    primary_highway_corridor: stateInfo.corridor,
    estimated_transit_days: transitDays,
    freight_rate_per_kg: freightRate,
    min_truckload_weight_kg: approxDist <= 250 ? 1500 : 2500,
    key_local_industries: localIndustries,
    recommended_products: recProducts
  };
});

// Sort by State, then by city name
masterCities.sort((a, b) => {
  if (a.state === b.state) return a.city_name.localeCompare(b.city_name);
  return a.state.localeCompare(b.state);
});

// Save to data/cities.json
const citiesJsonPath = path.join(__dirname, '..', 'data', 'cities.json');
fs.writeFileSync(citiesJsonPath, JSON.stringify(masterCities, null, 2), 'utf8');
console.log(`✓ Successfully updated ${citiesJsonPath} with ${masterCities.length} cities!`);

// Save to data/cities.csv
const citiesCsvPath = path.join(__dirname, '..', 'data', 'cities.csv');
const csvHeaders = "city_id,city_name,city_slug,state,state_code,region,approx_distance_from_morbi_km,freight_rate_per_kg,estimated_transit_days,primary_transport_hub\n";
const csvRows = masterCities.map(c => 
  `"${c.city_id}","${c.city_name}","${c.city_slug}","${c.state}","${c.state_code}","${c.region}",${c.approx_distance_from_morbi_km},${c.freight_rate_per_kg},"${c.estimated_transit_days}","${c.primary_transport_hub.replace(/"/g, '""')}"`
).join('\n');
fs.writeFileSync(citiesCsvPath, csvHeaders + csvRows, 'utf8');
console.log(`✓ Successfully updated ${citiesCsvPath}`);
