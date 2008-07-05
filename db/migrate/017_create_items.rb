class CreateItems < ActiveRecord::Migration
  def self.up
    create_table :items do |t|
      t.string :code
      t.string :name
      t.string :item_type
      t.string :uom
      t.float :unit_price
      t.integer :reorder_level
      t.integer :stock
      t.text :notes

      t.timestamps
    end
  end

  def self.down
    drop_table :items
  end
end
