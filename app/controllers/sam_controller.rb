#Sales And Marketing
class SamController < ApplicationController
   helper :select_belongs
################################



def add_po_details
 @product = ProductItem.find(params['pd']['item_code'].to_i)
 
 if @product != nil
   @purordetails = find_po_details
#    current_item = @po_details.add_product(@product)
    
    @po_details = PoDetails.new   
    @po_details.product_id = @product.id
    @po_details.unit_price = @product.unit_price
    @po_details.quantity = params['pd']['qty']
    @po_details.notes =  params['pd']['notes']
    @po_details.total_amount =  (@po_details.unit_price * @po_details.quantity.to_f)     
    @purchaseorderdetails_items = @purordetails.add_product(@po_details)
    
     render(:partial => "po_details")
  else
     render(:text => "Error")
 end
 
 
 
 
end


def find_po_details
session[:purcahseorderDetails] ||= Purchaseorderdetails.new

end
#########################
 def mail_outward_list
    @mail_outwards = MailOutward.find(:all)
    @form = 'mailOutwardMain'
    @grid = true

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @mail_outwards }
    end
  end
  
  def mail_outward_new
 
    @mail_outward = MailOutward.new
    @prospects = Contact.find(:all)
     flash[:notice] = "Sucessfully saved"
    @form = 'mail_outward'
  end
  
  def mail_outward_create
  flash[:notice] = "Sucessfully saved"
    @form = 'mail_outward'
    mail_outward = MailOutward.new(params[:mail_outward])
    if mail_outward.save
     flash.now[:notice] = "Sucessfully saved"
     redirect_to("/sam/mail_outward_list")
    else
     redirect_to(:controller => "login" , :action => "login")
    end
  end
  
    def mail_outward_edit
    @form = 'mail_outward'
    @mail_outward = MailOutward.find(params[:id])
    @prospect = Contact.find(@mail_outward.prospect_id.to_i)
  end
  
  
  
  def mail_outward_update
    @mail_outward = MailOutward.find(params[:id])
    @form = 'mail_outward'
    respond_to do |format|
      if @mail_outward.update_attributes(params[:mail_outward])
        flash[:notice] = 'Outward mail was successfully updated.'
       # format.html { redirect_to(@city) }
       format.html { redirect_to("/sam/mail_outward_list") }
        format.xml  { head :ok }
      else
        format.html { render :action => "city_edit" }
        format.xml  { render :xml => @mail_outward.errors, :status => :unprocessable_entity }
      end
    end
  end

  def mail_outward_delete
   @mail_outward = MailOutward.find(params[:id])
    @mail_outward.destroy
     @form = 'mail_outward'
    respond_to do |format|
      format.html { redirect_to("/sam/mail_outward_list") }
      format.xml  { head :ok }
    end
  end
  
  ################ Product############
  def product_list
    @products = ProductItem.find(:all)
    @form = 'productMain'
    @grid = true

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @products }
    end
  end
  
  def product_new
 
    @product = ProductItem.new
     flash[:notice] = "Sucessfully saved"
    @form = 'productForm'
  end
  
  def product_create
  flash[:notice] = "Sucessfully saved"
    @form = 'productForm'
    product = ProductItem.new(params[:product])
    if product.save
     flash.now[:notice] = "Sucessfully saved"
     redirect_to("/sam/product_list")
    else
     redirect_to(:controller => "login" , :action => "login")
    end
  end
  
    def product_edit
    @form = 'productForm'
    @product = ProductItem.find(params[:id])
  end
  
  
  
  def product_update
    @product = ProductItem.find(params[:id])
    @form = 'productForm'
    respond_to do |format|
      if @product.update_attributes(params[:product])
        flash[:notice] = 'Product was successfully updated.'
       # format.html { redirect_to(@city) }
       format.html { redirect_to("/sam/product_list") }
        format.xml  { head :ok }
      else
        format.html { render :action => "product_edit" }
        format.xml  { render :xml => @product.errors, :status => :unprocessable_entity }
      end
    end
  end

  def product_delete
   @product = ProductItem.find(params[:id])
    @product.destroy
     @form = 'productForm'
    respond_to do |format|
      format.html { redirect_to("/sam/product_list") }
      format.xml  { head :ok }
    end
  end
 ########################## Contract Review ################### 
 
   def cr_list
    @crs = ContractReview.find(:all)
    @form = 'crMain'
    @grid = true

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @crs }
    end
  end
  
  def cr_new
  puts "gfhgfhfhfgh"
 @calender=true
    @cr = ContractReview.new
    @prospects = Contact.find(:all)
    @mails = MailOutward.find(:all)
    @form = 'crForm'
     respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @cr }
    end
    
  end
  
  def cr_create
  @calender=true
  flash[:notice] = "Sucessfully saved"
    @form = 'crForm'
    cr = ContractReview.new(params[:cr])
    if cr.save
     flash.now[:notice] = "Sucessfully saved"
     redirect_to("/sam/cr_list")
    else
     redirect_to(:controller => "login" , :action => "login")
    end
  end
  
    def cr_edit
    @form = 'crForm'
    @cr = ContractReview.find(params[:id])
    @prospect = Contact.find(@cr.prospect_id.to_i)
  end
  
  
  
  def cr_update
    @cr = ContractReview.find(params[:id])
    @form = 'crForm'
    respond_to do |format|
      if @cr.update_attributes(params[:cr])
        flash[:notice] = 'Contract Review was successfully updated.'
       # format.html { redirect_to(@city) }
       format.html { redirect_to("/sam/cr_list") }
        format.xml  { head :ok }
      else
        format.html { render :action => "cr_edit" }
        format.xml  { render :xml => @cr.errors, :status => :unprocessable_entity }
      end
    end
  end

  def cr_delete
   @cr = ContractReview.find(params[:id])
    @cr.destroy
     @form = 'crForm'
    respond_to do |format|
      format.html { redirect_to("/sam/cr_list") }
      format.xml  { head :ok }
    end
  end
  
 
 
  ######################### Quatation #########################
  def quatation_list
    @quatations = Quatation.find(:all)
    @form = 'quatationdMain'
    @grid = true

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @quatations }
    end
  end
  
  def quatation_new
 
    @quatation = Quatation.new
    @prospects = Contact.find(:all)
    @mails = MailOutward.find(:all)
     flash[:notice] = "Sucessfully saved"
    @form = 'quatationForm'
  end
  
  def quatation_create
  flash[:notice] = "Sucessfully saved"
    @form = 'quatationForm'
    quatation = Quatation.new(params[:quatation])
    if quatation.save
     flash.now[:notice] = "Sucessfully saved"
     redirect_to("/sam/quatation_list")
    else
     redirect_to(:controller => "login" , :action => "login")
    end
  end
  
    def quatation_edit
    @form = 'quatationForm'
    @quatation = Quatation.find(params[:id])
    @prospect = Contact.find(:all)
  end
  
  
  
  def quatation_update
    @quatation = Quatation.find(params[:id])
    @form = 'quatationForm'
    respond_to do |format|
      if @quatation.update_attributes(params[:quatation])
        flash[:notice] = 'Quatation was successfully updated.'
       # format.html { redirect_to(@city) }
       format.html { redirect_to("/sam/quatation_list") }
        format.xml  { head :ok }
      else
        format.html { render :action => "quatation_edit" }
        format.xml  { render :xml => @quatation.errors, :status => :unprocessable_entity }
      end
    end
  end

  def quatation_delete
   @quatation = Quatation.find(params[:id])
    @quatation.destroy
     @form = 'quatationForm'
    respond_to do |format|
      format.html { redirect_to("/sam/quatation_list") }
      format.xml  { head :ok }
    end
  end
  #################  Purchase Order ######################
 def po_list
    @pos = PurchaseOrder.find(:all)
    @form = 'poMain'
    @grid = true

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @pos }
    end
  end
  
  def po_new
    @pos = PurchaseOrder.find(:all)
    @po = PurchaseOrder.new
    @po_details = PoDetails.new
    @product_items = ProductItem.find(:all)
    
