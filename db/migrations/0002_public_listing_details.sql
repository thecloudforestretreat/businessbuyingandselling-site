-- Publish stronger seller-provided opportunity summaries while keeping
-- business names, street addresses, contacts, and source files private.

UPDATE listings SET
  public_title = '30-Room Motel and Real Estate Opportunity',
  public_summary = 'Established York, South Carolina motel with 30 rooms, approximately 10,459 square feet on 1.63 acres, and repositioning upside.',
  public_price_band = '$999,000',
  public_revenue_band = '$230,000 seller-reported gross revenue',
  public_asset_label = 'Real estate included; owner financing available',
  updated_at = CURRENT_TIMESTAMP
WHERE id = 'BBAS-101';

UPDATE listings SET
  public_title = 'Recently Improved Convenience Store',
  public_summary = 'A 1,378-square-foot Monroe, North Carolina store opened in March 2026 with extensive recent building, equipment, security, and merchandising improvements.',
  public_price_band = '$500,000',
  public_revenue_band = 'Financial detail available during diligence',
  public_asset_label = 'Recently improved retail operation',
  updated_at = CURRENT_TIMESTAMP
WHERE id = 'BBAS-102';

UPDATE listings SET
  public_title = 'High-Volume Liquor Store Opportunity',
  public_summary = 'Greer, South Carolina liquor store with approximately $90,000 in seller-reported average monthly sales and $6,500 monthly rent.',
  public_price_band = '$220,000',
  public_revenue_band = '$90,000 average monthly sales',
  public_asset_label = 'Leased retail location',
  updated_at = CURRENT_TIMESTAMP
WHERE id = 'BBAS-103';

UPDATE listings SET
  public_title = 'Branded Gas Station and Convenience Store',
  public_summary = 'Columbia, South Carolina fuel and convenience operation with strong reported inside sales, fuel volume, lottery income, and a long initial lease.',
  public_price_band = '$475,000 plus inventory',
  public_revenue_band = '$115,000 monthly inside sales; 50,000 monthly gallons',
  public_asset_label = '15-year initial lease',
  updated_at = CURRENT_TIMESTAMP
WHERE id = 'BBAS-104';

UPDATE listings SET
  public_title = 'Fuel, Convenience and Specialty Retail Property',
  public_summary = 'Chesnee, South Carolina property combining unbranded fuel, convenience, and specialty retail activity with an existing tenant lease through July 2027.',
  public_price_band = '$2,800,000',
  public_revenue_band = '$100,000 inside sales; 40,000 fuel gallons; $60,000 specialty sales reported',
  public_asset_label = 'Real estate profile with existing tenant',
  updated_at = CURRENT_TIMESTAMP
WHERE id = 'BBAS-105';

UPDATE listings SET
  public_title = 'Gas Station and Real Estate Opportunity',
  public_summary = 'Bennettsville, South Carolina gas station and convenience store with approximately 1.06 acres and a 2,580-square-foot building.',
  public_price_band = '$1,600,000',
  public_revenue_band = '$89,000 monthly inside sales; 45,000 monthly gallons',
  public_asset_label = 'Real estate included',
  updated_at = CURRENT_TIMESTAMP
WHERE id = 'BBAS-106';

UPDATE listings SET
  public_title = 'Neighborhood Convenience Store and Real Estate',
  public_summary = 'Established Charlotte, North Carolina neighborhood convenience store and real estate near Uptown with reported heavy foot traffic and surrounding residential demand.',
  public_price_band = '$500,000',
  public_revenue_band = 'Financial detail available during diligence',
  public_asset_label = 'Real estate included',
  updated_at = CURRENT_TIMESTAMP
WHERE id = 'BBAS-107';

UPDATE listings SET
  public_title = 'Ice Cream and Bubble Tea Shop',
  public_summary = 'Fully built-out 900-square-foot dessert and beverage shop in a Rock Hill, South Carolina college retail corridor with strong day and evening traffic.',
  public_price_band = '$60,000 plus inventory',
  public_revenue_band = '$160,000 seller-reported gross revenue',
  public_asset_label = 'Leased, fully built-out operation',
  updated_at = CURRENT_TIMESTAMP
WHERE id = 'BBAS-108';
