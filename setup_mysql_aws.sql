-- setup_mysql_aws.sql
-- Run with: mysql -u root -p < setup_mysql_aws.sql

CREATE DATABASE IF NOT EXISTS `AWS` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `AWS`;

-- 1. User (Customer) Credentials Table
CREATE TABLE IF NOT EXISTS `user_credentials` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `full_name` VARCHAR(150) NOT NULL,
    `email` VARCHAR(191) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20) DEFAULT NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Seller (Farmer) Credentials Table
CREATE TABLE IF NOT EXISTS `seller_credentials` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `full_name` VARCHAR(150) NOT NULL,
    `email` VARCHAR(191) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `farm_name` VARCHAR(200) NOT NULL,
    `district` VARCHAR(100) DEFAULT NULL,
    `phone` VARCHAR(20) DEFAULT NULL,
    `is_verified` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Admin Credentials Table
CREATE TABLE IF NOT EXISTS `admin_credentials` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `full_name` VARCHAR(150) NOT NULL,
    `email` VARCHAR(191) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `access_level` VARCHAR(50) DEFAULT 'SUPER_ADMIN',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. User Orders History Table (Isolated by user_email)
CREATE TABLE IF NOT EXISTS `user_orders_history` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `order_id` VARCHAR(100) NOT NULL UNIQUE,
    `user_email` VARCHAR(191) NOT NULL,
    `user_name` VARCHAR(150) NOT NULL,
    `order_date` VARCHAR(100) NOT NULL,
    `order_month` VARCHAR(50) NOT NULL,
    `items_json` JSON NOT NULL,
    `total_amount` DECIMAL(10, 2) NOT NULL,
    `payment_method` VARCHAR(50) DEFAULT 'UPI',
    `delivery_address` JSON DEFAULT NULL,
    `order_status` VARCHAR(100) DEFAULT 'Order Placed (In Transit 🚚)',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_user_email` (`user_email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Seller Products Table (Isolated by seller_email)
CREATE TABLE IF NOT EXISTS `seller_products` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `product_id` VARCHAR(100) NOT NULL UNIQUE,
    `seller_email` VARCHAR(191) NOT NULL,
    `seller_name` VARCHAR(150) NOT NULL,
    `product_name` VARCHAR(200) NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `base_price` DECIMAL(10, 2) NOT NULL,
    `stock_quantity` INT NOT NULL DEFAULT 0,
    `unit` VARCHAR(20) DEFAULT 'kg',
    `image_icon` VARCHAR(50) DEFAULT '🌾',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_seller_email` (`seller_email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Seed Demo Admin & Default Customer
-- ============================================================
INSERT IGNORE INTO `admin_credentials` (`full_name`, `email`, `password_hash`, `access_level`)
VALUES ('Platform Admin', 'admin@farm.com', 'admin123', 'SUPER_ADMIN');

INSERT IGNORE INTO `user_credentials` (`full_name`, `email`, `password_hash`, `phone`)
VALUES ('Ananya Sharma', 'user@farm.com', 'user123', '9876543210');

