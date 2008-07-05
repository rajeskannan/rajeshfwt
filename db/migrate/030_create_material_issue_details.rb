class CreateMaterialIssueDetails < ActiveRecord::Migration
  def self.up
    create_table :material_issue_details do |t|
      t.integer :mat_issue_id
      t.integer :item_code
      t.integer :req_qty
      t.integer :issue_qty
      t.integer :balance
      t.string :uom
      t.boolean :issue_status
      t.string :remarks

      t.timestamps
    end
  end

  def self.down
    drop_table :material_issue_details
  end
end
