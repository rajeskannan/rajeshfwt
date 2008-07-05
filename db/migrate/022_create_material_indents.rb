class CreateMaterialIndents < ActiveRecord::Migration
  def self.up
    create_table :material_indents do |t|
      t.date :indent_date
      t.integer :job_code
      t.integer :dept_code
      t.string :supervisor
      t.string :store_incharge

      t.timestamps
    end
  end

  def self.down
    drop_table :material_indents
  end
end
