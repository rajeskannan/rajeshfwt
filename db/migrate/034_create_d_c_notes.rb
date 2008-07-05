class CreateDCNotes < ActiveRecord::Migration
  def self.up
    create_table :dc_notes do |t|
      t.date :note_date
      t.integer :contact_id
      t.string :ref
      t.string :note_type
      t.float :total_amount
      t.string :naration

      t.timestamps
    end
  end

  def self.down
    drop_table :dc_notes
  end
end
