class CreateMaterialRequestDetails < ActiveRecord::Migration
  def self.up
    create_table :material_request_details do |t|
      t.integer :req_id
      t.integer :item_code
      t.integer :qty
      t.boolean :issue_status
      t.string :remarks

      t.timestamps
    end
  end

  def self.down
    drop_table :material_request_details
  end
end