-- ============================================================
-- Seed Verified Farm Sellers (From Marketplace Catalog)
-- ============================================================
INSERT IGNORE INTO `seller_credentials` (`full_name`, `email`, `password_hash`, `farm_name`, `district`, `phone`, `is_verified`)
VALUES
('Ramesh Patel', 'seller@farm.com', 'seller123', 'Patel Organic Agro Farm', 'North', '9876543200', TRUE),
('Rajesh Sharma', 'himachal.apple@farm.com', 'seller123', 'Himachal Apple Orchards', 'North', '9876543001', TRUE),
('Ramesh Patel', 'kisan.agro@farm.com', 'seller123', 'Kisan Agro Collective', 'West', '9876543002', TRUE),
('Suresh Desai', 'ratnagiri.farms@farm.com', 'seller123', 'Ratnagiri Farms', 'West', '9876543003', TRUE),
('Vikas Deshmukh', 'nagpur.citrus@farm.com', 'seller123', 'Nagpur Citrus Co.', 'Central', '9876543004', TRUE),
('Pravin Jadhav', 'nashik.vineyards@farm.com', 'seller123', 'Nashik Valley Vineyards', 'West', '9876543005', TRUE),
('Anand Bhosale', 'mahabaleshwar.berries@farm.com', 'seller123', 'Mahabaleshwar Berry Farm', 'West', '9876543006', TRUE),
('Murugan Swamy', 'nilgiri.hills@farm.com', 'seller123', 'Nilgiri Hills Organic', 'South', '9876543007', TRUE),
('Ranganathan K.', 'kaveri.basin@farm.com', 'seller123', 'Kaveri Basin Produce', 'South', '9876543008', TRUE),
('Bikram Barua', 'assam.agro@farm.com', 'seller123', 'Assam Valley Agro', 'East', '9876543009', TRUE),
('Kushalappa B.', 'kodagu.highlands@farm.com', 'seller123', 'Kodagu Highlands Farm', 'South', '9876543010', TRUE),
('Satish Pandey', 'allahabad.guava@farm.com', 'seller123', 'Allahabad Guava Grove', 'North', '9876543011', TRUE),
('Venkateswara Rao', 'krishna.delta@farm.com', 'seller123', 'Krishna Delta Farms', 'South', '9876543012', TRUE),
('Tsering Dorjee', 'arunachal.fresh@farm.com', 'seller123', 'Arunachal Fresh Orchards', 'East', '9876543013', TRUE),
('Dadasaheb Gaikwad', 'solapur.pomegranates@farm.com', 'seller123', 'Solapur Ruby Pomegranates', 'West', '9876543014', TRUE),
('Bhavesh Chawda', 'gujarat.exotic@farm.com', 'seller123', 'Gujarat Exotic Fruits', 'West', '9876543015', TRUE),
('Mohan Rawat', 'uttarakhand.orchards@farm.com', 'seller123', 'Uttarakhand Mountain Orchards', 'North', '9876543016', TRUE),
('Ghulam Mohammad', 'kashmir.valley@farm.com', 'seller123', 'Kashmir Valley Growers', 'North', '9876543017', TRUE),
('Padam Singh Negi', 'kinnaur.hills@farm.com', 'seller123', 'Kinnaur Hill Orchards', 'North', '9876543018', TRUE),
('Basavaraj Patil', 'dharwad.agro@farm.com', 'seller123', 'Dharwad Agro Green', 'South', '9876543019', TRUE),
('Sachin Jagtap', 'pune.figs@farm.com', 'seller123', 'Pune Fig Cultivators', 'West', '9876543020', TRUE),
('Ramendra Prasad', 'muzaffarpur.lychee@farm.com', 'seller123', 'Muzaffarpur Shahi Lychee', 'East', '9876543021', TRUE),
('Srinivasulu Naidu', 'andhra.citrus@farm.com', 'seller123', 'Andhra Citrus Hub', 'South', '9876543022', TRUE),
('Lalrintluanga Sailo', 'mizoram.organics@farm.com', 'seller123', 'Mizoram Organics', 'East', '9876543023', TRUE),
('Hormusji Irani', 'dahanu.gholvad@farm.com', 'seller123', 'Dahanu Gholvad Farms', 'West', '9876543024', TRUE),
('Jose Mathew', 'wayanad.spices@farm.com', 'seller123', 'Wayanad Spices & Fruits', 'South', '9876543025', TRUE),
('Dnyaneshwar Patil', 'sahyadri.agri@farm.com', 'seller123', 'Sahyadri Agri Farmer Co.', 'West', '9876543026', TRUE),
('Sivasankar M.', 'ooty.roots@farm.com', 'seller123', 'Ooty Organic Roots', 'South', '9876543027', TRUE),
('Kannan Pillai', 'nilgiri.agro@farm.com', 'seller123', 'Nilgiri Agro Farms', 'South', '9876543028', TRUE),
('Gaurav Singhal', 'greenfield.polyhouse@farm.com', 'seller123', 'Greenfield Polyhouse', 'North', '9876543029', TRUE),
('Manoj Yadav', 'agra.potato@farm.com', 'seller123', 'Agra Potato Collective', 'North', '9876543030', TRUE),
('Kishor Kadam', 'lasalgaon.onion@farm.com', 'seller123', 'Lasalgaon Farmer Trust', 'West', '9876543031', TRUE),
('Balwinder Singh', 'golden.harvest@farm.com', 'seller123', 'Golden Harvest Farms', 'North', '9876543032', TRUE),
('Harpreet Gill', 'punjab.greens@farm.com', 'seller123', 'Punjab Greens Collective', 'North', '9876543033', TRUE),
('Khemraj Thakur', 'himachal.fields@farm.com', 'seller123', 'Himachal Farm Fields', 'North', '9876543034', TRUE),
('Dinesh Dhakar', 'mandsaur.spice@farm.com', 'seller123', 'Mandsaur Spice Collective', 'Central', '9876543035', TRUE),
('Naresh Kashyap', 'solan.mushrooms@farm.com', 'seller123', 'Solan Organic Mushrooms', 'North', '9876543036', TRUE),
('Subba Reddy', 'guntur.spices@farm.com', 'seller123', 'Guntur Spice Farmers', 'South', '9876543037', TRUE);

