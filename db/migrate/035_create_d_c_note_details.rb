class CreateDCNoteDetails < ActiveRecord::Migration
  def self.up
    create_table :dc_note_details do |t|
      t.integer :d_c_note_id
      t.string :ac_code
      t.string :description
      t.float :amoumt

      t.timestamps
    end
  end

  def self.down
    drop_table :dc_note_details
  end
end
