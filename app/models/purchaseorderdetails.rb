class Purchaseorderdetails
  require 'purchaseorderdetails_item'
    attr_reader :purchaseorderdetails_items
  
  def initialize
    @purchaseorderdetails_items = []
  end
  
  def add_product(po_details)
     current_item = PuchaseorderdetailsItem.new(po_details)
     @purchaseorderdetails_items << current_item
  end
  
end