-- ============================================================
-- Seed All 52 Fresh Produce Items into seller_products
-- ============================================================
INSERT IGNORE INTO `seller_products` (`product_id`, `seller_email`, `seller_name`, `product_name`, `category`, `base_price`, `stock_quantity`, `unit`, `image_icon`)
VALUES
('f1', 'himachal.apple@farm.com', 'Himachal Apple Orchards', 'Red Delicious Apple', 'fruit', 180.0, 120, 'kg', '🍎'),
('f2', 'kisan.agro@farm.com', 'Kisan Agro Collective', 'Cavendish Banana', 'fruit', 50.0, 200, 'dozen', '🍌'),
('f3', 'ratnagiri.farms@farm.com', 'Ratnagiri Farms', 'Alphonso Mango', 'fruit', 450.0, 45, 'kg', '🥭'),
('f4', 'nagpur.citrus@farm.com', 'Nagpur Citrus Co.', 'Valencia Orange', 'fruit', 110.0, 90, 'kg', '🍊'),
('f5', 'nashik.vineyards@farm.com', 'Nashik Valley Vineyards', 'Green Grapes', 'fruit', 120.0, 60, 'kg', '🍇'),
('f6', 'nashik.vineyards@farm.com', 'Nashik Valley Vineyards', 'Red Seedless Grapes', 'fruit', 140.0, 55, 'kg', '🍇'),
('f7', 'mahabaleshwar.berries@farm.com', 'Mahabaleshwar Berry Farm', 'Fresh Strawberry', 'fruit', 160.0, 35, 'pack', '🍓'),
('f8', 'nilgiri.hills@farm.com', 'Nilgiri Hills Organic', 'Blueberry Box', 'fruit', 290.0, 25, 'box', '🫐'),
('f9', 'kaveri.basin@farm.com', 'Kaveri Basin Produce', 'Watermelon (Whole)', 'fruit', 90.0, 30, 'pc', '🍉'),
('f10', 'assam.agro@farm.com', 'Assam Valley Agro', 'Sweet Pineapple', 'fruit', 75.0, 40, 'pc', '🍍'),
('f11', 'kodagu.highlands@farm.com', 'Kodagu Highlands Farm', 'Hass Avocado', 'fruit', 190.0, 80, 'pc', '🥑'),
('f12', 'allahabad.guava@farm.com', 'Allahabad Guava Grove', 'Pink Guava', 'fruit', 80.0, 75, 'kg', '🍐'),
('f13', 'krishna.delta@farm.com', 'Krishna Delta Farms', 'Ripe Papaya', 'fruit', 65.0, 50, 'kg', '🍈'),
('f14', 'arunachal.fresh@farm.com', 'Arunachal Fresh Orchards', 'Kiwi Fruit', 'fruit', 130.0, 85, 'pack (3pcs)', '🥝'),
('f15', 'solapur.pomegranates@farm.com', 'Solapur Ruby Pomegranates', 'Pomegranate', 'fruit', 210.0, 65, 'kg', '🍎'),
('f16', 'gujarat.exotic@farm.com', 'Gujarat Exotic Fruits', 'Red Dragon Fruit', 'fruit', 180.0, 20, 'pc', '🐲'),
('f17', 'uttarakhand.orchards@farm.com', 'Uttarakhand Mountain Orchards', 'Sweet Peach', 'fruit', 220.0, 40, 'kg', '🍑'),
('f18', 'kashmir.valley@farm.com', 'Kashmir Valley Growers', 'Fresh Plum', 'fruit', 190.0, 45, 'kg', '🫐'),
('f19', 'mahabaleshwar.berries@farm.com', 'Mahabaleshwar Berry Farm', 'Blackberry Container', 'fruit', 280.0, 15, 'box', '🫐'),
('f20', 'kashmir.valley@farm.com', 'Kashmir Valley Growers', 'Fresh Cherry Box', 'fruit', 350.0, 18, 'box', '🍒'),
('f21', 'kinnaur.hills@farm.com', 'Kinnaur Hill Orchards', 'Green Apple (Granny Smith)', 'fruit', 210.0, 95, 'kg', '🍏'),
('f22', 'dharwad.agro@farm.com', 'Dharwad Agro Green', 'Custard Apple', 'fruit', 150.0, 25, 'kg', '🍐'),
('f23', 'kisan.agro@farm.com', 'Kisan Agro Collective', 'Muskmelon / Cantaloupe', 'fruit', 85.0, 35, 'pc', '🍈'),
('f24', 'pune.figs@farm.com', 'Pune Fig Cultivators', 'Fresh Fig (Anjeer)', 'fruit', 240.0, 20, 'pack', '🫐'),
('f25', 'muzaffarpur.lychee@farm.com', 'Muzaffarpur Shahi Lychee', 'Lychee Fruit', 'fruit', 220.0, 30, 'kg', '🍒'),
('f26', 'andhra.citrus@farm.com', 'Andhra Citrus Hub', 'Sweet Lime (Mosambi)', 'fruit', 90.0, 110, 'kg', '🍋'),
('f27', 'kisan.agro@farm.com', 'Kisan Agro Collective', 'Juicy Yellow Lemon', 'fruit', 50.0, 150, 'pack', '🍋'),
('f28', 'mizoram.organics@farm.com', 'Mizoram Organics', 'Passion Fruit', 'fruit', 260.0, 15, 'pack', '🫐'),
('f29', 'dahanu.gholvad@farm.com', 'Dahanu Gholvad Farms', 'Chiku (Sapodilla)', 'fruit', 80.0, 70, 'kg', '🥔'),
('f30', 'wayanad.spices@farm.com', 'Wayanad Spices & Fruits', 'Rambutan Fruit', 'fruit', 320.0, 12, 'pack', '🔴'),
('v1', 'sahyadri.agri@farm.com', 'Sahyadri Agri Farmer Co.', 'Organic Red Tomato', 'vegetable', 40.0, 180, 'kg', '🍅'),
('v2', 'ooty.roots@farm.com', 'Ooty Organic Roots', 'Fresh Crunchy Carrot', 'vegetable', 50.0, 150, 'kg', '🥕'),
('v3', 'nilgiri.agro@farm.com', 'Nilgiri Agro Farms', 'Green Broccoli', 'vegetable', 80.0, 65, 'pc', '🥦'),
('v4', 'sahyadri.agri@farm.com', 'Sahyadri Agri Farmer Co.', 'Spinach Bunch', 'vegetable', 25.0, 100, 'bunch', '🥬'),
('v5', 'greenfield.polyhouse@farm.com', 'Greenfield Polyhouse', 'Yellow & Red Bell Peppers', 'vegetable', 120.0, 50, 'pack', '🫑'),
('v6', 'agra.potato@farm.com', 'Agra Potato Collective', 'Organic Potato', 'vegetable', 35.0, 250, 'kg', '🥔'),
('v7', 'lasalgaon.onion@farm.com', 'Lasalgaon Farmer Trust', 'Red Onion', 'vegetable', 45.0, 220, 'kg', '🧅'),
('v8', 'sahyadri.agri@farm.com', 'Sahyadri Agri Farmer Co.', 'Fresh Cucumber', 'vegetable', 40.0, 90, 'kg', '🥒'),
('v9', 'kisan.agro@farm.com', 'Kisan Agro Collective', 'Purple Eggplant / Brinjal', 'vegetable', 45.0, 80, 'kg', '🍆'),
('v10', 'golden.harvest@farm.com', 'Golden Harvest Farms', 'Sweet Corn (2 cob)', 'vegetable', 50.0, 110, 'pack', '🌽'),
('v11', 'punjab.greens@farm.com', 'Punjab Greens Collective', 'Cauliflower', 'vegetable', 45.0, 60, 'pc', '🥦'),
('v12', 'himachal.fields@farm.com', 'Himachal Farm Fields', 'Green Peas (Matar)', 'vegetable', 80.0, 85, 'kg', '🫛'),
('v13', 'mandsaur.spice@farm.com', 'Mandsaur Spice Collective', 'Garlic Pods', 'vegetable', 180.0, 70, 'kg', '🧄'),
('v14', 'wayanad.spices@farm.com', 'Wayanad Spices & Fruits', 'Fresh Ginger Root', 'vegetable', 110.0, 65, 'kg', '🫚'),
('v15', 'kisan.agro@farm.com', 'Kisan Agro Collective', 'Bitter Gourd (Karela)', 'vegetable', 50.0, 45, 'kg', '🥒'),
('v16', 'sahyadri.agri@farm.com', 'Sahyadri Agri Farmer Co.', 'Bottle Gourd (Lauki)', 'vegetable', 40.0, 55, 'pc', '🥒'),
('v17', 'kisan.agro@farm.com', 'Kisan Agro Collective', 'Lady Finger (Bhindi)', 'vegetable', 60.0, 75, 'kg', '🌱'),
('v18', 'ooty.roots@farm.com', 'Ooty Organic Roots', 'Beetroot', 'vegetable', 50.0, 95, 'kg', '🍠'),
('v19', 'punjab.greens@farm.com', 'Punjab Greens Collective', 'Radish (Mooli)', 'vegetable', 35.0, 80, 'kg', '🌱'),
('v20', 'solan.mushrooms@farm.com', 'Solan Organic Mushrooms', 'Mushroom Box (Button)', 'vegetable', 85.0, 40, 'box', '🍄'),
('v21', 'guntur.spices@farm.com', 'Guntur Spice Farmers', 'Green Chilli', 'vegetable', 60.0, 120, 'pack', '🌶️'),
('v22', 'sahyadri.agri@farm.com', 'Sahyadri Agri Farmer Co.', 'Fresh Coriander / Cilantro', 'vegetable', 20.0, 150, 'bunch', '🌿');
