#Finance And Accounts
class FaaController < ApplicationController
######################### Debit/Credit ######################
  def d_c_note_list
    @d_c_notes = DCNote.find(:all)
    @form = 'DC_NoteMain'
    @grid = true

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @d_c_notes }
    end
  end

  def d_c_note_new
    @d_c_note = DCNote.new
    @form = 'dcnoteForm'
#    @calender=true
    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @d_c_note }
    end
  end

  def d_c_note_edit
  @form = 'dcnoteForm'
    @d_c_note = DCNote.find(params[:id])
  end

  def d_c_note_create
    @d_c_note = DCNote.new(params[:dcn])
    @form = 'dcnoteForm'
    respond_to do |format|
      if @d_c_note.save
        flash[:notice] = 'Note was successfully created.'
        #format.html { redirect_to(@city) }
        format.html { redirect_to("/faa/d_c_note_list") }
        format.xml  { render :xml => @d_c_note, :status => :created, :location => @d_c_note }
      else
        format.html { render :action => "city_new" }
        format.xml  { render :xml => @d_c_note.errors, :status => :unprocessable_entity }
      end
    end
  end


def d_c_note_update
    @d_c_note = City.find(params[:id])
    @form = 'dcnoteForm'
    respond_to do |format|
      if @d_c_note.update_attributes(params[:dcn])
        flash[:notice] = 'Note was successfully updated.'
       # format.html { redirect_to(@city) }
       format.html { redirect_to("/faa/d_c_note_list") }
        format.xml  { head :ok }
      else
        format.html { render :action => "d_c_note_edit" }
        format.xml  { render :xml => @d_c_note.errors, :status => :unprocessable_entity }
      end
    end
  end

  def d_c_note_delete
    @d_c_note = City.find(params[:id])
    @d_c_note.destroy
    @form = 'dcnoteForm'
    respond_to do |format|
      format.html { redirect_to("/faa/d_c_note_list") }
      format.xml  { head :ok }
    end
  end
end





###########  Vendor Invoice #######################################

  def ven_inv_list
    @ven_invs = VendorInvoice.find(:all)
    @form = 'ven_invForm'
    @grid = true

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @ven_invs }
    end
  end

  def ven_inv_new
    @ven_inv = VendorInvoice.new
    @form = 'ven_invForm'
#    @calender=true
    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @ven_inv }
    end
  end

  def ven_inv_edit
  @form = 'ven_invForm'
    @d_c_note = DCNote.find(params[:id])
  end

  def ven_inv_create
    @d_c_note = DCNote.new(params[:dcn])
    @form = 'ven_invForm'
    respond_to do |format|
      if @d_c_note.save
        flash[:notice] = 'Note was successfully created.'
        #format.html { redirect_to(@city) }
        format.html { redirect_to("/faa/d_c_note_list") }
        format.xml  { render :xml => @d_c_note, :status => :created, :location => @d_c_note }
      else
        format.html { render :action => "city_new" }
        format.xml  { render :xml => @d_c_note.errors, :status => :unprocessable_entity }
      end
    end
  end


def ven_inv_update
    @d_c_note = City.find(params[:id])
    @form = 'ven_invForm'
    respond_to do |format|
      if @d_c_note.update_attributes(params[:dcn])
        flash[:notice] = 'Note was successfully updated.'
       # format.html { redirect_to(@city) }
       format.html { redirect_to("/faa/d_c_note_list") }
        format.xml  { head :ok }
      else
        format.html { render :action => "d_c_note_edit" }
        format.xml  { render :xml => @d_c_note.errors, :status => :unprocessable_entity }
      end
    end
  end

  def ven_inv_delete
    @d_c_note = City.find(params[:id])
    @d_c_note.destroy
    @form = 'ven_invForm'
    respond_to do |format|
      format.html { redirect_to("/faa/d_c_note_list") }
      format.xml  { head :ok }
    end
    
  end

