# This file is auto-generated from the current state of the database. Instead of editing this file, 
# please use the migrations feature of ActiveRecord to incrementally modify your database, and
# then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your database schema. If you need
# to create the application database on another system, you should be using db:schema:load, not running
# all the migrations from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 35) do

  create_table "cities", :force => true do |t|
    t.string "city"
    t.string "state"
    t.string "country"
  end

  create_table "companies", :force => true do |t|
    t.string "company_code"
    t.string "name"
    t.string "address1"
    t.string "address2"
    t.string "city"
    t.string "state"
    t.string "country"
    t.string "division"
    t.string "tngst_no"
    t.string "par_com_id"
    t.string "cst_no"
    t.string "com_desc"
  end

  create_table "contacts", :force => true do |t|
    t.string   "code"
    t.string   "name"
    t.text     "address"
    t.string   "city"
    t.string   "state"
    t.string   "country"
    t.string   "con_per"
    t.string   "con_no"
    t.string   "email"
    t.string   "designation"
    t.string   "alt_con_per"
    t.string   "alt_con_no"
    t.string   "alt_email"
    t.string   "alt_designation"
    t.string   "type"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "contract_reviews", :force => true do |t|
    t.string   "enq_no"
    t.date     "enq_date"
    t.string   "out_ref_id"
    t.string   "product_type"
    t.integer  "contact_id"
    t.string   "variable_imaging"
    t.string   "orientation"
    t.string   "tkt_size"
    t.string   "cif_by"
    t.float    "frieght"
    t.integer  "quantity"
    t.string   "tkt_graphics"
    t.string   "insurance"
    t.text     "packing"
    t.text     "despatch"
    t.text     "payment_type"
    t.text     "clarification"
    t.string   "benday"
    t.string   "scartch_coating"
    t.string   "game"
    t.string   "game_desc"
    t.string   "numbering"
    t.string   "val_no"
    t.string   "val_code"
    t.string   "designs"
    t.string   "spl_coating"
    t.string   "scartch_off"
    t.string   "uv_varnish"
    t.string   "security_over_print"
    t.string   "perforation"
    t.string   "pin_sl_no"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "customers", :force => true do |t|
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "dc_note_details", :force => true do |t|
    t.integer  "d_c_note_id"
    t.string   "ac_code"
    t.string   "description"
    t.float    "amoumt"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "dc_notes", :force => true do |t|
    t.date     "note_date"
    t.integer  "contact_id"
    t.string   "ref"
    t.string   "note_type"
    t.float    "total_amount"
    t.string   "naration"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "departments", :force => true do |t|
    t.string "dept_code"
    t.string "department"
  end

  create_table "emloyees", :force => true do |t|
    t.string "emp_code"
    t.string "emp_name"
    t.string "short_name"
    t.string "department"
    t.text   "address"
    t.string "city"
    t.string "state"
    t.string "country"
    t.string "pincode"
    t.string "contact_no"
    t.text   "description"
  end

  create_table "items", :force => true do |t|
    t.string   "code"
    t.string   "name"
    t.string   "item_type"
    t.string   "uom"
    t.float    "unit_price"
    t.integer  "reorder_level"
    t.integer  "stock"
    t.text     "notes"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "job_cards", :force => true do |t|
    t.string   "job_card_no"
    t.date     "card_date"
    t.integer  "contact_id"
    t.text     "deliver_address"
    t.string   "lottery_name"
    t.string   "draw_no_date"
    t.string   "series"
    t.string   "total_no_of_tickets"
    t.string   "size_of_ticket"
    t.string   "paper"
    t.integer  "est_no"
    t.text     "tickets"
    t.text     "coupons_or_supertickets"
    t.text     "bulk_or_blocktickets"
    t.string   "estimate"
    t.string   "packing_all_orders"
    t.string   "release_order"
    t.string   "remarks"
    t.string   "manager"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "mail_outwards", :force => true do |t|
    t.integer  "prospect_id"
    t.date     "date1"
    t.text     "description"
    t.string   "reference_no"
    t.string   "inward_ref"
    t.string   "document_details"
    t.text     "remarks"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "material_indent_details", :force => true do |t|
    t.integer  "indent_id"
    t.integer  "item_code"
    t.integer  "qty"
    t.date     "required_date"
    t.boolean  "issue_status"
    t.string   "remarks"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "material_indents", :force => true do |t|
    t.date     "indent_date"
    t.integer  "job_code"
    t.integer  "dept_code"
    t.string   "supervisor"
    t.string   "store_incharge"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "material_issue_details", :force => true do |t|
    t.integer  "mat_issue_id"
    t.integer  "item_code"
    t.integer  "req_qty"
    t.integer  "issue_qty"
    t.integer  "balance"
    t.string   "uom"
    t.boolean  "issue_status"
    t.string   "remarks"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "material_issues", :force => true do |t|
    t.string   "issue_no"
    t.date     "issue_date"
    t.integer  "mat_req_id"
    t.string   "approverd_by"
    t.string   "status"
    t.string   "remarks"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "material_request_details", :force => true do |t|
    t.integer  "req_id"
    t.integer  "item_code"
    t.integer  "qty"
    t.boolean  "issue_status"
    t.string   "remarks"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "material_requests", :force => true do |t|
    t.date     "req_date"
    t.integer  "job_code"
    t.integer  "dept_code"
    t.string   "supervisor"
    t.string   "store_incharge"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "our_po_dets", :force => true do |t|
    t.integer  "our_p_o_id"
    t.integer  "item_code"
    t.integer  "quantity"
    t.float    "unit_price"
    t.float    "tax"
    t.float    "other_amount"
    t.float    "net_amount"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "our_pos", :force => true do |t|
    t.string   "po_no"
    t.date     "po_date"
    t.integer  "contact_id"
    t.string   "currency"
    t.integer  "total_qty"
    t.float    "net_amount"
    t.integer  "amendent_status"
    t.string   "prepared_by"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "performa_invoices", :force => true do |t|
    t.string   "pi_code"
    t.date     "pi_date"
    t.integer  "po_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "po_details", :force => true do |t|
    t.integer  "po_id"
    t.integer  "product_id"
    t.float    "unit_price"
    t.integer  "quantity"
    t.float    "total_amount"
    t.string   "notes"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "product_items", :force => true do |t|
    t.string   "code"
    t.string   "name"
    t.float    "unit_price"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "purchase_orders", :force => true do |t|
    t.string   "po_no"
    t.date     "po_date"
    t.string   "currency"
    t.string   "approved_by"
    t.float    "amount"
    t.float    "tax"
    t.float    "other_amount"
    t.float    "net_amount"
    t.text     "delivery_address"
    t.text     "terms_and_condition"
    t.integer  "product_item_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "purchase_return_details", :force => true do |t|
    t.integer  "pur_ret_id"
    t.integer  "item_code"
    t.integer  "qty"
    t.float    "value"
    t.float    "p"
    t.string   "reason"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "purchase_returns", :force => true do |t|
    t.integer  "our_p_o_id"
    t.date     "ret_date"
    t.integer  "contact_id"
    t.integer  "supplier_invoice_id"
    t.integer  "material_inward_id"
    t.string   "prepared_by"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "quatations", :force => true do |t|
    t.string  "q_ref"
    t.date    "date"
    t.string  "enq_no"
    t.string  "customer_name"
    t.string  "orientation"
    t.string  "ticket_size"
    t.integer "qty"
    t.string  "ticket_graphics"
    t.string  "variable_imaging"
    t.float   "POB_price"
    t.string  "CIF_by"
    t.float   "freight"
    t.float   "insurance"
    t.text    "packing"
    t.text    "despatch"
    t.text    "payment_terms"
    t.text    "clarification"
    t.string  "ben_day"
    t.string  "scartch_coating"
    t.string  "game"
    t.text    "game_description"
    t.string  "numbering"
    t.string  "validation_no"
    t.string  "validation_code"
    t.string  "designs"
    t.string  "special_coating"
    t.string  "scartch_off"
    t.string  "uv_varnish"
    t.string  "security_over_print"
    t.string  "perforation"
    t.string  "pin_sl_no"
  end

  create_table "receipts", :force => true do |t|
    t.date     "receipt_date"
    t.integer  "invoice_id"
    t.integer  "contact_id"
    t.float    "received_amount"
    t.string   "amount_words"
    t.string   "received_by"
    t.string   "towards"
    t.string   "check_number"
    t.string   "bank_name"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "roles", :force => true do |t|
    t.string "name"
  end

  create_table "sessions", :force => true do |t|
    t.string   "session_id", :default => "", :null => false
    t.text     "data"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "sessions", ["session_id"], :name => "index_sessions_on_session_id"
  add_index "sessions", ["updated_at"], :name => "index_sessions_on_updated_at"

  create_table "suppliers", :force => true do |t|
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "uoms", :force => true do |t|
    t.string "name"
    t.string "short_name"
    t.string "type"
    t.string "description"
  end

  create_table "users", :force => true do |t|
    t.string "name"
    t.string "hashed_password"
    t.string "salt"
  end

  create_table "vendor_invoice_details", :force => true do |t|
    t.integer  "invoice_id"
    t.integer  "item_code"
    t.float    "unit_price"
    t.float    "tax"
    t.float    "others"
    t.float    "total"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "vendor_invoices", :force => true do |t|
    t.string   "invoice_no"
    t.date     "invoice_date"
    t.integer  "our_po_id"
    t.string   "supplier"
    t.string   "dc_ref"
    t.date     "dc_date"
    t.string   "currency"
    t.string   "CAT_no"
    t.float    "amount"
    t.float    "tax"
    t.float    "frieght"
    t.float    "other_amount"
    t.float    "surcharge"
    t.float    "net_amount"
    t.string   "status"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

end
