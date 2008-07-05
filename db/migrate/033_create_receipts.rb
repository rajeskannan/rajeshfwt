class CreateReceipts < ActiveRecord::Migration
  def self.up
    create_table :receipts do |t|
      t.date :receipt_date
      t.integer :invoice_id
      t.integer :contact_id
      t.float :received_amount
      t.string :amount_words
      t.string :received_by
      t.string :towards
      t.string :check_number
      t.string :bank_name

      t.timestamps
    end
  end

  def self.down
    drop_table :receipts
  end
end
