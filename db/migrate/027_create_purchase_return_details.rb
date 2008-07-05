class CreatePurchaseReturnDetails < ActiveRecord::Migration
  def self.up
    create_table :purchase_return_details do |t|
      t.integer :pur_ret_id
      t.integer :item_code
      t.integer :qty
      t.float :value
      t.float :p
      t.string :reason

      t.timestamps
    end
  end

  def self.down
    drop_table :purchase_return_details
  end
end
