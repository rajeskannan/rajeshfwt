class CreateContractReviews < ActiveRecord::Migration
  def self.up
    create_table :contract_reviews do |t|
      t.string :enq_no
      t.date :enq_date
      t.string :out_ref_id
      t.string :product_type
      t.integer :contact_id
      t.string :variable_imaging
      t.string :orientation
      t.string :tkt_size
      t.string :cif_by
      t.float :frieght
      t.integer :quantity
      t.string :tkt_graphics
      t.string :insurance
      t.text :packing
      t.text :despatch
      t.text :payment_type
      t.text :clarification
      t.string :benday
      t.string :scartch_coating
      t.string :game
      t.string :game_desc
      t.string :numbering
      t.string :val_no
      t.string :val_code
      t.string :designs
      t.string :spl_coating
      t.string :scartch_off
      t.string :uv_varnish
      t.string :security_over_print
      t.string :perforation
      t.string :pin_sl_no

      t.timestamps
    end
  end

  def self.down
    drop_table :contract_reviews
  end
end
