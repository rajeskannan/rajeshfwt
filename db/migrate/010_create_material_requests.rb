class CreateMaterialRequests < ActiveRecord::Migration
  def self.up
    create_table :material_requests do |t|
      t.date :req_date
      t.integer :job_code
      t.integer :dept_code
      t.string :supervisor
      t.string :store_incharge

      t.timestamps
    end
  end

  def self.down
    drop_table :material_requests
  end
end
