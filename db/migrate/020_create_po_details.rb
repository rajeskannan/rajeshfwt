class CreatePoDetails < ActiveRecord::Migration
  def self.up
    create_table :po_details do |t|
      t.integer :po_id
      t.integer :product_id
      t.float :unit_price
      t.integer :quantity
      t.float :total_amount
      t.string :notes

      t.timestamps
    end
  end

  def self.down
    drop_table :po_details
  end
end
