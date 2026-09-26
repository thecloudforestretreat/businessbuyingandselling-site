PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS listings (
  id TEXT PRIMARY KEY,
  public_slug TEXT,
  public_title TEXT NOT NULL,
  public_category TEXT NOT NULL,
  public_summary TEXT NOT NULL DEFAULT '',
  public_price_band TEXT NOT NULL DEFAULT 'Available after qualification',
  public_revenue_band TEXT NOT NULL DEFAULT 'Available after NDA',
  public_asset_label TEXT NOT NULL DEFAULT 'Confidential',
  placeholder_image TEXT NOT NULL DEFAULT '/assets/images/listings/placeholders/bbas_placeholder_01.jpg',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft','active','under_loi','pending','sold','withdrawn')),
  sort_order INTEGER NOT NULL DEFAULT 100,
  private_name TEXT,
  private_address TEXT,
  private_city TEXT,
  private_state TEXT,
  private_postal_code TEXT,
  private_asking_price TEXT,
  private_revenue TEXT,
  private_details_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS buyers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  company TEXT NOT NULL DEFAULT '',
  qualification_status TEXT NOT NULL DEFAULT 'new' CHECK (qualification_status IN ('new','reviewing','qualified','not_qualified','inactive')),
  capital_range TEXT NOT NULL DEFAULT '',
  financing_stage TEXT NOT NULL DEFAULT '',
  experience TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  listing_id TEXT,
  buyer_id INTEGER,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  state TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  source_url TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT '',
  medium TEXT NOT NULL DEFAULT '',
  campaign TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','qualifying','qualified','nda_sent','nda_signed','private_access','diligence','loi','closed','not_qualified')),
  assigned_to TEXT NOT NULL DEFAULT '',
  next_follow_up TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (listing_id) REFERENCES listings(id),
  FOREIGN KEY (buyer_id) REFERENCES buyers(id)
);

CREATE TABLE IF NOT EXISTS nda_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  buyer_id INTEGER NOT NULL,
  listing_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('draft','sent','viewed','signed','declined','expired','revoked')),
  document_provider TEXT NOT NULL DEFAULT 'manual',
  document_reference TEXT NOT NULL DEFAULT '',
  sent_at TEXT,
  signed_at TEXT,
  expires_at TEXT,
  approved_by TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (buyer_id) REFERENCES buyers(id),
  FOREIGN KEY (listing_id) REFERENCES listings(id)
);

CREATE TABLE IF NOT EXISTS access_grants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  buyer_id INTEGER NOT NULL,
  listing_id TEXT NOT NULL,
  nda_id INTEGER NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','expired','revoked')),
  expires_at TEXT NOT NULL,
  first_accessed_at TEXT,
  last_accessed_at TEXT,
  access_count INTEGER NOT NULL DEFAULT 0,
  created_by TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  revoked_at TEXT,
  FOREIGN KEY (buyer_id) REFERENCES buyers(id),
  FOREIGN KEY (listing_id) REFERENCES listings(id),
  FOREIGN KEY (nda_id) REFERENCES nda_records(id)
);

CREATE TABLE IF NOT EXISTS listing_assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  listing_id TEXT NOT NULL,
  r2_key TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  asset_type TEXT NOT NULL DEFAULT 'document' CHECK (asset_type IN ('image','document','financial','property','other')),
  mime_type TEXT NOT NULL DEFAULT 'application/octet-stream',
  size_bytes INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 100,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (listing_id) REFERENCES listings(id)
);

CREATE TABLE IF NOT EXISTS activity_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_name TEXT NOT NULL,
  listing_id TEXT,
  buyer_id INTEGER,
  page_path TEXT NOT NULL DEFAULT '',
  session_id TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT '',
  medium TEXT NOT NULL DEFAULT '',
  campaign TEXT NOT NULL DEFAULT '',
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (listing_id) REFERENCES listings(id),
  FOREIGN KEY (buyer_id) REFERENCES buyers(id)
);

CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  buyer_id INTEGER,
  listing_id TEXT,
  inquiry_id INTEGER,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','done','cancelled')),
  due_at TEXT,
  assigned_to TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (buyer_id) REFERENCES buyers(id),
  FOREIGN KEY (listing_id) REFERENCES listings(id),
  FOREIGN KEY (inquiry_id) REFERENCES inquiries(id)
);

CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_listings_public_slug ON listings(public_slug) WHERE public_slug IS NOT NULL AND public_slug <> '';
CREATE INDEX IF NOT EXISTS idx_inquiries_listing ON inquiries(listing_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_grants_buyer_listing ON access_grants(buyer_id, listing_id, status);
CREATE INDEX IF NOT EXISTS idx_events_created ON activity_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_listing ON activity_events(listing_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks(status, due_at);

INSERT OR IGNORE INTO listings (id, public_slug, public_title, public_category, public_summary, public_price_band, public_revenue_band, public_asset_label, placeholder_image, status, sort_order) VALUES
('NC-AUTO-SERVICE','', 'Established Brake and Repair Operation','service','Service-focused automotive opportunity with a six-figure revenue base.','$499,000','$872,122 annual','Operating business','/assets/images/listings/placeholders/bbas_placeholder_01.jpg','active',10),
('NC-CONVENIENCE-STORE','', 'Standalone Convenience Store Opportunity','retail','Convenience retail opportunity for a hands-on operator.','$625,000','Available after qualification','Operating business','/assets/images/listings/placeholders/bbas_placeholder_02.jpg','active',20),
('NC-GROCERY-GRILL','', 'Community Grocery and Grill Concept','food','Small-format grocery and prepared-food hybrid.','$299,000','Available after qualification','Operating business','/assets/images/listings/placeholders/bbas_placeholder_03.jpg','active',30),
('NC-BAKERY-FOOD-SERVICE','', 'Bakery and Counter-Service Food Business','food','Established bakery and counter-service operation.','$450,000','$810,000 annual','Operating business','/assets/images/listings/placeholders/bbas_placeholder_01.jpg','active',40),
('NC-SMALL-CAFE','', 'Small Footprint Cafe Opportunity','food','Accessible food-service entry opportunity.','$149,000','$252,306 annual','Operating business','/assets/images/listings/placeholders/bbas_placeholder_02.jpg','active',50),
('NC-MEDICAL-TRANSPORT','', 'Non-Emergency Medical Transport Business','service','Managed transportation service at meaningful scale.','$1,100,000','$920,190 annual','Operating business','/assets/images/listings/placeholders/bbas_placeholder_03.jpg','active',60),
('NC-BUTCHER-RETAIL','', 'Specialty Butcher and Meat Retail Operation','retail','Niche food retail opportunity.','$150,000','$1,278,230 annual','Operating business','/assets/images/listings/placeholders/bbas_placeholder_01.jpg','active',70),
('NC-SPECIALTY-FOODS-GROUP','', 'Multi-Location Specialty Foods Retail Group','retail','Multi-location specialty retail opportunity.','$2,250,000','$2,361,936 annual','Multi-location','/assets/images/listings/placeholders/bbas_placeholder_02.jpg','active',80),
('NC-ESTABLISHED-RETAIL','', 'Established Retail Store with Strong Revenue Base','retail','Traditional storefront business with operating history.','$575,000','$935,454 annual','Operating business','/assets/images/listings/placeholders/bbas_placeholder_03.jpg','active',90),
('NC-COIN-LAUNDRY','', 'Scaled Coin Laundry and Ancillary Revenue Business','service','Larger owner-operated service platform.','$1,690,000','$879,799 annual','Operating business','/assets/images/listings/placeholders/bbas_placeholder_01.jpg','active',100),
('BBAS-101','confidential-lodging-property-bbas-101','Confidential Lodging Property Opportunity','lodging','Established lodging operation with real estate and repositioning potential.','$750K-$1M','$200K-$250K reported','Real estate profile','/assets/images/listings/placeholders/bbas_placeholder_01.jpg','active',110),
('BBAS-102','improved-convenience-retail-bbas-102','Recently Improved Convenience Retail Opportunity','retail','Recently improved convenience retail operation.','$400K-$600K','Available after NDA','Improved retail build-out','/assets/images/listings/placeholders/bbas_placeholder_02.jpg','active',120),
('BBAS-103','specialty-beverage-retail-bbas-103','High-Volume Specialty Beverage Retail Opportunity','retail','Specialty beverage retail operation with reported monthly sales.','$200K-$300K','$75K-$100K monthly','Leased site','/assets/images/listings/placeholders/bbas_placeholder_03.jpg','active',130),
('BBAS-104','branded-fuel-convenience-bbas-104','Branded Fuel and Convenience Retail Opportunity','fuel','Operating fuel and convenience opportunity.','$400K-$600K','$100K-$125K monthly inside sales','Leased property','/assets/images/listings/placeholders/bbas_placeholder_01.jpg','active',140),
('BBAS-105','fuel-specialty-retail-property-bbas-105','Fuel, Convenience and Specialty Retail Property','fuel','Larger fuel, convenience and specialty retail acquisition.','$2.5M-$3M','$150K-$175K combined monthly','Real estate profile','/assets/images/listings/placeholders/bbas_placeholder_02.jpg','active',150),
('BBAS-106','fuel-convenience-real-estate-bbas-106','Fuel and Convenience Store with Real Estate','fuel','Operating fuel and convenience property with real estate.','$1.5M-$1.75M','$75K-$100K monthly inside sales','Real estate included','/assets/images/listings/placeholders/bbas_placeholder_03.jpg','active',160),
('BBAS-107','neighborhood-convenience-property-bbas-107','Neighborhood Convenience Store and Real Estate','retail','Neighborhood convenience store paired with real estate.','$400K-$600K','Available after NDA','Real estate included','/assets/images/listings/placeholders/bbas_placeholder_01.jpg','active',170),
('BBAS-108','dessert-beverage-shop-bbas-108','Dessert and Beverage Shop Opportunity','food','Built-out dessert and specialty beverage shop.','Under $100K','$150K-$200K annual','Leased built-out operation','/assets/images/listings/placeholders/bbas_placeholder_02.jpg','active',180);
