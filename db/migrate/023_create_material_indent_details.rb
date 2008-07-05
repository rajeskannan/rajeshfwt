class CreateMaterialIndentDetails < ActiveRecord::Migration
  def self.up
    create_table :material_indent_details do |t|
      t.integer :indent_id
      t.integer :item_code
      t.integer :qty
      t.date :required_date
      t.boolean :issue_status
      t.string :remarks

      t.timestamps
    end
  end

  def self.down
    drop_table :material_indent_details
  end
end
