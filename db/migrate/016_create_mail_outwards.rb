class CreateMailOutwards < ActiveRecord::Migration
  def self.up
    create_table :mail_outwards do |t|
      t.integer :prospect_id
      t.date :date1
      t.text :description
      t.string :reference_no
      t.string :inward_ref
      t.string :document_details
      t.text :remarks

      t.timestamps
    end
  end

  def self.down
    drop_table :mail_outwards
  end
end
