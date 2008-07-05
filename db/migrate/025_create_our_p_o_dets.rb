class CreateOurPODets < ActiveRecord::Migration
  def self.up
    create_table :our_po_dets do |t|
      t.integer :our_p_o_id
      t.integer :item_code
      t.integer :quantity
      t.float :unit_price
     
      t.float :tax
      t.float :other_amount
      t.float :net_amount

      t.timestamps
    end
  end

  def self.down
    drop_table :our_po_dets
  end
end
