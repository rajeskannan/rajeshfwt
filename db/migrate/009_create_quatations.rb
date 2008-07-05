class CreateQuatations < ActiveRecord::Migration
  def self.up
    create_table :quatations do |t|
      t.string :q_ref
      t.date :date
      t.string :enq_no
      t.string :customer_name
      t.string :orientation
      t.string :ticket_size
      t.integer :qty
      t.string :ticket_graphics
      t.string :variable_imaging
      t.float :POB_price
      t.string :CIF_by
      t.float :freight
      t.float :insurance
      t.text :packing
      t.text :despatch
      t.text :payment_terms
      t.text :clarification
      t.string :ben_day
      t.string :scartch_coating
      t.string :game
      t.text :game_description
      t.string :numbering
      t.string :validation_no
      t.string :validation_code
      t.string :designs
      t.string :special_coating
      t.string :scartch_off
      t.string :uv_varnish
      t.string :security_over_print
      t.string :perforation
      t.string :pin_sl_no  
    end
  end

  def self.down
    drop_table :quatations
  end
end


