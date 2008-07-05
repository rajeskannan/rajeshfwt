class CreatePerformaInvoices < ActiveRecord::Migration
  def self.up
    create_table :performa_invoices do |t|
      t.string :pi_code
      t.date :pi_date
      t.integer :po_id

      t.timestamps
    end
  end

  def self.down
    drop_table :performa_invoices
  end
end
