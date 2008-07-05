class StoreController < ApplicationController



def item_list
    @items = Item.find(:all)
    @form = 'itemMain'
    @grid = true

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @items }
    end
  end

  def item_new
    @item = Item.new
    @form = 'itemForm'

    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @item }
    end
  end

  def item_edit
  @form = 'itemForm'
    @item = Item.find(params[:id])
  end

  def item_create
    @item = Item.new(params[:item])
    @form = 'itemForm'
    respond_to do |format|
      if @item.save
        flash[:notice] = 'Item was successfully created.'
        #format.html { redirect_to(@city) }
        format.html { redirect_to("/store/item_list") }
        format.xml  { render :xml => @item, :status => :created, :location => @item }
      else
        format.html { render :action => "item_new" }
        format.xml  { render :xml => @item.errors, :status => :unprocessable_entity }
      end
    end
  end


def item_update
    @item = Item.find(params[:id])
    @form = 'itemForm'
    respond_to do |format|
      if @item.update_attributes(params[:item])
        flash[:notice] = 'Item was successfully updated.'
       # format.html { redirect_to(@city) }
       format.html { redirect_to("/store/item_list") }
        format.xml  { head :ok }
      else
        format.html { render :action => "item_edit" }
        format.xml  { render :xml => @item.errors, :status => :unprocessable_entity }
      end
    end
  end

  def item_delete
    @item = Item.find(params[:id])
    @form = 'itemForm'
    @item.destroy
    respond_to do |format|
      format.html { redirect_to("/store/item_list") }
      format.xml  { head :ok }
    end
  end

end
