class CreatePurchaseReturns < ActiveRecord::Migration
  def self.up
    create_table :purchase_returns do |t|
      t.integer :our_p_o_id
      t.date :ret_date
      t.integer :contact_id
      t.integer :supplier_invoice_id
      t.integer :material_inward_id
      t.string :prepared_by

      t.timestamps
    end
  end

  def self.down
    drop_table :purchase_returns
  end
end
