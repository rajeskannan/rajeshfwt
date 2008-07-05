class CreateVendorInvoices < ActiveRecord::Migration
  def self.up
    create_table :vendor_invoices do |t|
      t.string :invoice_no
      t.date :invoice_date
      t.integer :our_po_id
      t.string :supplier
      t.string :dc_ref
      t.date :dc_date
      t.string :currency
      t.string :CAT_no
      t.float :amount
      t.float :tax
      t.float :frieght
      t.float :other_amount
      t.float :surcharge
      t.float :net_amount
      t.string :status

      t.timestamps
    end
  end

  def self.down
    drop_table :vendor_invoices
  end
end
