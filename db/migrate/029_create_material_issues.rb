class CreateMaterialIssues < ActiveRecord::Migration
  def self.up
    create_table :material_issues do |t|
      t.string :issue_no
      t.date :issue_date
      t.integer :mat_req_id
      t.string :approverd_by
      t.string :status
      t.string :remarks

      t.timestamps
    end
  end

  def self.down
    drop_table :material_issues
  end
end
