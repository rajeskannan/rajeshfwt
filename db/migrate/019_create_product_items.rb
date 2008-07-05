class CreateProductItems < ActiveRecord::Migration
  def self.up
    create_table :product_items do |t|
      t.string :code
      t.string :name
      t.float :unit_price
      t.timestamps
    end
  end
  
  def self.down
    drop_table :product_items
  end
end
