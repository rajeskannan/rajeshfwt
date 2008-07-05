class CreatePurchaseOrders < ActiveRecord::Migration
  def self.up
    create_table :purchase_orders do |t|
      t.string :po_no
      t.date :po_date
      t.string :currency
      t.string :approved_by
      t.float :amount
      t.float :tax
      t.float :other_amount
      t.float :net_amount
      t.text :delivery_address
      t.text :terms_and_condition
      t.integer :product_item_id

      t.timestamps
    end
  end

  def self.down
    drop_table :purchase_orders
  end
end
