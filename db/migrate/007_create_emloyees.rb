class CreateEmloyees < ActiveRecord::Migration
  def self.up
    create_table :emloyees do |t|
      t.string :emp_code
      t.string :emp_name
      t.string :short_name
      t.string :department
      t.text :address
      t.string :city
      t.string :state
      t.string :country
      t.string :pincode
      t.string :contact_no
      t.text :description
    end
  end

  def self.down
    drop_table :emloyees
  end
end
