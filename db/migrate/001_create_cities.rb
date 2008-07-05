class CreateCities < ActiveRecord::Migration
  def self.up
    create_table :cities do |t|
      t.string :city
      t.string :state
      t.string :country
    end
    
     create_table :contacts do |t|
      t.string :code
      t.string :name
      t.text :address
      t.string :city
      t.string :state
      t.string :country
      t.string :con_per
      t.string :con_no
      t.string :email
      t.string :designation
      t.string :alt_con_per
      t.string :alt_con_no
      t.string :alt_email
      t.string :alt_designation
      t.string :type

      t.timestamps
    end
  end

  def self.down
    drop_table :cities
     drop_table :contacts
  end
end
