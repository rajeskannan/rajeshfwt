class CreateCompanies < ActiveRecord::Migration
  def self.up
    create_table :companies do |t|
      t.string :company_code
      t.string :name
      t.string :address1
      t.string :address2
      t.string :city
      t.string :state
      t.string :country
      t.string :division
      t.string :tngst_no
      t.string :par_com_id
      t.string :cst_no
      t.string :com_desc
    end
  end

  def self.down
    drop_table :companies
  end
end
