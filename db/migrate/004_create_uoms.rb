class CreateUoms < ActiveRecord::Migration
  def self.up
    create_table :uoms do |t|
      t.string :name
      t.string :short_name
      t.string :type
      t.string :description
    end
  end

  def self.down
    drop_table :uoms
  end
end