#    @prospects = Contact.find(:all)
     flash[:notice] = "Sucessfully saved"
    @form = 'poForm'
    
    
  end
  
  def po_create
  flash[:notice] = "Sucessfully saved"
    @form = 'poForm'
    po = PurchaseOrder.new(params[:po])
    purcahseorderDetails = session[:purcahseorderDetails]
    if purcahseorderDetails != nil
      if po.save
         purcahseorderDetails.purchaseorderdetails_items.each do |item|
            pd = PoDetails.new
            pd.po_id = po.id
            pd.product_id = item.po_details.product_id
            pd.unit_price = item.po_details.unit_price
            pd.quantity = item.po_details.quantity
            pd.total_amount = item.po_details.total_amount
            pd.notes = item.po_details.notes
            pd.save
         end
         flash.now[:notice] = "Sucessfully saved"
         redirect_to("/sam/po_list")
      else
         redirect_to(:controller => "sam" , :action => "po_new")
      end    
    else
         redirect_to(:controller => "sam" , :action => "po_new")      
    end
  end
  
  def po_edit
    @form = 'poForm'
    @po = PurchaseOrder.find(params[:id])
#    @prospect = Contact.find(@mail_outward.prospect_id.to_i)
  end
  
  
  
  def po_update
    @po = PurchaseOrder.find(params[:id])
    @form = 'poForm'
    respond_to do |format|
      if @po.update_attributes(params[:po])
        flash[:notice] = 'Purchase Order was successfully updated.'
       # format.html { redirect_to(@city) }
       format.html { redirect_to("/sam/po_list") }
        format.xml  { head :ok }
      else
        format.html { render :action => "po_edit" }
        format.xml  { render :xml => @po.errors, :status => :unprocessable_entity }
      end
    end
  end

  def po_delete
   @po = MailOutward.find(params[:id])
    @po.destroy
     @form = 'poForm'
    respond_to do |format|
      format.html { redirect_to("/sam/po_list") }
      format.xml  { head :ok }
    end
  end
end