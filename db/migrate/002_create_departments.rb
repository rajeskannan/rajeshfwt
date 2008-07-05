class CreateDepartments < ActiveRecord::Migration
  def self.up
    create_table :departments do |t|
      t.string :dept_code
      t.string :department
    end
  end

  def self.down
    drop_table :departments
  end
end
