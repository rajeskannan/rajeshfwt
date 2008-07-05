class CreateVendorInvoiceDetails < ActiveRecord::Migration
  def self.up
    create_table :vendor_invoice_details do |t|
      t.integer :invoice_id
      t.integer :item_code
      t.float :unit_price
      t.float :tax
      t.float :others
      t.float :total

      t.timestamps
    end
  end

  def self.down
    drop_table :vendor_invoice_details
  end
end
