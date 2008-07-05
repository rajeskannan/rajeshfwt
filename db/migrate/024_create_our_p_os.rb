class CreateOurPOs < ActiveRecord::Migration
  def self.up
    create_table :our_pos do |t|
      t.string :po_no
      t.date :po_date
      t.integer :contact_id
      t.string :currency
      t.integer :total_qty
      t.float :net_amount
      t.integer :amendent_status
      t.string :prepared_by

      t.timestamps
    end
  end

  def self.down
    drop_table :our_pos
  end
end
