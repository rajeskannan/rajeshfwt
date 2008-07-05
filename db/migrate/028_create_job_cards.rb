class CreateJobCards < ActiveRecord::Migration
  def self.up
    create_table :job_cards do |t|
      t.string :job_card_no
      t.date :card_date
      t.integer :contact_id
      t.text :deliver_address
      t.string :lottery_name
      t.string :draw_no_date
      t.string :series
      t.string :total_no_of_tickets
      t.string :size_of_ticket
      t.string :paper
      t.integer :est_no
      t.text :tickets
      t.text :coupons_or_supertickets
      t.text :bulk_or_blocktickets
      t.string :estimate
      t.string :packing_all_orders
      t.string :release_order
      t.string :remarks
      t.string :manager

      t.timestamps
    end
  end

  def self.down
    drop_table :job_cards
  end
end
